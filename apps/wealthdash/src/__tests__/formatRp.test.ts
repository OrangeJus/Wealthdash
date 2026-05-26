import { describe, it, expect } from 'vitest';
import { formatRp } from '../hooks/useApi';

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
