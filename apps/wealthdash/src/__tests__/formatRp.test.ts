import { describe, it, expect } from 'vitest';
import { formatRp, formatRpShort } from '../hooks/useApi';

describe('formatRp — Format Rupiah currency', () => {
  it('memformat angka standar: 1000000 → mengandung Rp dan 1.000.000', () => {
    const result = formatRp(1000000);
    expect(result).toContain('Rp');
    expect(result).toContain('1.000.000');
  });

  it('memformat nol: 0 → mengandung Rp dan 0', () => {
    const result = formatRp(0);
    expect(result).toContain('Rp');
    expect(result).toContain('0');
  });

  it('memformat angka besar tanpa desimal', () => {
    const result = formatRp(999999999);
    expect(result).toContain('Rp');
    // Tidak boleh ada koma (desimal)
    expect(result).not.toContain(',');
    expect(result).toContain('999.999.999');
  });
});

describe('formatRpShort — Format Rupiah with financial notation', () => {
  it('memformat nominal kecil di bawah 1000', () => {
    expect(formatRpShort(500)).toBe('Rp 500');
  });

  it('memformat nominal ribuan (Rb)', () => {
    expect(formatRpShort(15000)).toBe('Rp 15 Rb');
    expect(formatRpShort(150000)).toBe('Rp 150 Rb');
  });

  it('memformat nominal jutaan (Jt) dengan maksimal 2 desimal', () => {
    expect(formatRpShort(1500000)).toBe('Rp 1,5 Jt');
    expect(formatRpShort(10000000)).toBe('Rp 10 Jt');
    expect(formatRpShort(100000000)).toBe('Rp 100 Jt');
  });

  it('memformat nominal miliaran (M) dengan desimal', () => {
    expect(formatRpShort(1250000000)).toBe('Rp 1,25 M');
    expect(formatRpShort(10000000000)).toBe('Rp 10 M');
  });

  it('memformat nominal triliunan (T)', () => {
    expect(formatRpShort(1000000000000)).toBe('Rp 1 T');
  });

  it('memformat nominal negatif dengan benar', () => {
    expect(formatRpShort(-1500000)).toBe('Rp -1,5 Jt');
    expect(formatRpShort(-15000)).toBe('Rp -15 Rb');
  });
});
