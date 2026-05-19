import db, { initializeDatabase } from './connection.js';
import { generateId, currentPeriod } from '../utils/helpers.js';

// Initialize schema first
initializeDatabase();

console.log('🌱 Clearing existing data and seeding database with data for Mar, Apr, May 2026...\n');

const seed = db.transaction(() => {
  // Clear all data
  db.exec(`
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM savings_deposits;
    DELETE FROM savings_targets;
    DELETE FROM stock_trades;
    DELETE FROM stock_holdings;
    DELETE FROM wallets;
    DELETE FROM categories;
    DELETE FROM settings;
  `);

  // ──────────────────────────────────────────
  // 1. WALLETS
  // ──────────────────────────────────────────
  const walletGopay = generateId();
  const walletOvo = generateId();
  const walletBca = generateId();
  const walletRdn = generateId();

  const wallets = [
    [walletGopay, 'GoPay', 'account_balance_wallet', null, 'liquid', 0],
    [walletOvo, 'OVO', 'account_balance_wallet', null, 'liquid', 0],
    [walletBca, 'BCA', 'account_balance', null, 'savings', 0],
    [walletRdn, 'RDN BCA', 'show_chart', null, 'investment', 0],
  ];

  const insertWallet = db.prepare(`
    INSERT INTO wallets (id, name, icon, logo_path, cluster, balance) VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const w of wallets) insertWallet.run(...w);
  console.log(`  ✅ ${wallets.length} wallets created`);

  // ──────────────────────────────────────────
  // 2. CATEGORIES
  // ──────────────────────────────────────────
  const catMakanan = generateId();
  const catBelanja = generateId();
  const catUtilitas = generateId();
  const catTransport = generateId();
  const catHiburan = generateId();
  const catGaji = generateId();
  const catBonus = generateId();
  const catFreelance = generateId();

  const categories = [
    [catMakanan, 'Makanan', 'expense', 'restaurant', 1, 2000000],
    [catBelanja, 'Belanja Bulanan', 'expense', 'shopping_cart', 2, 1000000],
    [catUtilitas, 'Utilitas & Tagihan', 'expense', 'home', 3, 1000000],
    [catTransport, 'Transportasi', 'expense', 'directions_car', 4, 500000],
    [catHiburan, 'Hiburan', 'expense', 'movie', 5, 500000],
    [catGaji, 'Gaji', 'income', 'work', 1, null],
    [catBonus, 'Bonus', 'income', 'payments', 2, null],
    [catFreelance, 'Freelance', 'income', 'computer', 3, null],
  ];

  const insertCat = db.prepare(`
    INSERT INTO categories (id, name, type, icon, sort_order, budget) VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const c of categories) insertCat.run(...c);
  console.log(`  ✅ ${categories.length} categories created`);

  // ──────────────────────────────────────────
  // 3. TRANSACTIONS (Mar, Apr, May 2026)
  // ──────────────────────────────────────────
  
  const transactions: any[] = [];
  
  // Helper to add random transactions
  const addIncome = (date: string, amount: number, cat: string, wallet: string, note: string) => {
    transactions.push([generateId(), date, 'income', amount, cat, wallet, null, note]);
  };
  const addExpense = (date: string, amount: number, cat: string, wallet: string, note: string) => {
    transactions.push([generateId(), date, 'expense', amount, cat, wallet, null, note]);
  };
  
  // March 2026
  addIncome('2026-03-01', 8000000, catGaji, walletBca, 'Gaji Maret');
  // Fund GoPay and OVO first to avoid negative balance
  transactions.push([generateId(), '2026-03-02', 'transfer', 1000000, null, walletBca, walletGopay, 'Topup GoPay']);
  transactions.push([generateId(), '2026-03-02', 'transfer', 500000, null, walletBca, walletOvo, 'Topup OVO']);
  
  addExpense('2026-03-05', 500000, catBelanja, walletBca, 'Belanja bulanan');
  addExpense('2026-03-08', 150000, catMakanan, walletGopay, 'Makan siang');
  addExpense('2026-03-12', 300000, catUtilitas, walletBca, 'Listrik & Air');
  addExpense('2026-03-15', 200000, catTransport, walletOvo, 'Isi saldo ojol');
  addExpense('2026-03-20', 300000, catHiburan, walletBca, 'Nonton bioskop');
  addIncome('2026-03-25', 1000000, catFreelance, walletBca, 'Project desain');
  addExpense('2026-03-28', 400000, catMakanan, walletGopay, 'Makan malam');

  // April 2026
  addIncome('2026-04-01', 8000000, catGaji, walletBca, 'Gaji April');
  addIncome('2026-04-10', 2000000, catBonus, walletBca, 'Bonus THR');
  transactions.push([generateId(), '2026-04-02', 'transfer', 1000000, null, walletBca, walletGopay, 'Topup GoPay']);
  transactions.push([generateId(), '2026-04-02', 'transfer', 500000, null, walletBca, walletOvo, 'Topup OVO']);
  
  addExpense('2026-04-05', 800000, catBelanja, walletBca, 'Belanja bulanan');
  addExpense('2026-04-08', 250000, catMakanan, walletGopay, 'Makan siang bareng teman');
  addExpense('2026-04-12', 350000, catUtilitas, walletBca, 'Listrik & Air');
  addExpense('2026-04-15', 150000, catTransport, walletOvo, 'Isi saldo ojol');
  addExpense('2026-04-20', 500000, catHiburan, walletBca, 'Liburan pendek');
  addExpense('2026-04-28', 600000, catMakanan, walletGopay, 'Traktir keluarga');

  // May 2026 (Up to May 19)
  addIncome('2026-05-01', 8000000, catGaji, walletBca, 'Gaji Mei');
  transactions.push([generateId(), '2026-05-02', 'transfer', 1000000, null, walletBca, walletGopay, 'Topup GoPay']);
  transactions.push([generateId(), '2026-05-02', 'transfer', 500000, null, walletBca, walletOvo, 'Topup OVO']);
  
  addExpense('2026-05-03', 600000, catBelanja, walletBca, 'Belanja bulanan');
  addExpense('2026-05-05', 120000, catMakanan, walletGopay, 'Makan siang');
  addExpense('2026-05-10', 320000, catUtilitas, walletBca, 'Listrik & Internet');
  addExpense('2026-05-12', 100000, catTransport, walletOvo, 'Isi saldo ojol');
  addExpense('2026-05-15', 250000, catHiburan, walletBca, 'Nonton bioskop');
  addExpense('2026-05-18', 150000, catMakanan, walletGopay, 'Makan malam');

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, date, type, amount, category_id, wallet_id, to_wallet_id, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const t of transactions) insertTx.run(...t);
  console.log(`  ✅ ${transactions.length} transactions created for Mar, Apr, May 2026`);

  // Recalculate wallet balances based on transactions
  for (const w of wallets) {
    const wId = w[0] as string;
    const inc = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'income'`).get(wId) as any;
    const exp = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'expense'`).get(wId) as any;
    const tOut = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'transfer'`).get(wId) as any;
    const tIn = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE to_wallet_id = ? AND type = 'transfer'`).get(wId) as any;
    
    const balance = inc.total - exp.total - tOut.total + tIn.total;
    db.prepare(`UPDATE wallets SET balance = ? WHERE id = ?`).run(balance, wId);
  }
  console.log(`  ✅ Wallet balances recalculated`);


  // ──────────────────────────────────────────
  // 4. BUDGETS (Anggaran)
  // ──────────────────────────────────────────
  const period = currentPeriod();

  const budgets = [
    [generateId(), 'Laundry', 'Utilitas & Tagihan', 'wajib', 50000, 0, null, period],
    [generateId(), 'Perlengkapan Mandi', 'Belanja Bulanan', 'wajib', 150000, 1, JSON.stringify(['Sabun Mandi', 'Shampoo']), period],
    [generateId(), 'Listrik / Token', 'Utilitas & Tagihan', 'wajib', 300000, 0, null, period],
    [generateId(), 'Netflix Subscription', 'Hiburan', 'langganan', 54000, 0, null, period],
    [generateId(), 'Spotify Premium', 'Hiburan', 'langganan', 49000, 1, null, period],
    [generateId(), 'Sepatu Lari Baru', 'Belanja Bulanan', 'wishlist', 1500000, 0, null, period],
  ];

  const insertBudget = db.prepare(`
    INSERT INTO budgets (id, name, category, type, estimate, is_done, details, period)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const b of budgets) insertBudget.run(...b);
  console.log(`  ✅ ${budgets.length} budgets created`);

  // ──────────────────────────────────────────
  // 5. SAVINGS (Tabungan)
  // ──────────────────────────────────────────
  const savingsTargetId = generateId();
  db.prepare(`
    INSERT INTO savings_targets (id, name, icon, monthly_amount, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run(savingsTargetId, 'Dana Darurat', 'medical_services', 1000000, 1);

  const prevPeriod = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  
  const deposits = [
    [generateId(), savingsTargetId, walletBca, prevPeriod, 1000000, 'routine'],
    [generateId(), savingsTargetId, walletBca, period, 1000000, 'routine'],
    [generateId(), savingsTargetId, walletBca, period, 500000, 'topup'],
  ];

  const insertDeposit = db.prepare(`
    INSERT INTO savings_deposits (id, target_id, wallet_id, period, amount, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const d of deposits) insertDeposit.run(...d);
  console.log(`  ✅ 1 savings target and ${deposits.length} deposits created`);

  // ──────────────────────────────────────────
  // 6. SETTINGS
  // ──────────────────────────────────────────
  const insertSetting = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`);
  insertSetting.run('expense_limit', '5000000');
  insertSetting.run('savings_target', '2000000');
  console.log('  ✅ Settings created');
});

try {
  seed();
  console.log('\n🎉 Database reset and seeded successfully!');
} catch (err) {
  console.error('❌ Failed to seed database:', err);
}
