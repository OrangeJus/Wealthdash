import { v4 as uuidv4 } from 'uuid';
import db from '../db/connection.js';

/**
 * Generate a new UUID v4 string.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Get current date as YYYY-MM-DD string (local time).
 */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current period as YYYY-MM string (local time).
 */
export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format a number as Rupiah string.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Standard success response wrapper.
 */
export function successResponse(data: any, message?: string) {
  return {
    success: true,
    message: message || 'OK',
    data,
  };
}

/**
 * Standard error response wrapper.
 */
export function errorResponse(message: string, details?: any) {
  return {
    success: false,
    message,
    details,
  };
}

/**
 * Parse integer from string, return default if NaN.
 */
export function safeInt(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : Math.floor(value);
  }
  // Strip non-digit characters (handles "12.000" -> "12000", "Rp 50.000" -> "50000")
  // but keep negative sign if present
  const cleaned = String(value).replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate logo base64 size (max 5 MB) and format (PNG, JPG, JPEG, SVG).
 */
export function validateLogoSizeAndFormat(logoPath: string | null | undefined): { isValid: boolean; error?: string } {
  if (!logoPath) return { isValid: true };

  // If it's not a base64 data URL, assume it's a seed path/url and allow it.
  if (!logoPath.startsWith('data:')) {
    return { isValid: true };
  }

  // Validate format (PNG, JPG, JPEG, SVG)
  const formatMatch = logoPath.match(/^data:(image\/[a-zA-Z+-]+);base64,/);
  if (!formatMatch) {
    return { isValid: false, error: 'Format gambar tidak didukung. Gunakan PNG, JPG, JPEG, atau SVG.' };
  }

  const mimeType = formatMatch[1];
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  if (!allowedMimeTypes.includes(mimeType)) {
    return { isValid: false, error: 'Format gambar tidak didukung. Gunakan PNG, JPG, JPEG, atau SVG.' };
  }

  // Validate size (max 5 MB)
  const base64Data = logoPath.split(',')[1];
  if (!base64Data) {
    return { isValid: false, error: 'File gambar rusak atau tidak valid.' };
  }
  const padding = (base64Data.match(/=/g) || []).length;
  const sizeInBytes = (base64Data.length * 3 / 4) - padding;
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  if (sizeInBytes > maxSizeBytes) {
    return { isValid: false, error: 'Ukuran file melebihi batas maksimum 5 MB.' };
  }

  return { isValid: true };
}

/**
 * Helper: Recalculate a wallet's balance from all its transactions.
 * This is the source of truth — called after any transaction mutation.
 */
export function recalculateWalletBalance(walletId: string): void {
  // Income adds to wallet, expense subtracts, transfer-from subtracts
  const incomeSum = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'income'`
  ).get(walletId) as { total: number };

  const expenseSum = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'expense'`
  ).get(walletId) as { total: number };

  const transferOutSum = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'transfer'`
  ).get(walletId) as { total: number };

  const transferInSum = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE to_wallet_id = ? AND type = 'transfer'`
  ).get(walletId) as { total: number };

  const newBalance = incomeSum.total - expenseSum.total - transferOutSum.total + transferInSum.total;

  db.prepare(`
    UPDATE wallets SET balance = ?, updated_at = datetime('now', 'localtime') WHERE id = ?
  `).run(newBalance, walletId);
}
