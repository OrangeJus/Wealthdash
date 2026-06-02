import { Router } from 'express';
import db from '../db/connection.js';
import { generateId, successResponse, errorResponse, currentPeriod, recalculateWalletBalance } from '../utils/helpers.js';

const router = Router();

// Ensure linked_transaction_id column exists (migration)
try {
  db.prepare(`ALTER TABLE budgets ADD COLUMN linked_transaction_id TEXT`).run();
} catch (_) {
  // Column already exists, ignore
}

// GET /api/budgets?period=YYYY-MM — List budgets for a period
router.get('/', (req, res) => {
  const period = (req.query.period as string) || currentPeriod();

  // Auto-copy logic: if no budgets of type 'wajib' or 'langganan' exist for this period, copy from the latest period
  const countResult = db.prepare("SELECT COUNT(*) as cnt FROM budgets WHERE period = ? AND type IN ('wajib', 'langganan')").get(period) as { cnt: number };
  if (countResult.cnt === 0) {
    // Find the latest period that has budget items
    const latestPeriod = db.prepare(
      `SELECT period FROM budgets WHERE period < ? AND type IN ('wajib', 'langganan') ORDER BY period DESC LIMIT 1`
    ).get(period) as { period: string } | undefined;

    if (latestPeriod) {
      const itemsToCopy = db.prepare(
        `SELECT name, category, type, estimate, details FROM budgets WHERE period = ? AND type IN ('wajib', 'langganan')`
      ).all(latestPeriod.period) as any[];

      const insert = db.prepare(`
        INSERT INTO budgets (id, name, category, type, estimate, details, period, is_done)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `);

      const insertTx = db.transaction((items: any[]) => {
        for (const item of items) {
          insert.run(generateId(), item.name, item.category, item.type, item.estimate, item.details, period);
        }
      });
      insertTx(itemsToCopy);
    }
  }

  const budgets = db.prepare(`
    SELECT * FROM budgets WHERE period = ? ORDER BY type, is_done ASC, name ASC
  `).all(period);

  const bills = budgets.filter((b: any) => b.type !== 'wishlist');
  const wishlist = budgets.filter((b: any) => b.type === 'wishlist');

  // Calculate summary
  const totalEstimate = bills.reduce((sum: number, b: any) => sum + b.estimate, 0);
  const paidTotal = bills.filter((b: any) => b.is_done).reduce((sum: number, b: any) => sum + b.estimate, 0);
  const unpaidCount = bills.filter((b: any) => !b.is_done).length;

  res.json(successResponse({
    bills,
    wishlist,
    summary: { totalEstimate, paidTotal, unpaidCount },
    period,
  }));
});

// POST /api/budgets — Create budget item
router.post('/', (req, res) => {
  const { name, category, type, estimate, details, period } = req.body;

  if (!name || !type) {
    res.status(400).json(errorResponse('Name and type are required'));
    return;
  }

  if (!['wajib', 'langganan', 'wishlist'].includes(type)) {
    res.status(400).json(errorResponse('Type must be wajib, langganan, or wishlist'));
    return;
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO budgets (id, name, category, type, estimate, details, period)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, category || null, type, estimate || 0, details ? JSON.stringify(details) : null, period || currentPeriod());

  const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
  res.status(201).json(successResponse(budget, 'Budget item created'));
});

// PUT /api/budgets/:id — Update budget item
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json(errorResponse('Budget item not found'));
    return;
  }

  const { name, category, estimate, details } = req.body;

  db.prepare(`
    UPDATE budgets
    SET name = COALESCE(?, name),
        category = COALESCE(?, category),
        estimate = COALESCE(?, estimate),
        details = COALESCE(?, details)
    WHERE id = ?
  `).run(name, category, estimate, details ? JSON.stringify(details) : null, req.params.id);

  const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
  res.json(successResponse(updated, 'Budget item updated'));
});

// PATCH /api/budgets/:id/toggle — Toggle paid/bought status
// When checking: auto-create an expense transaction
// When unchecking: auto-delete the linked transaction
router.patch('/:id/toggle', (req, res) => {
  const { wallet_id } = req.body || {};
  const existing = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json(errorResponse('Budget item not found'));
    return;
  }

  const newStatus = existing.is_done ? 0 : 1;

  if (newStatus === 1) {
    // Marking as DONE → auto-create expense transaction
    // Priority: 1) wallet_id from request body, 2) default_wallet from settings, 3) first liquid wallet
    let walletId = wallet_id;
    if (!walletId) {
      const defaultSetting = db.prepare(`SELECT value FROM settings WHERE key = 'default_wallet'`).get() as { value: string } | undefined;
      walletId = defaultSetting?.value;
    }
    if (!walletId) {
      const firstLiquid = db.prepare(`SELECT id FROM wallets WHERE cluster = 'liquid' ORDER BY balance DESC LIMIT 1`).get() as { id: string } | undefined;
      walletId = firstLiquid?.id;
    }

    const wallet = walletId ? db.prepare('SELECT * FROM wallets WHERE id = ?').get(walletId) as any : null;
    
    if (wallet) {
      if (wallet.balance < existing.estimate) {
        res.status(400).json(errorResponse('Saldo dompet tidak mencukupi'));
        return;
      }
      const txId = generateId();
      const today = new Date().toISOString().substring(0, 10);
      const typeLabel = existing.type === 'wishlist' ? 'Pembelian' : 'Pembayaran';
      const note = `${typeLabel}: ${existing.name}`;

      // Find matching category if available
      let categoryId = null;
      if (existing.category) {
        const cat = db.prepare(`SELECT id FROM categories WHERE name = ? AND type = 'expense' LIMIT 1`).get(existing.category) as any;
        if (cat) categoryId = cat.id;
      }

      const toggleOn = db.transaction(() => {
        // Create the transaction
        db.prepare(`
          INSERT INTO transactions (id, date, type, amount, category_id, wallet_id, note)
          VALUES (?, ?, 'expense', ?, ?, ?, ?)
        `).run(txId, today, existing.estimate, categoryId, wallet.id, note);

        // Recalculate wallet balance (recalculates from all transactions)
        recalculateWalletBalance(wallet.id);

        // Link the transaction to the budget
        db.prepare('UPDATE budgets SET is_done = 1, linked_transaction_id = ? WHERE id = ?').run(txId, req.params.id);
      });
      toggleOn();
    } else {
      // No wallet available — just mark as done without transaction
      db.prepare('UPDATE budgets SET is_done = 1 WHERE id = ?').run(req.params.id);
    }
  } else {
    // Marking as NOT DONE → delete the linked transaction
    const toggleOff = db.transaction(() => {
      if (existing.linked_transaction_id) {
        const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(existing.linked_transaction_id) as any;
        if (tx) {
          // Delete the transaction
          db.prepare('DELETE FROM transactions WHERE id = ?').run(existing.linked_transaction_id);
          // Recalculate wallet balance
          recalculateWalletBalance(tx.wallet_id);
        }
      }
      db.prepare('UPDATE budgets SET is_done = 0, linked_transaction_id = NULL WHERE id = ?').run(req.params.id);
    });
    toggleOff();
  }

  const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
  res.json(successResponse(updated, `Item marked as ${newStatus ? 'done' : 'pending'}`));
});

// DELETE /api/budgets/:id — Delete budget item
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json(errorResponse('Budget item not found'));
    return;
  }

  const deleteBudgetTx = db.transaction(() => {
    // If there's a linked transaction, delete it and refund
    if (existing.linked_transaction_id) {
      const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(existing.linked_transaction_id) as any;
      if (tx) {
        db.prepare('DELETE FROM transactions WHERE id = ?').run(existing.linked_transaction_id);
        recalculateWalletBalance(tx.wallet_id);
      }
    }
    db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
  });
  
  deleteBudgetTx();
  res.json(successResponse(null, 'Budget item deleted'));
});

export default router;
