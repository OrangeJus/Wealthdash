import { describe, it, expect } from 'vitest';
import { formatNumberString, parseNumberString } from '../hooks/useApi';

describe('formatNumberString — Format angka dengan pemisah ribuan', () => {
  it('memformat angka ribuan: 1000 → 1.000', () => {
    expect(formatNumberString('1000')).toBe('1.000');
  });

  it('memformat angka jutaan: 1000000 → 1.000.000', () => {
    expect(formatNumberString('1000000')).toBe('1.000.000');
  });

  it('memformat angka puluhan juta: 25000000 → 25.000.000', () => {
    expect(formatNumberString('25000000')).toBe('25.000.000');
  });

  it('memformat dari tipe number: 500000 → 500.000', () => {
    expect(formatNumberString(500000)).toBe('500.000');
  });

  it('membersihkan karakter non-angka: abc1250xyz → 1.250', () => {
    expect(formatNumberString('abc1250xyz')).toBe('1.250');
  });

  it('mengembalikan string kosong untuk null', () => {
    expect(formatNumberString(null)).toBe('');
  });

  it('mengembalikan string kosong untuk undefined', () => {
    expect(formatNumberString(undefined)).toBe('');
  });

  it('mengembalikan string kosong untuk string kosong', () => {
    expect(formatNumberString('')).toBe('');
  });
});

describe('parseNumberString — Parse string terformat ke integer', () => {
  it('menguraikan string terformat: 1.250.000 → 1250000', () => {
    expect(parseNumberString('1.250.000')).toBe(1250000);
  });

  it('menguraikan string campuran: Rp 50.000 → 50000', () => {
    expect(parseNumberString('Rp 50.000')).toBe(50000);
  });

  it('mengembalikan 0 untuk null', () => {
    expect(parseNumberString(null)).toBe(0);
  });

  it('mengembalikan 0 untuk undefined', () => {
    expect(parseNumberString(undefined)).toBe(0);
  });
});

describe('Roundtrip — format → parse', () => {
  it('1000000 → format → parse → 1000000', () => {
    const formatted = formatNumberString(1000000);
    const parsed = parseNumberString(formatted);
    expect(parsed).toBe(1000000);
  });

  it('25000000 → format → parse → 25000000', () => {
    const formatted = formatNumberString(25000000);
    const parsed = parseNumberString(formatted);
    expect(parsed).toBe(25000000);
  });
});
