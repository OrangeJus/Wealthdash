import { test, expect } from '@playwright/test';
import { resetTestDb, navigateTo, expectHeading } from './helpers.js';

test.describe('E2E — Navigasi & Layout', () => {
  test.beforeEach(async () => {
    resetTestDb();
  });

  test('Halaman Dashboard tampil saat pertama kali dibuka', async ({ page }) => {
    await page.goto('/');
    await expectHeading(page, 'Overview');
  });

  test('Navigasi ke Transaksi', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'Transaksi');
    await expectHeading(page, 'Riwayat Transaksi');
  });

  test('Navigasi ke Anggaran', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'Anggaran');
    await expectHeading(page, 'Anggaran & Rencana');
  });

  test('Navigasi ke Tabungan', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'Tabungan');
    await expectHeading(page, 'Target Tabungan');
  });

  test('Navigasi ke Dompet', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'Dompet');
    await expectHeading(page, 'Dompet Saya');
  });

  test('Navigasi ke Investasi', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'Investasi');
    await expectHeading(page, 'Investment Portfolio');
  });
});
