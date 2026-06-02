import { describe, it, expect } from 'vitest';
import { generateId, successResponse, errorResponse, safeInt, currentPeriod, today } from '../utils/helpers.js';

describe('Helper Utilities', () => {
  describe('generateId()', () => {
    it('menghasilkan UUID v4 valid', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('menghasilkan UUID unik setiap pemanggilan', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('successResponse()', () => {
    it('membungkus data dengan benar', () => {
      const result = successResponse({ id: 1 });
      expect(result).toEqual({
        success: true,
        message: 'OK',
        data: { id: 1 },
      });
    });

    it('menerima pesan kustom', () => {
      const result = successResponse({ id: 1 }, 'Berhasil');
      expect(result).toEqual({
        success: true,
        message: 'Berhasil',
        data: { id: 1 },
      });
    });
  });

  describe('errorResponse()', () => {
    it('membungkus pesan error', () => {
      const result = errorResponse('Gagal');
      expect(result).toEqual({
        success: false,
        message: 'Gagal',
      });
    });
  });

  describe('safeInt()', () => {
    it('mengkonversi string angka ke integer', () => {
      expect(safeInt('1000')).toBe(1000);
    });

    it('mengkonversi angka negatif', () => {
      expect(safeInt('-500')).toBe(-500);
    });

    it('mengembalikan default untuk nilai invalid', () => {
      expect(safeInt('abc')).toBe(0);
    });

    it('mengembalikan custom default', () => {
      expect(safeInt('xyz', 100)).toBe(100);
    });

    it('menangani string dengan dot pemisah ribuan', () => {
      expect(safeInt('12.000')).toBe(12000);
      expect(safeInt('1.250.000')).toBe(1250000);
    });

    it('menangani string dengan simbol mata uang dan dot', () => {
      expect(safeInt('Rp 50.000')).toBe(50000);
      expect(safeInt('Rp -25.000')).toBe(-25000);
    });

    it('menangani tipe input number secara langsung', () => {
      expect(safeInt(12000)).toBe(12000);
      expect(safeInt(-150.5)).toBe(-151);
    });
  });

  describe('currentPeriod()', () => {
    it('mengembalikan format YYYY-MM', () => {
      const period = currentPeriod();
      expect(period).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('today()', () => {
    it('mengembalikan format YYYY-MM-DD', () => {
      const date = today();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
