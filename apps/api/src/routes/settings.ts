import { Router } from 'express';
import db from '../db/connection.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

const router = Router();

// GET /api/settings — Get all settings
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(successResponse(settings));
});

// PUT /api/settings/:key — Update a setting
router.put('/:key', (req, res) => {
  const { value } = req.body;

  if (value === undefined || value === null) {
    res.status(400).json(errorResponse('value is required'));
    return;
  }

  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(req.params.key, String(value));

  res.json(successResponse({ key: req.params.key, value: String(value) }, 'Setting updated'));
});

// DELETE /api/settings/reset — Reset ALL data
router.delete('/reset', (_req, res) => {
  const resetTx = db.transaction(() => {
    db.prepare('DELETE FROM stock_trades').run();
    db.prepare('DELETE FROM stock_holdings').run();
    db.prepare('DELETE FROM savings_deposits').run();
    db.prepare('DELETE FROM savings_targets').run();
    db.prepare('DELETE FROM budgets').run();
    db.prepare('DELETE FROM transactions').run();
    db.prepare('DELETE FROM categories').run();
    db.prepare('DELETE FROM wallets').run();
    // Reset settings to defaults
    db.prepare('DELETE FROM settings').run();
    db.prepare("INSERT INTO settings (key, value) VALUES ('expense_limit', '3000000')").run();
    db.prepare("INSERT INTO settings (key, value) VALUES ('savings_target', '250000')").run();
  });

  resetTx();
  res.json(successResponse(null, 'All data has been reset'));
});

export default router;
