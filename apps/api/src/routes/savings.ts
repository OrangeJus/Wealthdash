import { Router } from 'express';
import db from '../db/connection.js';
import { generateId, successResponse, errorResponse, safeInt, currentPeriod, recalculateWalletBalance } from '../utils/helpers.js';

const router = Router();

// ──────────────────────────────────────────
// Auto-migrate: add transaction_id column to savings_deposits
// ──────────────────────────────────────────
try { db.prepare(`ALTER TABLE savings_deposits ADD COLUMN transaction_id TEXT`).run(); } catch (_) {}

// ──────────────────────────────────────────
// Helper: find the savings wallet (cluster = 'savings')
// ──────────────────────────────────────────
function getSavingsWallet(): any {
  return db.prepare(`SELECT * FROM wallets WHERE cluster = 'savings' LIMIT 1`).get();
}

// ──────────────────────────────────────────
// Helper: read global savings target from settings
// ──────────────────────────────────────────
function getGlobalTarget(): number {
  const row = db.prepare(`SELECT value FROM settings WHERE key = 'savings_target'`).get() as { value: string } | undefined;
  return parseInt(row?.value || '0');
}

// ──────────────────────────────────────────
// Helper: find or create a default savings target row
// ──────────────────────────────────────────
function getDefaultTargetId(): string {
  const existing = db.prepare(`SELECT id FROM savings_targets LIMIT 1`).get() as any;
  if (existing) return existing.id;

  // Create a default target if none exists
  const id = generateId();
  db.prepare(`
    INSERT INTO savings_targets (id, name, icon, monthly_amount, is_active)
    VALUES (?, 'Tabungan', 'savings', 1, 1)
  `).run(id);
  return id;
}

// ============================================================
// GET /api/savings/targets — List all savings targets
// ============================================================
router.get('/targets', (_req, res) => {
  const targets = db.prepare(`
    SELECT * FROM savings_targets ORDER BY is_active DESC, name ASC
  `).all();

  res.json(successResponse(targets));
});

// ============================================================
// POST /api/savings/targets — Create savings target
// ============================================================
router.post('/targets', (req, res) => {
  const { name, icon, monthly_amount } = req.body;

  if (!name || !monthly_amount || safeInt(monthly_amount) <= 0) {
    res.status(400).json(errorResponse('Name and valid monthly_amount are required'));
    return;
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO savings_targets (id, name, icon, monthly_amount)
    VALUES (?, ?, ?, ?)
  `).run(id, name, icon || 'savings', safeInt(monthly_amount));

  const target = db.prepare('SELECT * FROM savings_targets WHERE id = ?').get(id);
  res.status(201).json(successResponse(target, 'Savings target created'));
});

// ============================================================
// PUT /api/savings/targets/:id — Update savings target
// ============================================================
router.put('/targets/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM savings_targets WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json(errorResponse('Savings target not found'));
    return;
  }

  const { name, icon, monthly_amount, is_active } = req.body;

  db.prepare(`
    UPDATE savings_targets
    SET name = COALESCE(?, name),
        icon = COALESCE(?, icon),
        monthly_amount = COALESCE(?, monthly_amount),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(name, icon, monthly_amount ? safeInt(monthly_amount) : null, is_active !== undefined ? (is_active ? 1 : 0) : null, req.params.id);

  const updated = db.prepare('SELECT * FROM savings_targets WHERE id = ?').get(req.params.id);
  res.json(successResponse(updated, 'Savings target updated'));
});

// ============================================================
// GET /api/savings/progress?period=YYYY-MM
// Uses GLOBAL target from settings (not per-target sum)
// ============================================================
router.get('/progress', (req, res) => {
  const period = (req.query.period as string) || currentPeriod();

  // Use global target from settings
  const totalTarget = getGlobalTarget();

  // Keep targets list for backward compat but not used for calculation
  const targets = db.prepare('SELECT * FROM savings_targets WHERE is_active = 1').all() as any[];

  // Total deposited this month
  const deposited = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM savings_deposits WHERE period = ?'
  ).get(period) as { total: number };

  // Deposits grouped by type
  const routineTotal = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM savings_deposits WHERE period = ? AND type = 'routine'`
  ).get(period) as { total: number };

  const topupTotal = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM savings_deposits WHERE period = ? AND type = 'topup'`
  ).get(period) as { total: number };

  // Calculate rollover from previous months
  const prevMonths = db.prepare(`
    SELECT sd.period, 
      COALESCE(SUM(sd.amount), 0) as deposited
    FROM savings_deposits sd
    WHERE sd.period < ?
    GROUP BY sd.period
    ORDER BY sd.period ASC
  `).all(period) as any[];

  let rollover = 0;
  for (const pm of prevMonths) {
    const deficit = totalTarget - pm.deposited;
    if (deficit > 0) {
      rollover += deficit;
    }
  }

  const effectiveTarget = totalTarget + rollover;
  const remaining = Math.max(0, effectiveTarget - deposited.total);
  const percentage = effectiveTarget > 0 ? Math.min(100, (deposited.total / effectiveTarget) * 100) : 0;

  res.json(successResponse({
    period,
    targets,
    totalTarget,
    routineDeposited: routineTotal.total,
    topupDeposited: topupTotal.total,
    totalDeposited: deposited.total,
    rollover,
    effectiveTarget,
    remaining,
    percentage: parseFloat(percentage.toFixed(1)),
  }));
});

// ============================================================
// POST /api/savings/deposit — Make a deposit
// Auto-fills target_id, auto-creates transfer transaction
// ============================================================
router.post('/deposit', (req, res) => {
  const { target_id, wallet_id, period, amount, type } = req.body;

  if (!wallet_id || !amount || !type) {
    res.status(400).json(errorResponse('wallet_id, amount, and type are required'));
    return;
  }

  if (!['routine', 'topup'].includes(type)) {
    res.status(400).json(errorResponse('type must be routine or topup'));
    return;
  }

  // Use provided target_id or fall back to default
  const effectiveTargetId = target_id || getDefaultTargetId();

  // Validate target exists
  const target = db.prepare('SELECT id FROM savings_targets WHERE id = ?').get(effectiveTargetId);
  if (!target) {
    res.status(404).json(errorResponse('Savings target not found'));
    return;
  }

  // Validate source wallet
  const sourceWallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(wallet_id) as any;
  if (!sourceWallet) {
    res.status(404).json(errorResponse('Wallet not found'));
    return;
  }

  const parsedAmount = safeInt(amount);
  const savingsWallet = getSavingsWallet();
  const depositId = generateId();
  const depositPeriod = period || currentPeriod();
  let transactionId: string | null = null;

  const depositTx = db.transaction(() => {
    // If source wallet is NOT the savings wallet → create a transfer transaction
    if (savingsWallet && sourceWallet.id !== savingsWallet.id) {
      // Check sufficient balance
      if (sourceWallet.balance < parsedAmount) {
        throw new Error('Saldo dompet tidak mencukupi');
      }

      transactionId = generateId();
      const txDate = new Date().toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO transactions (id, date, type, amount, category_id, wallet_id, to_wallet_id, note)
        VALUES (?, ?, 'transfer', ?, NULL, ?, ?, ?)
      `).run(transactionId, txDate, parsedAmount, sourceWallet.id, savingsWallet.id, 'Menabung');

      // Recalculate both wallet balances
      recalculateWalletBalance(sourceWallet.id);
      recalculateWalletBalance(savingsWallet.id);
    }
    // If source IS savings wallet → no transfer needed (money already there)

    // Record the deposit
    db.prepare(`
      INSERT INTO savings_deposits (id, target_id, wallet_id, period, amount, type, transaction_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(depositId, effectiveTargetId, wallet_id, depositPeriod, parsedAmount, type, transactionId);
  });

  try {
    depositTx();
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
    return;
  }

  const deposit = db.prepare('SELECT * FROM savings_deposits WHERE id = ?').get(depositId);
  res.status(201).json(successResponse(deposit, 'Deposit recorded'));
});

// ============================================================
// GET /api/savings/deposits — List all deposit records (for history)
// ============================================================
router.get('/deposits', (_req, res) => {
  const deposits = db.prepare(`
    SELECT sd.*, w.name as wallet_name
    FROM savings_deposits sd
    LEFT JOIN wallets w ON sd.wallet_id = w.id
    ORDER BY sd.created_at DESC
  `).all();

  res.json(successResponse(deposits));
});

// ============================================================
// PUT /api/savings/deposits/:id — Edit a deposit record
// Syncs wallet balances if a linked transfer exists
// ============================================================
router.put('/deposits/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM savings_deposits WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json(errorResponse('Deposit not found'));
    return;
  }

  const { amount, wallet_id } = req.body;
  const newAmount = amount ? safeInt(amount) : existing.amount;
  const newWalletId = wallet_id || existing.wallet_id;
  const savingsWallet = getSavingsWallet();
  if (savingsWallet && newWalletId !== savingsWallet.id) {
    const wallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(newWalletId) as any;
    if (!wallet) {
      res.status(404).json(errorResponse('Source wallet not found'));
      return;
    }
    
    let availableBalance = wallet.balance;
    if (newWalletId === existing.wallet_id) {
      availableBalance += existing.amount;
    }
    
    if (availableBalance < newAmount) {
      res.status(400).json(errorResponse('Saldo dompet tidak mencukupi'));
      return;
    }
  }

  const updateTx = db.transaction(() => {
    const oldTransactionId = existing.transaction_id;
    let newTransactionId = oldTransactionId;

    // Case 1: Old deposit had a linked transfer
    if (oldTransactionId) {
      if (savingsWallet && newWalletId !== savingsWallet.id) {
        // Still a non-savings wallet → update the existing transfer
        const oldTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(oldTransactionId) as any;
        db.prepare(`
          UPDATE transactions SET amount = ?, wallet_id = ?, note = 'Menabung' WHERE id = ?
        `).run(newAmount, newWalletId, oldTransactionId);

        // Recalculate all affected wallets
        const affectedWallets = new Set<string>();
        if (oldTx) {
          affectedWallets.add(oldTx.wallet_id);
          if (oldTx.to_wallet_id) affectedWallets.add(oldTx.to_wallet_id);
        }
        affectedWallets.add(newWalletId);
        if (savingsWallet) affectedWallets.add(savingsWallet.id);
        for (const wId of affectedWallets) recalculateWalletBalance(wId);
      } else {
        // Changed to savings wallet → remove the transfer (no longer needed)
        const oldTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(oldTransactionId) as any;
        db.prepare('DELETE FROM transactions WHERE id = ?').run(oldTransactionId);
        if (oldTx) {
          recalculateWalletBalance(oldTx.wallet_id);
          if (oldTx.to_wallet_id) recalculateWalletBalance(oldTx.to_wallet_id);
        }
        newTransactionId = null;
      }
    }
    // Case 2: Old deposit had no linked transfer (was from savings wallet)
    else {
      if (savingsWallet && newWalletId !== savingsWallet.id) {
        // Changed to non-savings wallet → create a new transfer
        const newSourceWallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(newWalletId) as any;
        if (newSourceWallet && newSourceWallet.balance < newAmount) {
          throw new Error('Saldo dompet tidak mencukupi');
        }

        newTransactionId = generateId();
        const txDate = new Date().toISOString().split('T')[0];
        db.prepare(`
          INSERT INTO transactions (id, date, type, amount, category_id, wallet_id, to_wallet_id, note)
          VALUES (?, ?, 'transfer', ?, NULL, ?, ?, 'Menabung')
        `).run(newTransactionId, txDate, newAmount, newWalletId, savingsWallet.id);

        recalculateWalletBalance(newWalletId);
        recalculateWalletBalance(savingsWallet.id);
      }
      // Still savings wallet → no transfer needed
    }

    // Update the deposit record
    db.prepare(`
      UPDATE savings_deposits
      SET amount = ?, wallet_id = ?, transaction_id = ?
      WHERE id = ?
    `).run(newAmount, newWalletId, newTransactionId, req.params.id);
  });

  try {
    updateTx();
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
    return;
  }

  const updated = db.prepare(`
    SELECT sd.*, w.name as wallet_name
    FROM savings_deposits sd
    LEFT JOIN wallets w ON sd.wallet_id = w.id
    WHERE sd.id = ?
  `).get(req.params.id);
  res.json(successResponse(updated, 'Deposit updated'));
});

// ============================================================
// DELETE /api/savings/deposits/:id — Delete a deposit record
// Removes linked transfer and syncs wallet balances
// ============================================================
router.delete('/deposits/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM savings_deposits WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json(errorResponse('Deposit not found'));
    return;
  }

  const deleteTx = db.transaction(() => {
    // If there's a linked transfer transaction, delete it and recalculate
    if (existing.transaction_id) {
      const linkedTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(existing.transaction_id) as any;
      if (linkedTx) {
        db.prepare('DELETE FROM transactions WHERE id = ?').run(existing.transaction_id);
        recalculateWalletBalance(linkedTx.wallet_id);
        if (linkedTx.to_wallet_id) {
          recalculateWalletBalance(linkedTx.to_wallet_id);
        }
      }
    }

    // Delete the deposit record
    db.prepare('DELETE FROM savings_deposits WHERE id = ?').run(req.params.id);
  });

  deleteTx();
  res.json(successResponse(null, 'Deposit deleted'));
});

// ============================================================
// GET /api/savings/history — Rollover history for all past months
// Uses GLOBAL target from settings
// ============================================================
router.get('/history', (_req, res) => {
  const period = currentPeriod();
  const totalTarget = getGlobalTarget();

  const monthlyData = db.prepare(`
    SELECT period, SUM(amount) as achieved
    FROM savings_deposits
    WHERE period <= ?
    GROUP BY period
    ORDER BY period DESC
    LIMIT 12
  `).all(period) as any[];

  let cumulativeRollover = 0;
  const history = monthlyData.reverse().map((row: any) => {
    const deficit = Math.max(0, totalTarget - row.achieved);
    const carriedForward = deficit > 0 ? deficit : 0;
    cumulativeRollover += carriedForward;

    return {
      month: row.period,
      target: totalTarget,
      achieved: row.achieved,
      deficit,
      carriedForward: cumulativeRollover,
    };
  }).reverse(); // Show newest first

  res.json(successResponse(history));
});

export default router;
