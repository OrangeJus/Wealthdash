import { test, expect } from '@playwright/test';
import { seedTestData, navigateTo } from './helpers.js';

test.describe('E2E — Dompet Saya (CRUD)', () => {
  test.beforeEach(async ({ page }) => {
    seedTestData();
    await page.goto('/');
    await navigateTo(page, 'Dompet');
  });

  test('Membuat dompet baru', async ({ page }) => {
    // Click "Tambah Dompet"
    await page.getByRole('button', { name: 'Tambah Dompet' }).first().click();

    // Fill wallet name
    await page.locator('input[placeholder="Contoh: GoPay, BCA, Dompet Fisik"]').first().fill('Dompet Test E2E');

    // Select cluster (Liquid)
    await page.locator('select:has(option:has-text("Liquid"))').selectOption('liquid');

    // Fill initial balance (placeholder "0" or label "Saldo Awal")
    const balanceInput = page.locator('input[placeholder="0"]').first();
    await balanceInput.fill('500000');

    // Click Save
    await page.getByRole('button', { name: 'Simpan Dompet' }).click();

    // Modal should close and the wallet should appear
    await expect(page.locator('h2', { hasText: 'Tambah Dompet' })).not.toBeVisible();

    const walletCard = page.locator('.bg-surface-container-lowest').filter({ hasText: 'Dompet Test E2E' });
    await expect(walletCard).toBeVisible();
    await expect(walletCard).toContainText('Rp 500.000');
  });

  test('Edit nama dompet', async ({ page }) => {
    // Hover on "Dompet Utama" to make edit button visible
    const walletCard = page.locator('.bg-surface-container-lowest').filter({ hasText: 'Dompet Utama' });
    await walletCard.hover();

    // Click Edit button
    await walletCard.locator('button').filter({ hasText: 'edit' }).click();

    // Change name
    const nameInput = page.locator('input[placeholder="Contoh: GoPay, BCA, Dompet Fisik"]').first();
    await nameInput.fill('Dompet Utama Updated');

    // Click Save
    await page.getByRole('button', { name: 'Simpan Dompet' }).click();

    // Name should update on the card
    await expect(walletCard).toContainText('Dompet Utama Updated');
  });

  test('Menghapus dompet', async ({ page }) => {
    const walletCard = page.locator('.bg-surface-container-lowest').filter({ hasText: 'Dompet Sementara' });
    await walletCard.hover();
    await walletCard.locator('button').filter({ hasText: 'edit' }).click();

    // Click Hapus button and accept confirmation dialog
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Hapus dompet ini?');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Hapus' }).click();

    // Card should disappear
    await expect(walletCard).not.toBeVisible();
  });
});
