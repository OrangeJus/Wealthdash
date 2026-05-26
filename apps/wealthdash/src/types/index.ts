// ============================================================
// Shared TypeScript types for WealthDash frontend ↔ backend
// ============================================================

// ── Wallets ──────────────────────────────────────────────────
export interface Wallet {
  id: string;
  name: string;
  icon: string;
  logo_path: string | null;
  cluster: 'liquid' | 'savings' | 'investment';
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletsResponse {
  wallets: Wallet[];
  totals: Record<string, number>;
  totalBalance: number;
}

// ── Categories ──────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  sort_order: number;
  logo_path?: string | null;
  budget?: number | null;
  created_at: string;
  transaction_count?: number;
  spent_this_month?: number;
}

export interface CategoriesResponse {
  income: Category[];
  expense: Category[];
  all: Category[];
}

// ── Transactions ────────────────────────────────────────────
export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category_id: string | null;
  wallet_id: string;
  to_wallet_id: string | null;
  note: string | null;
  created_at: string;
  // Joined fields
  category_name?: string;
  category_icon?: string;
  wallet_name?: string;
  to_wallet_name?: string;
}

export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: TransactionPagination;
}

export interface TransactionFilters {
  type?: string;
  category_id?: string;
  wallet_id?: string;
  date_from?: string;
  date_to?: string;
  period?: string;
  page?: number;
  limit?: number;
}

// ── Analytics ───────────────────────────────────────────────
export interface OverviewData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  prevMonthExpenses: number;
  prevMonthIncome: number;
  expenseLimit: number;
  savingsTarget: number;
  monthlySavings: number;
  period: string;
}

export interface CashflowPoint {
  period: string;
  income: number;
  expense: number;
}

export interface TopExpenseItem {
  category: string;
  icon: string;
  budget?: number;
  total: number;
  count: number;
  logo_path?: string | null;
}

export interface AssetAllocationItem {
  cluster: string;
  total: number;
  wallet_count: number;
  percentage: string;
}

export interface AssetAllocationResponse {
  allocation: AssetAllocationItem[];
  grandTotal: number;
}

export interface SavingsRatePoint {
  period: string;
  income: number;
  expense: number;
  savings: number;
  rate: string;
}

// ── Budgets ─────────────────────────────────────────────────
export interface Budget {
  id: string;
  name: string;
  category: string | null;
  type: 'wajib' | 'langganan' | 'wishlist';
  estimate: number;
  is_done: number;
  details: string | null; // JSON string
  period: string;
  created_at: string;
}

export interface BudgetsResponse {
  bills: Budget[];
  wishlist: Budget[];
  summary: {
    totalEstimate: number;
    paidTotal: number;
    unpaidCount: number;
  };
  period: string;
}

// ── Savings ─────────────────────────────────────────────────
export interface SavingsTarget {
  id: string;
  name: string;
  icon: string;
  monthly_amount: number;
  is_active: number;
  created_at: string;
}

export interface SavingsProgress {
  period: string;
  targets: SavingsTarget[];
  totalTarget: number;
  routineDeposited: number;
  topupDeposited: number;
  totalDeposited: number;
  rollover: number;
  effectiveTarget: number;
  remaining: number;
  percentage: number;
}

export interface SavingsHistoryRow {
  month: string;
  target: number;
  achieved: number;
  deficit: number;
  carriedForward: number;
}

// ── Investments ─────────────────────────────────────────────
export interface StockHolding {
  id: string;
  code: string;
  name: string;
  buy_price: number;
  lots: number;
  current_price: number;
  bought_at: string;
  // Computed
  shares: number;
  totalModal: number;
  marketValue: number;
  floatingPnl: number;
  floatingPnlPercent: number;
}

export interface HoldingsResponse {
  holdings: StockHolding[];
  summary: {
    totalModal: number;
    totalMarketValue: number;
    totalFloatingPnl: number;
    totalFloatingPnlPercent: number;
  };
}

// ── Settings ────────────────────────────────────────────────
export interface AppSettings {
  expense_limit: string;
  savings_target: string;
  [key: string]: string;
}

// ── API Response Wrapper ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
