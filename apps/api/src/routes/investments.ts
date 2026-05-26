import { Router } from 'express';
import db from '../db/connection.js';
import { generateId, successResponse, errorResponse, safeInt } from '../utils/helpers.js';
import { fetchMultipleStockPrices } from '../services/stockPrice.js';

const router = Router();

// GET /api/investments/holdings — List all stock holdings with floating P&L
router.get('/holdings', (_req, res) => {
  const holdings = db.prepare('SELECT * FROM stock_holdings WHERE lots > 0 ORDER BY code ASC').all() as any[];

  const enriched = holdings.map((h: any) => {
    const shares = h.lots * 100;
    const totalModal = h.buy_price * shares;
    const marketValue = h.current_price * shares;
    const floatingPnl = marketValue - totalModal;
    const floatingPnlPercent = totalModal > 0 ? (floatingPnl / totalModal) * 100 : 0;

    return {
      ...h,
      shares,
      totalModal,
      marketValue,
      floatingPnl,
      floatingPnlPercent: parseFloat(floatingPnlPercent.toFixed(2)),
    };
  });

  const totalModal = enriched.reduce((sum: number, h: any) => sum + h.totalModal, 0);
  const totalMarket = enriched.reduce((sum: number, h: any) => sum + h.marketValue, 0);
  const totalPnl = totalMarket - totalModal;

  res.json(successResponse({
    holdings: enriched,
    summary: {
      totalModal,
      totalMarketValue: totalMarket,
      totalFloatingPnl: totalPnl,
      totalFloatingPnlPercent: totalModal > 0 ? parseFloat(((totalPnl / totalModal) * 100).toFixed(2)) : 0,
    },
  }));
});

// GET /api/investments/rdn-balance — Get RDN wallet balance
router.get('/rdn-balance', (_req, res) => {
  const rdnWallet = db.prepare(
    `SELECT * FROM wallets WHERE cluster = 'investment' LIMIT 1`
  ).get() as any;

  if (!rdnWallet) {
    res.json(successResponse({ balance: 0, wallet: null }));
    return;
  }

  res.json(successResponse({ balance: rdnWallet.balance, wallet: rdnWallet }));
});

// POST /api/investments/buy — Buy stock
router.post('/buy', (req, res) => {
  const { code, name, price, lots } = req.body;

  if (!code || !price || !lots) {
    res.status(400).json(errorResponse('code, price, and lots are required'));
    return;
  }

  const numPrice = safeInt(price);
  const numLots = safeInt(lots);
  if (numPrice <= 0 || numLots <= 0) {
    res.status(400).json(errorResponse('Harga dan jumlah lot harus lebih besar dari 0'));
    return;
  }
  const shares = numLots * 100;
  const totalAmount = numPrice * shares;

  // Find RDN wallet
  const rdnWallet = db.prepare(`SELECT * FROM wallets WHERE cluster = 'investment' LIMIT 1`).get() as any;
  if (!rdnWallet) {
    res.status(400).json(errorResponse('No investment (RDN) wallet found. Create one first.'));
    return;
  }

  if (rdnWallet.balance < totalAmount) {
    res.status(400).json(errorResponse('Saldo dompet tidak mencukupi'));
    return;
  }

  const buyTx = db.transaction(() => {
    // Create holding
    const holdingId = generateId();
    db.prepare(`
      INSERT INTO stock_holdings (id, code, name, buy_price, lots, current_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(holdingId, code.toUpperCase(), name || code.toUpperCase(), numPrice, numLots, numPrice);

    // Record trade
    const tradeId = generateId();
    db.prepare(`
      INSERT INTO stock_trades (id, holding_id, trade_type, code, price, lots, total_amount, wallet_id)
      VALUES (?, ?, 'buy', ?, ?, ?, ?, ?)
    `).run(tradeId, holdingId, code.toUpperCase(), numPrice, numLots, totalAmount, rdnWallet.id);

    // Deduct from RDN wallet
    db.prepare('UPDATE wallets SET balance = balance - ?, updated_at = datetime("now", "localtime") WHERE id = ?')
      .run(totalAmount, rdnWallet.id);

    return { holdingId, tradeId };
  });

  const result = buyTx();
  const holding = db.prepare('SELECT * FROM stock_holdings WHERE id = ?').get(result.holdingId);

  res.status(201).json(successResponse(holding, 'Stock purchased'));
});

// POST /api/investments/sell — Sell stock (all lots)
router.post('/sell', (req, res) => {
  const { holding_id, sell_price } = req.body;

  if (!holding_id || !sell_price) {
    res.status(400).json(errorResponse('holding_id and sell_price are required'));
    return;
  }

  const holding = db.prepare('SELECT * FROM stock_holdings WHERE id = ?').get(holding_id) as any;
  if (!holding) {
    res.status(404).json(errorResponse('Holding not found'));
    return;
  }

  const numSellPrice = safeInt(sell_price);
  if (numSellPrice <= 0) {
    res.status(400).json(errorResponse('Harga jual harus lebih besar dari 0'));
    return;
  }
  const shares = holding.lots * 100;
  const hasilJual = numSellPrice * shares;
  const totalModal = holding.buy_price * shares;
  const realizedPnl = hasilJual - totalModal;

  const rdnWallet = db.prepare(`SELECT * FROM wallets WHERE cluster = 'investment' LIMIT 1`).get() as any;
  if (!rdnWallet) {
    res.status(400).json(errorResponse('No investment (RDN) wallet found'));
    return;
  }

  const sellTx = db.transaction(() => {
    // Record trade
    const tradeId = generateId();
    db.prepare(`
      INSERT INTO stock_trades (id, holding_id, trade_type, code, price, lots, total_amount, realized_pnl, wallet_id)
      VALUES (?, ?, 'sell', ?, ?, ?, ?, ?, ?)
    `).run(tradeId, holding_id, holding.code, numSellPrice, holding.lots, hasilJual, realizedPnl, rdnWallet.id);

    // Remove holding (set lots to 0 to keep history)
    db.prepare('UPDATE stock_holdings SET lots = 0 WHERE id = ?').run(holding_id);

    // Credit RDN wallet
    db.prepare('UPDATE wallets SET balance = balance + ?, updated_at = datetime("now", "localtime") WHERE id = ?')
      .run(hasilJual, rdnWallet.id);

    return { tradeId, realizedPnl };
  });

  const result = sellTx();

  res.json(successResponse({
    code: holding.code,
    soldLots: holding.lots,
    sellPrice: numSellPrice,
    hasilJual,
    totalModal,
    realizedPnl: result.realizedPnl,
    rdnBalanceAfter: rdnWallet.balance + hasilJual,
  }, 'Stock sold'));
});

// PATCH /api/investments/holdings/:id/price — Update market price
router.patch('/holdings/:id/price', (req, res) => {
  const { current_price } = req.body;

  if (!current_price) {
    res.status(400).json(errorResponse('current_price is required'));
    return;
  }

  const existing = db.prepare('SELECT * FROM stock_holdings WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json(errorResponse('Holding not found'));
    return;
  }

  db.prepare('UPDATE stock_holdings SET current_price = ? WHERE id = ?')
    .run(safeInt(current_price), req.params.id);

  const updated = db.prepare('SELECT * FROM stock_holdings WHERE id = ?').get(req.params.id);
  res.json(successResponse(updated, 'Price updated'));
});

// POST /api/investments/rdn/topup — Top-up RDN from another wallet
router.post('/rdn/topup', (req, res) => {
  const { from_wallet_id, amount } = req.body;

  if (!from_wallet_id || !amount) {
    res.status(400).json(errorResponse('from_wallet_id and amount are required'));
    return;
  }

  const fromWallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(from_wallet_id) as any;
  if (!fromWallet) {
    res.status(404).json(errorResponse('Source wallet not found'));
    return;
  }

  const rdnWallet = db.prepare(`SELECT * FROM wallets WHERE cluster = 'investment' LIMIT 1`).get() as any;
  if (!rdnWallet) {
    res.status(400).json(errorResponse('No RDN wallet found'));
    return;
  }

  const numAmount = safeInt(amount);
  if (numAmount <= 0) {
    res.status(400).json(errorResponse('Nominal top-up harus lebih besar dari 0'));
    return;
  }

  if (fromWallet.balance < numAmount) {
    res.status(400).json(errorResponse('Saldo dompet tidak mencukupi'));
    return;
  }

  const topupTx = db.transaction(() => {
    // Create transfer transaction
    const txId = generateId();
    db.prepare(`
      INSERT INTO transactions (id, date, type, amount, wallet_id, to_wallet_id, note)
      VALUES (?, date('now', 'localtime'), 'transfer', ?, ?, ?, 'Top-up RDN')
    `).run(txId, numAmount, from_wallet_id, rdnWallet.id);

    // Update balances
    db.prepare('UPDATE wallets SET balance = balance - ?, updated_at = datetime("now", "localtime") WHERE id = ?')
      .run(numAmount, from_wallet_id);
    db.prepare('UPDATE wallets SET balance = balance + ?, updated_at = datetime("now", "localtime") WHERE id = ?')
      .run(numAmount, rdnWallet.id);
  });

  topupTx();
  res.json(successResponse(null, 'RDN topped up'));
});

// POST /api/investments/rdn/withdraw — Withdraw from RDN to another wallet
router.post('/rdn/withdraw', (req, res) => {
  const { to_wallet_id, amount } = req.body;

  if (!to_wallet_id || !amount) {
    res.status(400).json(errorResponse('to_wallet_id and amount are required'));
    return;
  }

  const toWallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(to_wallet_id) as any;
  if (!toWallet) {
    res.status(404).json(errorResponse('Destination wallet not found'));
    return;
  }

  const rdnWallet = db.prepare(`SELECT * FROM wallets WHERE cluster = 'investment' LIMIT 1`).get() as any;
  if (!rdnWallet) {
    res.status(400).json(errorResponse('No RDN wallet found'));
    return;
  }

  const numAmount = safeInt(amount);
  if (numAmount <= 0) {
    res.status(400).json(errorResponse('Nominal withdraw harus lebih besar dari 0'));
    return;
  }

  if (rdnWallet.balance < numAmount) {
    res.status(400).json(errorResponse('Saldo dompet tidak mencukupi'));
    return;
  }

  const withdrawTx = db.transaction(() => {
    const txId = generateId();
    db.prepare(`
      INSERT INTO transactions (id, date, type, amount, wallet_id, to_wallet_id, note)
      VALUES (?, date('now', 'localtime'), 'transfer', ?, ?, ?, 'Withdraw RDN')
    `).run(txId, numAmount, rdnWallet.id, to_wallet_id);

    db.prepare('UPDATE wallets SET balance = balance - ?, updated_at = datetime("now", "localtime") WHERE id = ?')
      .run(numAmount, rdnWallet.id);
    db.prepare('UPDATE wallets SET balance = balance + ?, updated_at = datetime("now", "localtime") WHERE id = ?')
      .run(numAmount, to_wallet_id);
  });

  withdrawTx();
  res.json(successResponse(null, 'RDN withdrawn'));
});

// POST /api/investments/update-prices — Auto-update all stock prices from Yahoo Finance
router.post('/update-prices', async (_req, res) => {
  try {
    const holdings = db.prepare('SELECT id, code FROM stock_holdings WHERE lots > 0').all() as any[];

    if (holdings.length === 0) {
      res.json(successResponse({ updated: 0, results: [] }, 'No holdings to update'));
      return;
    }

    const codes = holdings.map((h: any) => h.code);
    const priceMap = await fetchMultipleStockPrices(codes);

    const results: { code: string; oldPrice: number; newPrice: number | null; status: string }[] = [];

    const updateTx = db.transaction(() => {
      for (const holding of holdings) {
        const newPrice = priceMap.get(holding.code);
        const current = db.prepare('SELECT current_price FROM stock_holdings WHERE id = ?').get(holding.id) as any;

        if (newPrice !== null && newPrice !== undefined) {
          db.prepare('UPDATE stock_holdings SET current_price = ? WHERE id = ?').run(newPrice, holding.id);
          results.push({ code: holding.code, oldPrice: current.current_price, newPrice, status: 'updated' });
        } else {
          results.push({ code: holding.code, oldPrice: current.current_price, newPrice: null, status: 'failed' });
        }
      }
    });

    updateTx();

    const successCount = results.filter(r => r.status === 'updated').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    res.json(successResponse(
      { updated: successCount, failed: failedCount, results },
      `${successCount} prices updated, ${failedCount} failed`
    ));
  } catch (err: any) {
    console.error('Price update error:', err);
    res.status(500).json(errorResponse('Failed to update prices: ' + err.message));
  }
});

export default router;
