import { expect, type Page } from '@playwright/test';
import Database from 'better-sqlite3';
import { join } from 'path';

export function resetTestDb() {
  const dbPath = join(process.cwd(), 'apps', 'api', 'data', 'wealthdash-e2e.db');
  const db = new Database(dbPath);
  
  // Clean all transactional data
  db.exec('DELETE FROM stock_trades');
  db.exec('DELETE FROM stock_holdings');
  db.exec('DELETE FROM savings_deposits');
  db.exec('DELETE FROM savings_targets');
  db.exec('DELETE FROM budgets');
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM categories');
  db.exec('DELETE FROM wallets');
  
  db.close();
}

export function seedTestData() {
  const dbPath = join(process.cwd(), 'apps', 'api', 'data', 'wealthdash-e2e.db');
  const db = new Database(dbPath);
  
  // Clean first to prevent unique constraint failures
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM categories');
  db.exec('DELETE FROM wallets');

  // Seed wallets
  db.prepare(`
    INSERT INTO wallets (id, name, cluster, balance)
    VALUES 
      ('w-liquid', 'Dompet Utama', 'liquid', 1000000),
      ('w-savings', 'Celengan', 'savings', 500000),
      ('w-investment', 'RDN BCA Sekuritas', 'investment', 200000),
      ('w-deletable', 'Dompet Sementara', 'liquid', 0)
  `).run();

  // Seed categories
  db.prepare(`
    INSERT INTO categories (id, name, type)
    VALUES 
      ('c-salary', 'Gaji', 'income'),
      ('c-food', 'Makanan & Minuman', 'expense'),
      ('c-transport', 'Transportasi', 'expense')
  `).run();

  // Seed initial income transactions to support re-computation
  db.prepare(`
    INSERT INTO transactions (id, date, type, amount, wallet_id, note)
    VALUES 
      ('t-init-liquid', '2026-05-01', 'income', 1000000, 'w-liquid', 'Saldo Awal'),
      ('t-init-savings', '2026-05-01', 'income', 500000, 'w-savings', 'Saldo Awal'),
      ('t-init-investment', '2026-05-01', 'income', 200000, 'w-investment', 'Saldo Awal')
  `).run();

  db.close();
}

export async function navigateTo(page: Page, tabName: string) {
  const label = tabName === 'Settings' ? 'Pengaturan' : tabName;
  await page.locator('aside').getByRole('button', { name: label }).click();
  // Allow transitions/renders to finish
  await page.waitForTimeout(200);
}

export async function openTransactionModal(page: Page) {
  await page.getByRole('button', { name: /Tambah Transaksi/i }).first().click();
}

export async function fillAmount(page: Page, amount: string) {
  // Locate the input with placeholder "0" which corresponds to Nominal
  const input = page.locator('input[placeholder="0"]').first();
  await input.fill(amount);
}

export async function expectHeading(page: Page, text: string) {
  const heading = page.locator('main h2.font-display-lg, main h2.font-display-lg-mobile, main h2').first();
  await expect(heading).toContainText(text);
}
