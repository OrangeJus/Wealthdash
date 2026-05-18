import IncomeExpenseChart from '../components/IncomeExpenseChart';
import TopExpenses from '../components/TopExpenses';
import SavingsRateChart from '../components/SavingsRateChart';

const Analytics = () => {
  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop w-full max-w-container-max-width mx-auto">
      <div className="flex flex-col gap-card-gap pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="font-display-lg text-display-lg hidden md:block">Analitik Keuangan</h1>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:hidden">Analitik Keuangan</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Tinjauan performa finansial komprehensif Anda.</p>
          </div>
          <button className="flex items-center gap-2 font-label-caps text-label-caps border border-outline-variant text-on-surface px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Data
          </button>
        </div>

        {/* Section 1: Monthly Trend */}
        <IncomeExpenseChart />

        {/* Section 2: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-card-gap">
          <TopExpenses />
          <SavingsRateChart />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
