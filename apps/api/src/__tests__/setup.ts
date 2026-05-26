/**
 * Test Setup — menyediakan Express app & helper untuk backend tests.
 *
 * Karena seluruh route menggunakan singleton `db` dari connection.ts,
 * kita langsung menggunakan app dari index.ts (yang sudah menginisialisasi DB)
 * dan membersihkan data di antara test suite.
 *
 * PENTING: Test ini menggunakan database PRODUKSI yang sama.
 * Setiap test suite HARUS membersihkan datanya sendiri di afterEach/afterAll.
 */
import app from '../index.js';
import db from '../db/connection.js';

export { app, db };

/**
 * Membersihkan semua data dari database untuk test yang bersih.
 * TIDAK menghapus tabel settings (hanya data transaksional).
 */
export function cleanDatabase(): void {
  db.exec('DELETE FROM stock_trades');
  db.exec('DELETE FROM stock_holdings');
  db.exec('DELETE FROM savings_deposits');
  db.exec('DELETE FROM savings_targets');
  db.exec('DELETE FROM budgets');
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM categories');
  db.exec('DELETE FROM wallets');
}

/**
 * Helper: buat dompet test dan kembalikan ID & data-nya.
 */
export function createTestWallet(
  name: string = 'Test Wallet',
  cluster: string = 'liquid',
  balance: number = 0
): any {
  const { generateId } = require('../utils/helpers.js') as any;
  const id = generateId();
  db.prepare(`
    INSERT INTO wallets (id, name, cluster, balance)
    VALUES (?, ?, ?, ?)
  `).run(id, name, cluster, balance);
  return db.prepare('SELECT * FROM wallets WHERE id = ?').get(id);
}

/**
 * Helper: buat kategori test.
 */
export function createTestCategory(
  name: string = 'Test Category',
  type: string = 'expense'
): any {
  const { generateId } = require('../utils/helpers.js') as any;
  const id = generateId();
  db.prepare(`
    INSERT INTO categories (id, name, type)
    VALUES (?, ?, ?)
  `).run(id, name, type);
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
}
