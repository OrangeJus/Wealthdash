import { Router } from 'express';
import db from '../db/connection.js';
import { generateId, successResponse, errorResponse, safeInt, currentPeriod } from '../utils/helpers.js';

const router = Router();

// GET /api/savings/targets — List all savings targets
router.get('/targets', (_req, res) => {
  const targets = db.prepare(`
    SELECT * FROM savings_targets ORDER BY is_active DESC, name ASC
  `).all();

  res.json(successResponse(targets));
});

// POST /api/savings/targets — Create savings target
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

// PUT /api/savings/targets/:id — Update savings target
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

// GET /api/savings/progress?period=YYYY-MM — Progress for current month + rollover
router.get('/progress', (req, res) => {
  const period = (req.query.period as string) || currentPeriod();

  // Get all active targets
  const targets = db.prepare('SELECT * FROM savings_targets WHERE is_active = 1').all() as any[];

  // Total target for this month (sum of all active targets' monthly amounts)
  const totalTarget = targets.reduce((sum: number, t: any) => sum + t.monthly_amount, 0);

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
  // Rollover = sum of all (target - deposited) for all previous months where deposited < target
  const prevMonths = db.prepare(`
    SELECT sd.period, 
      COALESCE(SUM(sd.amount), 0) as deposited
    FROM savings_deposits sd
    WHERE sd.period < ?
    GROUP BY sd.period
    ORDER BY sd.period ASC
  `).all(period) as any[];

  // For rollover, we need the target amount at each historical month
  // For simplicity, we use the current total target (assuming targets don't change often)
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

// POST /api/savings/deposit — Make a deposit
router.post('/deposit', (req, res) => {
  const { target_id, wallet_id, period, amount, type } = req.body;

  if (!target_id || !wallet_id || !amount || !type) {
    res.status(400).json(errorResponse('target_id, wallet_id, amount, and type are required'));
    return;
  }

  if (!['routine', 'topup'].includes(type)) {
    res.status(400).json(errorResponse('type must be routine or topup'));
    return;
  }

  // Validate references
  const target = db.prepare('SELECT id FROM savings_targets WHERE id = ?').get(target_id);
  if (!target) {
    res.status(404).json(errorResponse('Savings target not found'));
    return;
  }

  const wallet = db.prepare('SELECT id FROM wallets WHERE id = ?').get(wallet_id);
  if (!wallet) {
    res.status(404).json(errorResponse('Wallet not found'));
    return;
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO savings_deposits (id, target_id, wallet_id, period, amount, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, target_id, wallet_id, period || currentPeriod(), safeInt(amount), type);

  const deposit = db.prepare('SELECT * FROM savings_deposits WHERE id = ?').get(id);
  res.status(201).json(successResponse(deposit, 'Deposit recorded'));
});

// GET /api/savings/history — Rollover history for all past months
router.get('/history', (_req, res) => {
  const period = currentPeriod();

  const targets = db.prepare('SELECT * FROM savings_targets WHERE is_active = 1').all() as any[];
  const totalTarget = targets.reduce((sum: number, t: any) => sum + t.monthly_amount, 0);

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
