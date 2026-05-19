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
          amount="Rp 12.450.000" 
          trendIcon="trending_up" 
          trendText="+2.4%" 
          trendBgClass="bg-[#dcfce7]" 
          trendTextClass="text-[#166534]" 
        />
        <OverviewCard 
          title="Monthly Income" 
          icon="arrow_downward" 
          iconBgClass="bg-secondary/10" 
          iconTextClass="text-secondary" 
          amount="Rp 5.000.000" 
          trendIcon="trending_flat" 
          trendText="0.0%" 
          trendBgClass="bg-[#f1f5f9]" 
          trendTextClass="text-[#475569]" 
        />
        <OverviewCard 
          title="Monthly Expenses" 
          icon="arrow_upward" 
          iconBgClass="bg-error-container/50" 
          iconTextClass="text-on-error-container" 
          amount="Rp 1.850.000" 
          trendIcon="trending_up" 
          trendText="+12.5%" 
          trendBgClass="bg-[#fee2e2]" 
          trendTextClass="text-[#991b1b]" 
        />

        {/* ROW 2: Dual Progress Bars */}
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-card-gap">
          <ProgressBarCard 
            title="Expense Limit" 
            subtitle="60% used of Rp 3.000.000" 
            amountText="Rp 1.150.000 left" 
            percentage={60} 
            type="expense"
          />
          <ProgressBarCard 
            title="Savings Target" 
            subtitle="80% reached of Rp 10.000.000" 
            amountText="Rp 8.000.000" 
            percentage={80} 
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
