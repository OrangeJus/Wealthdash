import { Router } from 'express';
import db from '../db/connection.js';
import { successResponse, currentPeriod } from '../utils/helpers.js';

const router = Router();

// GET /api/analytics/overview — Dashboard summary cards
router.get('/overview', (_req, res) => {
  const period = currentPeriod();

  // Total balance across all wallets
  const totalBalance = db.prepare(
    'SELECT COALESCE(SUM(balance), 0) as total FROM wallets'
  ).get() as { total: number };

  // Monthly income
  const monthlyIncome = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date LIKE ? || '%'`
  ).get(period) as { total: number };

  // Monthly expenses
  const monthlyExpenses = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date LIKE ? || '%'`
  ).get(period) as { total: number };

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
  const monthlySavings = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM savings_deposits WHERE period = ?`
  ).get(period) as { total: number };

  res.json(successResponse({
    totalBalance: totalBalance.total,
    monthlyIncome: monthlyIncome.total,
    monthlyExpenses: monthlyExpenses.total,
    prevMonthExpenses: prevExpenses.total,
    prevMonthIncome: prevIncome.total,
    expenseLimit: parseInt(expenseLimit?.value || '0'),
    savingsTarget: parseInt(savingsTarget?.value || '0'),
    monthlySavings: monthlySavings.total,
    period,
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

// GET /api/analytics/top-expenses?period=YYYY-MM — Top spending categories
router.get('/top-expenses', (req, res) => {
  const period = (req.query.period as string) || currentPeriod();

  const data = db.prepare(`
    SELECT 
      c.name as category,
      c.icon,
      c.budget,
      SUM(t.amount) as total,
      COUNT(*) as count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense' AND t.date LIKE ? || '%'
    GROUP BY c.id
    ORDER BY total DESC
    LIMIT 10
  `).all(period);

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
