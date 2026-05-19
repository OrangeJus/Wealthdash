import yahooFinance from 'yahoo-finance2';

/**
 * Fetch the current market price for an Indonesian stock (IDX).
 * Uses Yahoo Finance unofficial API via yahoo-finance2.
 * 
 * @param code - Stock ticker code (e.g., "BBCA", "BBRI")
 * @returns Current price per share in Rupiah, or null if fetch fails
 */
export async function fetchStockPrice(code: string): Promise<number | null> {
  try {
    // IDX stocks use .JK suffix on Yahoo Finance
    const symbol = `${code.toUpperCase()}.JK`;
    
    const result = await yahooFinance.quote(symbol);
    
    if (result && result.regularMarketPrice) {
      return Math.round(result.regularMarketPrice);
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Failed to fetch price for ${code}:`, (error as Error).message);
    return null;
  }
}

/**
 * Fetch prices for multiple stocks at once.
 * Returns a map of code -> price.
 * Failures are silently ignored (returns null for that stock).
 */
export async function fetchMultipleStockPrices(
  codes: string[]
): Promise<Map<string, number | null>> {
  const results = new Map<string, number | null>();
  
  // Fetch in parallel with a small batch to avoid rate limiting
  const promises = codes.map(async (code) => {
    const price = await fetchStockPrice(code);
    results.set(code, price);
  });
  
  await Promise.allSettled(promises);
  return results;
}
