import { useApi, formatRp } from '../hooks/useApi';
import { analyticsApi } from '../services/api';
import OverviewCard from '../components/OverviewCard';
import ProgressBarCard from '../components/ProgressBarCard';
import CashFlowChart from '../components/CashFlowChart';
import AssetAllocation from '../components/AssetAllocation';
import RecentTransactions from '../components/RecentTransactions';

interface DashboardProps {
  onOpenTransaction: () => void;
  onViewAllTransactions: () => void;
}

const Dashboard = ({ onOpenTransaction, onViewAllTransactions }: DashboardProps) => {
  const { data: overview } = useApi(() => analyticsApi.overview(), []);

  // Compute trends vs previous month
  const expenseTrend = overview && overview.prevMonthExpenses > 0
    ? (((overview.monthlyExpenses - overview.prevMonthExpenses) / overview.prevMonthExpenses) * 100).toFixed(1)
    : overview?.monthlyExpenses ? '100.0' : '0.0';
  const incomeTrend = overview && overview.prevMonthIncome > 0
    ? (((overview.monthlyIncome - overview.prevMonthIncome) / overview.prevMonthIncome) * 100).toFixed(1)
    : overview?.monthlyIncome ? '100.0' : '0.0';
  // Balance trend: compare this month's net (income - expense) vs last month's net
  const thisMonthNet = overview ? overview.monthlyIncome - overview.monthlyExpenses : 0;
  const prevMonthNet = overview ? overview.prevMonthIncome - overview.prevMonthExpenses : 0;
  const balanceTrend = prevMonthNet !== 0
    ? (((thisMonthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100).toFixed(1)
    : thisMonthNet > 0 ? '100.0' : '0.0';

  // Expense limit progress
  const expensePercent = overview && overview.expenseLimit > 0
    ? Math.min(100, Math.round((overview.monthlyExpenses / overview.expenseLimit) * 100))
    : 0;
  const expenseRemaining = overview ? Math.max(0, overview.expenseLimit - overview.monthlyExpenses) : 0;

  // Savings target progress
  const savingsPercent = overview && overview.savingsTarget > 0
    ? Math.min(100, Math.round((overview.monthlySavings / overview.savingsTarget) * 100))
    : 0;

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop w-full max-w-container-max-width mx-auto">
      {/* Page Header (Desktop) */}
      <div className="hidden md:flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-background">Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Welcome back. Here is your financial summary.</p>
        </div>
        <button 
          onClick={onOpenTransaction}
          className="bg-secondary text-on-secondary px-5 py-2.5 rounded-lg font-label-caps text-label-caps flex items-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          Tambah Transaksi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-card-gap">
        {/* ROW 1: Summary Cards */}
        <OverviewCard 
          title="Total Balance" 
          icon="account_balance_wallet" 
          iconBgClass="bg-surface-container" 
          iconTextClass="text-on-surface-variant" 
          amount={overview ? formatRp(overview.totalBalance) : '...'}
          trendIcon={Number(balanceTrend) >= 0 ? "trending_up" : "trending_down"}
          trendText={`${Number(balanceTrend) >= 0 ? '+' : ''}${balanceTrend}%`}
          trendBgClass={Number(balanceTrend) >= 0 ? "bg-[#dcfce7]" : "bg-[#fee2e2]"}
          trendTextClass={Number(balanceTrend) >= 0 ? "text-[#166534]" : "text-[#991b1b]"}
        />
        <OverviewCard 
          title="Monthly Income" 
          icon="arrow_downward" 
          iconBgClass="bg-secondary/10" 
          iconTextClass="text-secondary" 
          amount={overview ? formatRp(overview.monthlyIncome) : '...'}
          trendIcon={Number(incomeTrend) > 0 ? "trending_up" : "trending_flat"}
          trendText={`${Number(incomeTrend) >= 0 ? '+' : ''}${incomeTrend}%`}
          trendBgClass="bg-[#f1f5f9]" 
          trendTextClass="text-[#475569]" 
        />
        <OverviewCard 
          title="Monthly Expenses" 
          icon="arrow_upward" 
          iconBgClass="bg-error-container/50" 
          iconTextClass="text-on-error-container" 
          amount={overview ? formatRp(overview.monthlyExpenses) : '...'}
          trendIcon={Number(expenseTrend) > 0 ? "trending_up" : "trending_down"}
          trendText={`${Number(expenseTrend) >= 0 ? '+' : ''}${expenseTrend}%`}
          trendBgClass={Number(expenseTrend) > 10 ? "bg-[#fee2e2]" : "bg-[#f1f5f9]"}
          trendTextClass={Number(expenseTrend) > 10 ? "text-[#991b1b]" : "text-[#475569]"}
        />

        {/* ROW 2: Dual Progress Bars */}
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-card-gap">
          <ProgressBarCard 
            title="Expense Limit" 
            subtitle={`${expensePercent}% used of ${overview ? formatRp(overview.expenseLimit) : '...'}`}
            amountText={`${overview ? formatRp(expenseRemaining) : '...'} left`}
            percentage={expensePercent} 
            type="expense"
          />
          <ProgressBarCard 
            title="Savings Target" 
            subtitle={`${savingsPercent}% reached of ${overview ? formatRp(overview.savingsTarget) : '...'}`}
            amountText={overview ? formatRp(overview.monthlySavings) : '...'}
            percentage={savingsPercent} 
            type="savings"
          />
        </div>

        {/* ROW 3: Charts */}
        <CashFlowChart />
        <AssetAllocation />

        {/* ROW 4: Recent Transactions Table */}
        <RecentTransactions onViewAll={onViewAllTransactions} />
      </div>

      {/* Bottom spacing for scroll */}
      <div className="h-12 w-full"></div>
    </div>
  );
};

export default Dashboard;
