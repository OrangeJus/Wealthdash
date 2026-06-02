import { Router } from 'express';
import db from '../db/connection.js';
import { generateId, successResponse, errorResponse, safeInt, validateLogoSizeAndFormat } from '../utils/helpers.js';

const router = Router();

// GET /api/wallets — List all wallets
router.get('/', (_req, res) => {
  const wallets = db.prepare(`
    SELECT id, name, icon, logo_path, cluster, balance, created_at, updated_at
    FROM wallets
    ORDER BY 
      CASE cluster WHEN 'liquid' THEN 1 WHEN 'savings' THEN 2 WHEN 'investment' THEN 3 END,
      name ASC
  `).all();

  // Compute totals per cluster
  const totals = db.prepare(`
    SELECT cluster, SUM(balance) as total
    FROM wallets
    GROUP BY cluster
  `).all() as { cluster: string; total: number }[];

  const totalBalance = wallets.reduce((sum: number, w: any) => sum + w.balance, 0);

  res.json(successResponse({
    wallets,
    totals: Object.fromEntries(totals.map(t => [t.cluster, t.total])),
    totalBalance,
  }));
});

// GET /api/wallets/:id — Get wallet detail
router.get('/:id', (req, res) => {
  const wallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(req.params.id);
  if (!wallet) {
    res.status(404).json(errorResponse('Wallet not found'));
    return;
  }
  res.json(successResponse(wallet));
});

// POST /api/wallets — Create wallet
router.post('/', (req, res) => {
  const { name, icon, logo_path, cluster, balance } = req.body;

  if (!name || !cluster) {
    res.status(400).json(errorResponse('Name and cluster are required'));
    return;
  }

  if (!['liquid', 'savings', 'investment'].includes(cluster)) {
    res.status(400).json(errorResponse('Cluster must be liquid, savings, or investment'));
    return;
  }

  // Validate logo size & format
  const logoValidation = validateLogoSizeAndFormat(logo_path);
  if (!logoValidation.isValid) {
    res.status(400).json(errorResponse(logoValidation.error || 'Invalid logo'));
    return;
  }

  const id = generateId();
  const initialBalance = safeInt(balance) || 0;

  // Use a database transaction for atomicity
  const createWalletTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO wallets (id, name, icon, logo_path, cluster, balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, icon || 'account_balance_wallet', logo_path || null, cluster, initialBalance);

    // If wallet has an initial balance, create an "opening balance" income transaction
    // so that recalculateWalletBalance (which computes from transactions) stays correct.
    if (initialBalance > 0) {
      const txId = generateId();
      const today = new Date().toISOString().split('T')[0];
      db.prepare(`
        INSERT INTO transactions (id, date, type, amount, category_id, wallet_id, to_wallet_id, note)
        VALUES (?, ?, 'income', ?, NULL, ?, NULL, ?)
      `).run(txId, today, initialBalance, id, 'Saldo awal');
    }
  });

  createWalletTx();

  const wallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(id);
  res.status(201).json(successResponse(wallet, 'Wallet created'));
});

// PUT /api/wallets/:id — Update wallet
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM wallets WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json(errorResponse('Wallet not found'));
    return;
  }

  const { name, icon, logo_path, cluster } = req.body;

  // Validate logo size & format
  const logoValidation = validateLogoSizeAndFormat(logo_path);
  if (!logoValidation.isValid) {
    res.status(400).json(errorResponse(logoValidation.error || 'Invalid logo'));
    return;
  }

  db.prepare(`
    UPDATE wallets 
    SET name = COALESCE(?, name),
        icon = COALESCE(?, icon),
        logo_path = COALESCE(?, logo_path),
        cluster = COALESCE(?, cluster),
        updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(name, icon, logo_path, cluster, req.params.id);

  const wallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(req.params.id);
  res.json(successResponse(wallet, 'Wallet updated'));
});

// DELETE /api/wallets/:id — Delete wallet
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM wallets WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json(errorResponse('Wallet not found'));
    return;
  }

  // Check if wallet has transactions
  const txCount = db.prepare(
    'SELECT COUNT(*) as count FROM transactions WHERE wallet_id = ? OR to_wallet_id = ?'
  ).get(req.params.id, req.params.id) as { count: number };

  if (txCount.count > 0) {
    res.status(409).json(errorResponse(
      `Cannot delete wallet with ${txCount.count} linked transactions. Delete transactions first.`
    ));
    return;
  }

  db.prepare('DELETE FROM wallets WHERE id = ?').run(req.params.id);
  res.json(successResponse(null, 'Wallet deleted'));
});

export default router;
