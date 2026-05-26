import { test, expect } from '@playwright/test';
import { seedTestData, navigateTo, openTransactionModal, fillAmount } from './helpers.js';

test.describe('E2E — Proteksi Saldo', () => {
  test.beforeEach(async ({ page }) => {
    seedTestData();
    await page.goto('/');
  });

  test('Pengeluaran melebihi saldo ditolak', async ({ page }) => {
    await openTransactionModal(page);
    await page.getByRole('button', { name: 'Expense' }).first().click();

    // Fill nominal 1.500.000 (Dompet Utama has 1.000.000)
    await fillAmount(page, '1500000');

    // Select category (Makanan & Minuman)
    await page.locator('.fixed select').first().selectOption('c-food');

    // Select wallet (Dompet Utama)
    await page.locator('.fixed select').last().selectOption('w-liquid');

    // Setup dialog handler
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Saldo dompet tidak mencukupi');
      await dialog.dismiss();
    });

    // Click Save
    await page.getByRole('button', { name: 'Simpan Pengeluaran' }).click();

    // Modal should remain open
    await expect(page.locator('h2', { hasText: 'Tambah Transaksi' })).toBeVisible();

    // Close the modal to unblock clicking elements behind the overlay
    await page.getByRole('button', { name: 'close' }).click();
    await expect(page.locator('h2', { hasText: 'Tambah Transaksi' })).not.toBeVisible();

    // Navigate to Dompet
    await navigateTo(page, 'Dompet');

    // Verify Dompet Utama balance remains unchanged (Rp 1.000.000)
    const dompetUtamaCard = page.locator('.bg-surface-container-lowest').filter({ hasText: 'Dompet Utama' });
    await expect(dompetUtamaCard).toContainText('Rp 1.000.000');
  });
});
