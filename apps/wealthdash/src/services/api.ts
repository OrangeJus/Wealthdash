import type {
  ApiResponse,
  WalletsResponse,
  Wallet,
  CategoriesResponse,
  Category,
  Transaction,
  TransactionsResponse,
  TransactionFilters,
  OverviewData,
  CashflowPoint,
  TopExpenseItem,
  AssetAllocationResponse,
  SavingsRatePoint,
  BudgetsResponse,
  Budget,
  SavingsTarget,
  SavingsProgress,
  SavingsHistoryRow,
  HoldingsResponse,
  StockHolding,
  AppSettings,
} from '../types/index';

// ============================================================
// API Base Configuration
// ============================================================
const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || `API error: ${res.status}`);
  }

  return json.data;
}

// ============================================================
// Wallets
// ============================================================
export const walletsApi = {
  list: () => request<WalletsResponse>('/wallets'),
  get: (id: string) => request<Wallet>(`/wallets/${id}`),
  create: (data: Partial<Wallet>) =>
    request<Wallet>('/wallets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Wallet>) =>
    request<Wallet>(`/wallets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<null>(`/wallets/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Categories
// ============================================================
export const categoriesApi = {
  list: () => request<CategoriesResponse>('/categories'),
  get: (id: string) => request<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<null>(`/categories/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Transactions
// ============================================================
export const transactionsApi = {
  list: (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
      });
    }
    const qs = params.toString();
    return request<TransactionsResponse>(`/transactions${qs ? '?' + qs : ''}`);
  },
  recent: () => request<Transaction[]>('/transactions/recent'),
  create: (data: {
    date: string;
    type: string;
    amount: number;
    category_id?: string | null;
    wallet_id: string;
    to_wallet_id?: string | null;
    note?: string;
  }) => request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Transaction>) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<null>(`/transactions/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Analytics
// ============================================================
export const analyticsApi = {
  overview: () => request<OverviewData>('/analytics/overview'),
  cashflow: (months = 6) => request<CashflowPoint[]>(`/analytics/cashflow?months=${months}`),
  topExpenses: (period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return request<TopExpenseItem[]>(`/analytics/top-expenses${qs}`);
  },
  assetAllocation: () => request<AssetAllocationResponse>('/analytics/asset-allocation'),
  savingsRate: (months = 6) => request<SavingsRatePoint[]>(`/analytics/savings-rate?months=${months}`),
};

// ============================================================
// Budgets
// ============================================================
export const budgetsApi = {
  list: (period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return request<BudgetsResponse>(`/budgets${qs}`);
  },
  create: (data: Partial<Budget>) =>
    request<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Budget>) =>
    request<Budget>(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggle: (id: string, wallet_id?: string) =>
    request<Budget>(`/budgets/${id}/toggle`, {
      method: 'PATCH',
      body: wallet_id ? JSON.stringify({ wallet_id }) : undefined,
    }),
  delete: (id: string) =>
    request<null>(`/budgets/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Savings
// ============================================================
export const savingsApi = {
  listTargets: () => request<SavingsTarget[]>('/savings/targets'),
  createTarget: (data: { name: string; icon?: string; monthly_amount: number }) =>
    request<SavingsTarget>('/savings/targets', { method: 'POST', body: JSON.stringify(data) }),
  updateTarget: (id: string, data: Partial<SavingsTarget>) =>
    request<SavingsTarget>(`/savings/targets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  progress: (period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return request<SavingsProgress>(`/savings/progress${qs}`);
  },
  deposit: (data: { target_id?: string; wallet_id: string; amount: number; type: 'routine' | 'topup'; period?: string }) =>
    request<any>('/savings/deposit', { method: 'POST', body: JSON.stringify(data) }),
  history: () => request<SavingsHistoryRow[]>('/savings/history'),
  listDeposits: () => request<any[]>('/savings/deposits'),
  updateDeposit: (id: string, data: { amount?: number; wallet_id?: string }) =>
    request<any>(`/savings/deposits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDeposit: (id: string) =>
    request<null>(`/savings/deposits/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Investments
// ============================================================
export const investmentsApi = {
  holdings: () => request<HoldingsResponse>('/investments/holdings'),
  rdnBalance: () => request<{ balance: number; wallet: Wallet | null }>('/investments/rdn-balance'),
  buy: (data: { code: string; name?: string; price: number; lots: number }) =>
    request<StockHolding>('/investments/buy', { method: 'POST', body: JSON.stringify(data) }),
  sell: (data: { holding_id: string; sell_price: number }) =>
    request<any>('/investments/sell', { method: 'POST', body: JSON.stringify(data) }),
  updatePrice: (id: string, current_price: number) =>
    request<StockHolding>(`/investments/holdings/${id}/price`, {
      method: 'PATCH',
      body: JSON.stringify({ current_price }),
    }),
  rdnTopup: (data: { from_wallet_id: string; amount: number }) =>
    request<null>('/investments/rdn/topup', { method: 'POST', body: JSON.stringify(data) }),
  rdnWithdraw: (data: { to_wallet_id: string; amount: number }) =>
    request<null>('/investments/rdn/withdraw', { method: 'POST', body: JSON.stringify(data) }),
  updateAllPrices: () =>
    request<{ updated: number; failed: number; results: any[] }>('/investments/update-prices', { method: 'POST' }),
};

// ============================================================
// Settings
// ============================================================
export const settingsApi = {
  get: () => request<AppSettings>('/settings'),
  update: (key: string, value: string) =>
    request<{ key: string; value: string }>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
  reset: () => request<null>('/settings/reset', { method: 'DELETE' }),
};

// ============================================================
// Export
// ============================================================
export const exportApi = {
  downloadCSV: async (type: 'transactions' | 'wallets' | 'budgets' | 'holdings' | 'all') => {
    const res = await fetch(`${API_BASE}/export/${type}`);
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || `wealthdash_${type}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
