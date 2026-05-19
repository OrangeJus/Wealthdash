import { Router } from 'express';
import db from '../db/connection.js';
import { generateId, successResponse, errorResponse, safeInt, currentPeriod } from '../utils/helpers.js';

const router = Router();

/**
 * Helper: Recalculate a wallet's balance from all its transactions.
 * This is the source of truth — called after any transaction mutation.
 */
function recalculateWalletBalance(walletId: string): void {
  // Income adds to wallet, expense subtracts, transfer-from subtracts
  const incomeSum = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'income'`
  ).get(walletId) as { total: number };

  const expenseSum = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'expense'`
  ).get(walletId) as { total: number };

  const transferOutSum = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'transfer'`
  ).get(walletId) as { total: number };

  const transferInSum = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE to_wallet_id = ? AND type = 'transfer'`
  ).get(walletId) as { total: number };

  // Get the initial balance from settings or assume 0
  // In our system, the initial wallet balance is set at creation and stored.
  // Transactions modify relative to that initial balance.
  const wallet = db.prepare('SELECT balance FROM wallets WHERE id = ?').get(walletId) as any;
  if (!wallet) return;

  // We recalculate: initial_balance is stored separately, but for simplicity,
  // we track the absolute balance. On create, balance = initial_balance.
  // After that: balance = initial + SUM(income) - SUM(expense) - SUM(transfer_out) + SUM(transfer_in)
  // 
  // Since initial balance was already set at wallet creation and we compute from all transactions,
  // we need the initial balance. Let's store it in a separate approach:
  // Actually the simplest is: when wallet is created, its initial balance is recorded.
  // All subsequent changes happen through transactions.
  // So: current_balance = initial_balance + income - expense - transfer_out + transfer_in

  // For now, let's compute from initial_balance stored at creation
  // We'll need to track initial_balance. Let's use a simpler method:
  // recompute from the initial balance that we saved

  // REVISED APPROACH: wallet.balance is always the CURRENT computed balance.
  // We don't track initial_balance separately — instead, when creating a wallet with an initial balance,
  // we create a special "opening balance" income transaction.
  // So the formula is simply: balance = SUM(income) - SUM(expense) - SUM(transfer_out) + SUM(transfer_in)

  const newBalance = incomeSum.total - expenseSum.total - transferOutSum.total + transferInSum.total;

  db.prepare(`
    UPDATE wallets SET balance = ?, updated_at = datetime('now', 'localtime') WHERE id = ?
  `).run(newBalance, walletId);
}

// GET /api/transactions — List with filters & pagination
router.get('/', (req, res) => {
  const { type, category_id, wallet_id, date_from, date_to, period, page, limit: rawLimit } = req.query;
  const pageNum = safeInt(page, 1);
  const limitNum = safeInt(rawLimit, 20);
  const offset = (pageNum - 1) * limitNum;

  let whereClauses: string[] = [];
  let params: any[] = [];

  if (type) {
    whereClauses.push('t.type = ?');
    params.push(type);
  }
  if (category_id) {
    whereClauses.push('t.category_id = ?');
    params.push(category_id);
  }
  if (wallet_id) {
    whereClauses.push('(t.wallet_id = ? OR t.to_wallet_id = ?)');
    params.push(wallet_id, wallet_id);
  }
  if (date_from) {
    whereClauses.push('t.date >= ?');
    params.push(date_from);
  }
  if (date_to) {
    whereClauses.push('t.date <= ?');
    params.push(date_to);
  }
  if (period) {
    whereClauses.push("t.date LIKE ? || '%'");
    params.push(period);
  }

  const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  const totalRow = db.prepare(`SELECT COUNT(*) as count FROM transactions t ${whereSQL}`).get(...params) as { count: number };

  const transactions = db.prepare(`
    SELECT t.*, 
      c.name as category_name, c.icon as category_icon,
      w.name as wallet_name,
      tw.name as to_wallet_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
    ${whereSQL}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limitNum, offset);

  res.json(successResponse({
    transactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalRow.count,
      totalPages: Math.ceil(totalRow.count / limitNum),
    }
  }));
});

// GET /api/transactions/recent — 5 most recent for Dashboard
router.get('/recent', (_req, res) => {
  const transactions = db.prepare(`
    SELECT t.*, 
      c.name as category_name, c.icon as category_icon,
      w.name as wallet_name,
      tw.name as to_wallet_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT 5
  `).all();

  res.json(successResponse(transactions));
});

// POST /api/transactions — Create transaction
router.post('/', (req, res) => {
  const { date, type, amount, category_id, wallet_id, to_wallet_id, note } = req.body;

  if (!date || !type || !amount || !wallet_id) {
    res.status(400).json(errorResponse('date, type, amount, and wallet_id are required'));
    return;
  }

  if (!['income', 'expense', 'transfer'].includes(type)) {
    res.status(400).json(errorResponse('type must be income, expense, or transfer'));
    return;
  }

  if (type === 'transfer' && !to_wallet_id) {
    res.status(400).json(errorResponse('to_wallet_id is required for transfer'));
    return;
  }

  if (type === 'transfer' && wallet_id === to_wallet_id) {
    res.status(400).json(errorResponse('Cannot transfer to the same wallet'));
    return;
  }

  // Validate wallet exists and has sufficient balance for expense/transfer
  const wallet = db.prepare('SELECT id, balance FROM wallets WHERE id = ?').get(wallet_id) as any;
  if (!wallet) {
    res.status(404).json(errorResponse('Source wallet not found'));
    return;
  }

  const parsedAmount = safeInt(amount);
  if ((type === 'transfer' || type === 'expense') && wallet.balance < parsedAmount) {
    res.status(400).json(errorResponse(`Saldo tidak mencukupi untuk ${type === 'transfer' ? 'transfer' : 'pengeluaran'} ini`));
    return;
  }

  if (to_wallet_id) {
    const toWallet = db.prepare('SELECT id FROM wallets WHERE id = ?').get(to_wallet_id);
    if (!toWallet) {
      res.status(404).json(errorResponse('Destination wallet not found'));
      return;
    }
  }

  const id = generateId();

  // Use a transaction (database transaction) to ensure atomicity
  const insertTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO transactions (id, date, type, amount, category_id, wallet_id, to_wallet_id, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, date, type, safeInt(amount), category_id || null, wallet_id, to_wallet_id || null, note || null);

    // Recalculate affected wallet(s)
    recalculateWalletBalance(wallet_id);
    if (to_wallet_id) {
      recalculateWalletBalance(to_wallet_id);
    }
  });

  insertTx();

  const transaction = db.prepare(`
    SELECT t.*, c.name as category_name, w.name as wallet_name, tw.name as to_wallet_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
    WHERE t.id = ?
  `).get(id);

  res.status(201).json(successResponse(transaction, 'Transaction created'));
});

// PUT /api/transactions/:id — Update transaction
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json(errorResponse('Transaction not found'));
    return;
  }

  const { date, type, amount, category_id, wallet_id, to_wallet_id, note } = req.body;

  const newType = type || existing.type;
  const newAmount = amount ? safeInt(amount) : existing.amount;
  const newWalletId = wallet_id || existing.wallet_id;

  if (newType === 'expense' || newType === 'transfer') {
    const wallet = db.prepare('SELECT id, balance FROM wallets WHERE id = ?').get(newWalletId) as any;
    if (!wallet) {
      res.status(404).json(errorResponse('Source wallet not found'));
      return;
    }
    
    // Calculate effective balance if the old transaction were reverted
    let availableBalance = wallet.balance;
    if (newWalletId === existing.wallet_id) {
      if (existing.type === 'expense' || existing.type === 'transfer') {
        availableBalance += existing.amount;
      } else if (existing.type === 'income') {
        availableBalance -= existing.amount;
      }
    }

    if (availableBalance < newAmount) {
      res.status(400).json(errorResponse(`Saldo tidak mencukupi untuk update ${newType === 'transfer' ? 'transfer' : 'pengeluaran'} ini`));
      return;
    }
  }

  const updateTx = db.transaction(() => {
    db.prepare(`
      UPDATE transactions
      SET date = COALESCE(?, date),
          type = COALESCE(?, type),
          amount = COALESCE(?, amount),
          category_id = COALESCE(?, category_id),
          wallet_id = COALESCE(?, wallet_id),
          to_wallet_id = ?,
          note = ?
      WHERE id = ?
    `).run(
      date, type, amount ? safeInt(amount) : null, category_id,
      wallet_id, to_wallet_id ?? existing.to_wallet_id, note ?? existing.note,
      req.params.id
    );

    // Recalculate ALL affected wallets (old and new)
    const affectedWallets = new Set<string>();
    affectedWallets.add(existing.wallet_id);
    if (existing.to_wallet_id) affectedWallets.add(existing.to_wallet_id);
    if (wallet_id) affectedWallets.add(wallet_id);
    if (to_wallet_id) affectedWallets.add(to_wallet_id);

    for (const wId of affectedWallets) {
      recalculateWalletBalance(wId);
    }
  });

  updateTx();

  const updated = db.prepare(`
    SELECT t.*, c.name as category_name, w.name as wallet_name, tw.name as to_wallet_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
    WHERE t.id = ?
  `).get(req.params.id);

  res.json(successResponse(updated, 'Transaction updated'));
});

// DELETE /api/transactions/:id — Delete transaction
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json(errorResponse('Transaction not found'));
    return;
  }

  const deleteTx = db.transaction(() => {
    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);

    recalculateWalletBalance(existing.wallet_id);
    if (existing.to_wallet_id) {
      recalculateWalletBalance(existing.to_wallet_id);
    }
  });

  deleteTx();
  res.json(successResponse(null, 'Transaction deleted'));
});

export default router;
