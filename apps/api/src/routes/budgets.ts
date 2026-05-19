import { Router } from 'express';
import db from '../db/connection.js';
import { generateId, successResponse, errorResponse, currentPeriod } from '../utils/helpers.js';

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
  const existing = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json(errorResponse('Budget item not found'));
    return;
  }

  const newStatus = existing.is_done ? 0 : 1;

  if (newStatus === 1) {
    // Marking as DONE → auto-create expense transaction
    // Find the first available wallet for this transaction
    const wallet = db.prepare(`SELECT id FROM wallets WHERE cluster = 'liquid' ORDER BY balance DESC LIMIT 1`).get() as any;
    
    if (wallet) {
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

      // Create the transaction
      db.prepare(`
        INSERT INTO transactions (id, date, type, amount, category_id, wallet_id, note)
        VALUES (?, ?, 'expense', ?, ?, ?, ?)
      `).run(txId, today, existing.estimate, categoryId, wallet.id, note);

      // Deduct from wallet balance
      db.prepare(`UPDATE wallets SET balance = balance - ?, updated_at = datetime('now','localtime') WHERE id = ?`)
        .run(existing.estimate, wallet.id);

      // Link the transaction to the budget
      db.prepare('UPDATE budgets SET is_done = 1, linked_transaction_id = ? WHERE id = ?').run(txId, req.params.id);
    } else {
      // No wallet available — just mark as done without transaction
      db.prepare('UPDATE budgets SET is_done = 1 WHERE id = ?').run(req.params.id);
    }
  } else {
    // Marking as NOT DONE → delete the linked transaction
    if (existing.linked_transaction_id) {
      const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(existing.linked_transaction_id) as any;
      if (tx) {
        // Refund the wallet balance
        db.prepare(`UPDATE wallets SET balance = balance + ?, updated_at = datetime('now','localtime') WHERE id = ?`)
          .run(tx.amount, tx.wallet_id);
        // Delete the transaction
        db.prepare('DELETE FROM transactions WHERE id = ?').run(existing.linked_transaction_id);
      }
    }
    db.prepare('UPDATE budgets SET is_done = 0, linked_transaction_id = NULL WHERE id = ?').run(req.params.id);
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

  // If there's a linked transaction, delete it and refund
  if (existing.linked_transaction_id) {
    const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(existing.linked_transaction_id) as any;
    if (tx) {
      db.prepare(`UPDATE wallets SET balance = balance + ?, updated_at = datetime('now','localtime') WHERE id = ?`)
        .run(tx.amount, tx.wallet_id);
      db.prepare('DELETE FROM transactions WHERE id = ?').run(existing.linked_transaction_id);
    }
  }

  db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
  res.json(successResponse(null, 'Budget item deleted'));
});

export default router;
