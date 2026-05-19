import { v4 as uuidv4 } from 'uuid';

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
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
