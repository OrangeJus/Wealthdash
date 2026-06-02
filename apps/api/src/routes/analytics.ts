import { Router } from 'express';
import db from '../db/connection.js';
import { successResponse, currentPeriod } from '../utils/helpers.js';

const router = Router();

// GET /api/analytics/overview — Dashboard summary cards
router.get('/overview', (req, res) => {
  const { wallet_id, category_id, date_from, date_to, period } = req.query;

  // Build dynamic WHERE clauses for dynamic summary
  let whereClauses: string[] = [];
  let params: any[] = [];

  if (category_id) {
    whereClauses.push('category_id = ?');
    params.push(category_id);
  }
  if (wallet_id) {
    whereClauses.push('(wallet_id = ? OR to_wallet_id = ?)');
    params.push(wallet_id, wallet_id);
  }
  if (date_from) {
    whereClauses.push('date >= ?');
    params.push(date_from);
  }
  if (date_to) {
    whereClauses.push('date <= ?');
    params.push(date_to);
  }
  if (period) {
    if (period === 'today') {
      whereClauses.push("date = strftime('%Y-%m-%d', 'now', 'localtime')");
    } else if (period === 'this_week') {
      whereClauses.push("date >= strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0', '-6 days')");
      whereClauses.push("date <= strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0')");
    } else if (period === 'this_year') {
      whereClauses.push("date LIKE strftime('%Y', 'now', 'localtime') || '%'");
    } else {
      whereClauses.push("date LIKE ? || '%'");
      params.push(period);
    }
  } else if (!date_from && !date_to) {
    // Default fallback to active period (this month) for backward compat / dashboard
    const currentP = currentPeriod();
    whereClauses.push("date LIKE ? || '%'");
    params.push(currentP);
  }

  const whereSQL = whereClauses.length > 0 ? ' AND ' + whereClauses.join(' AND ') : '';

  // Total balance across all wallets
  const totalBalance = db.prepare(
    'SELECT COALESCE(SUM(balance), 0) as total FROM wallets'
  ).get() as { total: number };

  // Dynamic income
  const incomeQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' ${whereSQL}`;
  const monthlyIncome = db.prepare(incomeQuery).get(...params) as { total: number };

  // Dynamic expenses
  const expenseQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' ${whereSQL}`;
  const monthlyExpenses = db.prepare(expenseQuery).get(...params) as { total: number };

  // Previous month for trend calculation
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevPeriod = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const prevExpenses = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date LIKE ? || '%'`
  ).get(prevPeriod) as { total: number };

  const prevIncome = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date LIKE ? || '%'`
  ).get(prevPeriod) as { total: number };

  // Expense & savings limits from settings
  const expenseLimit = db.prepare("SELECT value FROM settings WHERE key = 'expense_limit'").get() as { value: string } | undefined;
  const savingsTarget = db.prepare("SELECT value FROM settings WHERE key = 'savings_target'").get() as { value: string } | undefined;

  // Savings progress this month
  const fallbackPeriod = (period && period !== 'today' && period !== 'this_week' && period !== 'this_year') ? String(period) : currentPeriod();
  const monthlySavings = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM savings_deposits WHERE period = ?`
  ).get(fallbackPeriod) as { total: number };

  res.json(successResponse({
    totalBalance: totalBalance.total,
    monthlyIncome: monthlyIncome.total,
    monthlyExpenses: monthlyExpenses.total,
    prevMonthExpenses: prevExpenses.total,
    prevMonthIncome: prevIncome.total,
    expenseLimit: parseInt(expenseLimit?.value || '0'),
    savingsTarget: parseInt(savingsTarget?.value || '0'),
    monthlySavings: monthlySavings.total,
    period: period || fallbackPeriod,
  }));
});

// GET /api/analytics/cashflow?months=6 — Monthly income vs expense
router.get('/cashflow', (req, res) => {
  const months = parseInt(req.query.months as string) || 6;

  const data = db.prepare(`
    WITH RECURSIVE month_series(period) AS (
      SELECT strftime('%Y-%m', 'now', 'localtime')
      UNION ALL
      SELECT strftime('%Y-%m', period || '-01', '-1 month')
      FROM month_series
      WHERE period > strftime('%Y-%m', 'now', 'localtime', '-' || ? || ' months')
    )
    SELECT 
      ms.period,
      COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'income' AND date LIKE ms.period || '%'), 0) as income,
      COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'expense' AND date LIKE ms.period || '%'), 0) as expense
    FROM month_series ms
    ORDER BY ms.period ASC
  `).all(months);

  res.json(successResponse(data));
});

// GET /api/analytics/top-expenses — Top spending categories with dynamic filters
router.get('/top-expenses', (req, res) => {
  const { wallet_id, category_id, date_from, date_to, period } = req.query;

  let whereClauses: string[] = ["t.type = 'expense'"];
  let params: any[] = [];

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
    if (period === 'today') {
      whereClauses.push("t.date = strftime('%Y-%m-%d', 'now', 'localtime')");
    } else if (period === 'this_week') {
      whereClauses.push("t.date >= strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0', '-6 days')");
      whereClauses.push("t.date <= strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0')");
    } else if (period === 'this_year') {
      whereClauses.push("t.date LIKE strftime('%Y', 'now', 'localtime') || '%'");
    } else {
      whereClauses.push("t.date LIKE ? || '%'");
      params.push(period);
    }
  } else if (!date_from && !date_to) {
    // Default fallback to active period (this month) for backward compat / dashboard
    const currentP = currentPeriod();
    whereClauses.push("t.date LIKE ? || '%'");
    params.push(currentP);
  }

  const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  const data = db.prepare(`
    SELECT 
      c.name as category,
      c.icon,
      c.logo_path,
      c.budget,
      SUM(t.amount) as total,
      COUNT(*) as count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    ${whereSQL}
    GROUP BY c.id
    ORDER BY total DESC
    LIMIT 10
  `).all(...params);

  res.json(successResponse(data));
});

// GET /api/analytics/asset-allocation — Liquid vs Savings vs Investment
router.get('/asset-allocation', (_req, res) => {
  const data = db.prepare(`
    SELECT 
      cluster,
      SUM(balance) as total,
      COUNT(*) as wallet_count
    FROM wallets
    GROUP BY cluster
    ORDER BY CASE cluster WHEN 'liquid' THEN 1 WHEN 'savings' THEN 2 WHEN 'investment' THEN 3 END
  `).all();

  const grandTotal = (data as any[]).reduce((sum, d) => sum + d.total, 0);

  const allocation = (data as any[]).map(d => ({
    ...d,
    percentage: grandTotal > 0 ? ((d.total / grandTotal) * 100).toFixed(1) : '0.0',
  }));

  res.json(successResponse({ allocation, grandTotal }));
});

// GET /api/analytics/savings-rate?months=6 — Savings rate trend
router.get('/savings-rate', (req, res) => {
  const months = parseInt(req.query.months as string) || 6;

  const data = db.prepare(`
    WITH RECURSIVE month_series(period) AS (
      SELECT strftime('%Y-%m', 'now', 'localtime')
      UNION ALL
      SELECT strftime('%Y-%m', period || '-01', '-1 month')
      FROM month_series
      WHERE period > strftime('%Y-%m', 'now', 'localtime', '-' || ? || ' months')
    )
    SELECT 
      ms.period,
      COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'income' AND date LIKE ms.period || '%'), 0) as income,
      COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'expense' AND date LIKE ms.period || '%'), 0) as expense
    FROM month_series ms
    ORDER BY ms.period ASC
  `).all(months);

  const withRate = (data as any[]).map(d => ({
    ...d,
    savings: d.income - d.expense,
    rate: d.income > 0 ? (((d.income - d.expense) / d.income) * 100).toFixed(1) : '0.0',
  }));

  res.json(successResponse(withRate));
});

export default router;
