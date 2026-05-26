import { test, expect } from '@playwright/test';
import { resetTestDb, seedTestData, navigateTo, openTransactionModal, fillAmount } from './helpers.js';

test.describe('E2E — Transaksi (Alur Utama)', () => {
  test.beforeEach(async ({ page }) => {
    seedTestData();
    await page.goto('/');
  });

  test('Membuka modal transaksi', async ({ page }) => {
    await openTransactionModal(page);
    const modalTitle = page.locator('h2', { hasText: 'Tambah Transaksi' });
    await expect(modalTitle).toBeVisible();
  });

  test('Format ribuan muncul saat mengetik nominal', async ({ page }) => {
    await openTransactionModal(page);
    const amountInput = page.locator('input[placeholder="0"]').first();
    await amountInput.fill('1250000');
    // Blur input or check value
    const val = await amountInput.inputValue();
    expect(val).toBe('1.250.000');
  });

  test('Membuat transaksi pemasukan sukses', async ({ page }) => {
    await openTransactionModal(page);
    
    // Tab "Income" is selected by default, but let's click it to be safe
    await page.getByRole('button', { name: 'Income' }).first().click();

    // Fill nominal
    await fillAmount(page, '250000');

    // Select category (Gaji)
    await page.locator('.fixed select').first().selectOption('c-salary');

    // Select wallet (Dompet Utama)
    await page.locator('.fixed select').last().selectOption('w-liquid');

    // Click Save
    await page.getByRole('button', { name: 'Simpan Pemasukan' }).click();

    // Modal should close
    await expect(page.locator('h2', { hasText: 'Tambah Transaksi' })).not.toBeVisible();

    // Net worth or total balance in dashboard should reflect it
    // Saldo awal liquid: 1.000.000 + 250.000 = 1.250.000
    // Total balance in overview: 1.250.000 + Celengan (500k) + RDN (200k) = 1.950.000
    const totalBalanceCard = page.locator('.bg-surface-container-lowest').filter({ hasText: 'Total Balance' });
    await expect(totalBalanceCard).toContainText('Rp 1.950.000');
  });

  test('Membuat transaksi pengeluaran sukses', async ({ page }) => {
    await openTransactionModal(page);
    
    // Click Expense tab
    await page.getByRole('button', { name: 'Expense' }).first().click();

    // Fill nominal
    await fillAmount(page, '150000');

    // Select category (Makanan & Minuman)
    await page.locator('.fixed select').first().selectOption('c-food');

    // Select wallet (Dompet Utama)
    await page.locator('.fixed select').last().selectOption('w-liquid');

    // Click Save
    await page.getByRole('button', { name: 'Simpan Pengeluaran' }).click();

    // Modal should close
    await expect(page.locator('h2', { hasText: 'Tambah Transaksi' })).not.toBeVisible();

    // Net worth should reduce by 150.000: 1.700.000 - 150.000 = 1.550.000
    const totalBalanceCard = page.locator('.bg-surface-container-lowest').filter({ hasText: 'Total Balance' });
    await expect(totalBalanceCard).toContainText('Rp 1.550.000');
  });

  test('Validasi form kosong', async ({ page }) => {
    await openTransactionModal(page);
    await page.getByRole('button', { name: 'Expense' }).first().click();

    // Register dialog handler
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Nominal dan Dompet harus diisi');
      await dialog.dismiss();
    });

    // Click Simpan Pengeluaran directly without filling anything
    await page.getByRole('button', { name: 'Simpan Pengeluaran' }).click();
    
    // Modal should still be open
    await expect(page.locator('h2', { hasText: 'Tambah Transaksi' })).toBeVisible();

    // Close modal to clean up state
    await page.getByRole('button', { name: 'close' }).click();
    await expect(page.locator('h2', { hasText: 'Tambah Transaksi' })).not.toBeVisible();
  });

  test('Transfer antar dompet', async ({ page }) => {
    await openTransactionModal(page);
    
    // Click Transfer tab
    await page.getByRole('button', { name: 'Transfer' }).first().click();

    // Fill amount
    await fillAmount(page, '300000');

    // Select source wallet (Dompet Utama)
    await page.locator('.fixed select').first().selectOption('w-liquid');

    // Select destination wallet (Celengan)
    await page.locator('.fixed select').last().selectOption('w-savings');

    // Click Save
    await page.getByRole('button', { name: 'Simpan Transfer' }).click();

    // Modal should close
    await expect(page.locator('h2', { hasText: 'Tambah Transaksi' })).not.toBeVisible();

    // Navigate to wallets page to check individual wallet balances
    await navigateTo(page, 'Dompet');

    // Dompet Utama balance should be 1.000.000 - 300.000 = 700.000
    const dompetUtamaCard = page.locator('.bg-surface-container-lowest, .bg-surface-container-lowest\\/50').filter({ hasText: 'Dompet Utama' });
    await expect(dompetUtamaCard).toContainText('Rp 700.000');

    // Celengan balance should be 500.000 + 300.000 = 800.000
    const celenganCard = page.locator('.bg-surface-container-lowest, .bg-surface-container-lowest\\/50').filter({ hasText: 'Celengan' });
    await expect(celenganCard).toContainText('Rp 800.000');
  });
});
