import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

/**
 * Helper: Convert array of objects to CSV string.
 */
function toCSV(rows: Record<string, any>[], columns?: string[]): string {
  if (rows.length === 0) return '';
  const headers = columns || Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        // Escape CSV values containing commas or quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ),
  ];
  return lines.join('\n');
}

// GET /api/export/transactions — Export all transactions as CSV
router.get('/transactions', (_req, res) => {
  const transactions = db.prepare(`
    SELECT 
      t.date as Tanggal,
      t.type as Tipe,
      t.amount as Nominal,
      COALESCE(c.name, '-') as Kategori,
      w.name as Dompet,
      COALESCE(tw.name, '-') as "Dompet Tujuan",
      COALESCE(t.note, '-') as Keterangan
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
    ORDER BY t.date DESC, t.created_at DESC
  `).all();

  const csv = toCSV(transactions as any[]);
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="wealthdash_transactions_${new Date().toISOString().split('T')[0]}.csv"`);
  // Add BOM for Excel compatibility with Indonesian characters
  res.send('\uFEFF' + csv);
});

// GET /api/export/wallets — Export wallets as CSV
router.get('/wallets', (_req, res) => {
  const wallets = db.prepare(`
    SELECT name as Nama, cluster as Tipe, balance as Saldo, icon as Icon, created_at as "Dibuat Pada"
    FROM wallets ORDER BY cluster, name
  `).all();

  const csv = toCSV(wallets as any[]);
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="wealthdash_wallets_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send('\uFEFF' + csv);
});

// GET /api/export/budgets — Export budgets as CSV
router.get('/budgets', (_req, res) => {
  const budgets = db.prepare(`
    SELECT name as Nama, type as Tipe, category as Kategori, estimate as Estimasi, 
      CASE is_done WHEN 1 THEN 'Ya' ELSE 'Belum' END as Status, period as Periode
    FROM budgets ORDER BY period DESC, type, name
  `).all();

  const csv = toCSV(budgets as any[]);
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="wealthdash_budgets_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send('\uFEFF' + csv);
});

// GET /api/export/holdings — Export stock holdings as CSV
router.get('/holdings', (_req, res) => {
  const holdings = db.prepare(`
    SELECT code as "Kode Saham", name as "Nama Emiten", buy_price as "Harga Beli",
      lots as Lot, current_price as "Harga Sekarang",
      (current_price - buy_price) * lots * 100 as "Floating P&L",
      bought_at as "Tanggal Beli"
    FROM stock_holdings WHERE lots > 0 ORDER BY code
  `).all();

  const csv = toCSV(holdings as any[]);
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="wealthdash_holdings_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send('\uFEFF' + csv);
});

// GET /api/export/all — Export all data as a single CSV with sections
router.get('/all', (_req, res) => {
  const wallets = db.prepare('SELECT name, cluster, balance FROM wallets ORDER BY cluster, name').all() as any[];
  const categories = db.prepare('SELECT name, type, icon FROM categories ORDER BY type, name').all() as any[];
  const transactions = db.prepare(`
    SELECT t.date, t.type, t.amount, COALESCE(c.name,'-') as category, w.name as wallet, COALESCE(tw.name,'-') as to_wallet, COALESCE(t.note,'-') as note
    FROM transactions t LEFT JOIN categories c ON t.category_id = c.id LEFT JOIN wallets w ON t.wallet_id = w.id LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
    ORDER BY t.date DESC
  `).all() as any[];
  const budgets = db.prepare('SELECT name, type, category, estimate, is_done, period FROM budgets ORDER BY period DESC').all() as any[];
  const savings = db.prepare('SELECT name, monthly_amount, is_active FROM savings_targets').all() as any[];
  const holdings = db.prepare('SELECT code, name, buy_price, lots, current_price FROM stock_holdings WHERE lots > 0').all() as any[];

  let output = '\uFEFF';
  output += '=== WALLETS ===\n' + toCSV(wallets) + '\n\n';
  output += '=== CATEGORIES ===\n' + toCSV(categories) + '\n\n';
  output += '=== TRANSACTIONS ===\n' + toCSV(transactions) + '\n\n';
  output += '=== BUDGETS ===\n' + toCSV(budgets) + '\n\n';
  output += '=== SAVINGS TARGETS ===\n' + toCSV(savings) + '\n\n';
  output += '=== STOCK HOLDINGS ===\n' + toCSV(holdings) + '\n';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="wealthdash_full_export_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(output);
});

export default router;
