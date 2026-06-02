import Database, { Database as BetterSqliteDatabase } from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file lives in apps/api/data/
const DATA_DIR = join(__dirname, '..', '..', 'data');
const DB_NAME = process.env.DB_NAME || 'wealthdash.db';
const DB_PATH = join(DATA_DIR, DB_NAME);

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Create singleton connection
const db: BetterSqliteDatabase = new Database(DB_PATH);

// Enable WAL mode and foreign keys for performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize the database by running the schema SQL file.
 * Safe to run multiple times — uses CREATE TABLE IF NOT EXISTS.
 */
export function initializeDatabase(): void {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('✅ Database initialized at:', DB_PATH);

  // Auto-migrate: check if stock_holdings lots constraint is CHECK (lots > 0) and change it to lots >= 0
  try {
    let needsMigration = false;
    try {
      db.prepare(`
        INSERT INTO stock_holdings (id, code, name, buy_price, lots, current_price)
        VALUES ('temp_mig_check', 'TEMP', 'TEMP', 1, 0, 1)
      `).run();
      db.prepare(`DELETE FROM stock_holdings WHERE id = 'temp_mig_check'`).run();
    } catch (e: any) {
      if (e.message && e.message.includes('CHECK constraint failed')) {
        needsMigration = true;
      }
    }

    if (needsMigration) {
      console.log('Migrating stock_holdings table to allow lots = 0...');
      db.pragma('foreign_keys = OFF');
      
      db.prepare(`
        CREATE TABLE IF NOT EXISTS stock_holdings_new (
          id              TEXT PRIMARY KEY,
          code            TEXT NOT NULL,
          name            TEXT NOT NULL,
          buy_price       INTEGER NOT NULL,
          lots            INTEGER NOT NULL CHECK (lots >= 0),
          current_price   INTEGER NOT NULL,
          bought_at       TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        )
      `).run();
      
      db.prepare(`
        INSERT INTO stock_holdings_new (id, code, name, buy_price, lots, current_price, bought_at)
        SELECT id, code, name, buy_price, lots, current_price, bought_at FROM stock_holdings
      `).run();
      
      db.prepare(`DROP TABLE stock_holdings`).run();
      db.prepare(`ALTER TABLE stock_holdings_new RENAME TO stock_holdings`).run();
      
      db.pragma('foreign_keys = ON');
      console.log('✅ stock_holdings table migrated successfully to allow lots >= 0');
    }
  } catch (migrationErr) {
    console.error('Migration error for stock_holdings:', migrationErr);
  }
}

export default db;
