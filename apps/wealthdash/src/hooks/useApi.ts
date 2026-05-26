import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic hook for fetching data from the API.
 * Returns { data, loading, error, refetch }.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((res) => {
        if (isMounted.current) setData(res);
      })
      .catch((err) => {
        if (isMounted.current) setError(err.message || 'Unknown error');
      })
      .finally(() => {
        if (isMounted.current) setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * Format number as Rupiah string (frontend-side).
 */
export function formatRp(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format string or number with thousands separator (id-ID) dynamically.
 */
export function formatNumberString(val: string | number | null | undefined): string {
  if (val === undefined || val === null || val === '') return '';
  const raw = String(val).replace(/\D/g, '');
  if (!raw) return '';
  return new Intl.NumberFormat('id-ID').format(Number(raw));
}

/**
 * Strip thousands separators and parse clean integer.
 */
export function parseNumberString(val: string | null | undefined): number {
  if (!val) return 0;
  const raw = String(val).replace(/\D/g, '');
  return raw ? parseInt(raw, 10) : 0;
}
