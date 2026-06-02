-- WealthDash Database Schema
-- SQLite with WAL mode for better concurrent reads

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================================
-- WALLETS: Dompet / rekening / e-wallet
-- ============================================================
CREATE TABLE IF NOT EXISTS wallets (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    icon        TEXT NOT NULL DEFAULT 'account_balance_wallet',
    logo_path   TEXT,
    cluster     TEXT NOT NULL CHECK (cluster IN ('liquid', 'savings', 'investment')),
    balance     INTEGER NOT NULL DEFAULT 0,  -- dalam Rupiah (tanpa desimal)
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- CATEGORIES: Kategori pemasukan & pengeluaran
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon        TEXT NOT NULL DEFAULT 'category',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    logo_path   TEXT,
    budget      INTEGER,
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- TRANSACTIONS: Income, Expense, Transfer
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id              TEXT PRIMARY KEY,
    date            TEXT NOT NULL,  -- YYYY-MM-DD
    type            TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount          INTEGER NOT NULL CHECK (amount > 0),
    category_id     TEXT,
    wallet_id       TEXT NOT NULL,
    to_wallet_id    TEXT,  -- hanya untuk transfer
    note            TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- ============================================================
-- BUDGETS: Tagihan wajib bulanan & wishlist belanja
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT,  -- free-text category label (e.g. "Utilitas", "Hiburan")
    type        TEXT NOT NULL CHECK (type IN ('wajib', 'langganan', 'wishlist')),
    estimate    INTEGER NOT NULL DEFAULT 0,
    is_done     INTEGER NOT NULL DEFAULT 0,  -- 0=false, 1=true (isPaid/isBought)
    details     TEXT,  -- JSON array for sub-items, nullable
    period      TEXT NOT NULL,  -- YYYY-MM
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);

-- ============================================================
-- SAVINGS_TARGETS: Target tabungan rutin (e.g. Dana Darurat)
-- ============================================================
CREATE TABLE IF NOT EXISTS savings_targets (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    icon            TEXT NOT NULL DEFAULT 'savings',
    monthly_amount  INTEGER NOT NULL CHECK (monthly_amount > 0),
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- SAVINGS_DEPOSITS: Record setoran ke target tabungan
-- ============================================================
CREATE TABLE IF NOT EXISTS savings_deposits (
    id          TEXT PRIMARY KEY,
    target_id   TEXT NOT NULL,
    wallet_id   TEXT NOT NULL,
    period      TEXT NOT NULL,  -- YYYY-MM
    amount      INTEGER NOT NULL CHECK (amount > 0),
    type        TEXT NOT NULL CHECK (type IN ('routine', 'topup')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (target_id) REFERENCES savings_targets(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_savings_deposits_period ON savings_deposits(period);

-- ============================================================
-- STOCK_HOLDINGS: Portofolio saham
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_holdings (
    id              TEXT PRIMARY KEY,
    code            TEXT NOT NULL,  -- BBCA, BBRI, etc.
    name            TEXT NOT NULL,
    buy_price       INTEGER NOT NULL,  -- harga per lembar saat beli
    lots            INTEGER NOT NULL CHECK (lots >= 0),
    current_price   INTEGER NOT NULL,
    bought_at       TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- STOCK_TRADES: Log beli/jual saham
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_trades (
    id              TEXT PRIMARY KEY,
    holding_id      TEXT,
    trade_type      TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
    code            TEXT NOT NULL,
    price           INTEGER NOT NULL,
    lots            INTEGER NOT NULL,
    total_amount    INTEGER NOT NULL,
    realized_pnl    INTEGER,  -- hanya untuk sell
    wallet_id       TEXT NOT NULL,  -- RDN wallet
    traded_at       TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (holding_id) REFERENCES stock_holdings(id) ON DELETE SET NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT
);

-- ============================================================
-- SETTINGS: Key-value store untuk konfigurasi app
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    key     TEXT PRIMARY KEY,
    value   TEXT NOT NULL
);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('expense_limit', '3000000');
INSERT OR IGNORE INTO settings (key, value) VALUES ('savings_target', '250000');
