import { useApi, formatRp } from '../hooks/useApi';
import { analyticsApi, categoriesApi } from '../services/api';
import type { TransactionFilters } from '../types';

interface TransactionChartsProps {
  onViewCategories?: () => void;
  filters?: TransactionFilters;
}

const TransactionCharts = ({ onViewCategories, filters }: TransactionChartsProps) => {
  const { data: overview } = useApi(() => analyticsApi.overview(filters), [JSON.stringify(filters)]);
  const { data: topExpenses } = useApi(() => analyticsApi.topExpenses(filters), [JSON.stringify(filters)]);
  const { data: categoriesData } = useApi(() => categoriesApi.list(), []);

  const income = overview?.monthlyIncome || 0;
  const expense = overview?.monthlyExpenses || 0;
  const net = income - expense;
  const maxBar = Math.max(income, expense, 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Chart 1: Income vs Expense Summary */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Arus Kas (Periode Aktif)</h3>
        
        <div className="flex justify-center gap-12 items-end h-36 mt-4">
          {/* Income Bar */}
          <div className="flex flex-col items-center justify-end h-full gap-2">
            <span className="font-data-sm text-[12px] text-[#166534] font-medium">{formatRp(income)}</span>
            <div className="w-[50px] bg-[#dcfce7] rounded-t-md transition-all duration-500" style={{ height: `${Math.max(10, (income / maxBar) * 80)}%` }}></div>
            <span className="font-label-caps text-[11px] text-[#166534] uppercase font-semibold">Pemasukan</span>
          </div>
          {/* Expense Bar */}
          <div className="flex flex-col items-center justify-end h-full gap-2">
            <span className="font-data-sm text-[12px] text-[#991b1b] font-medium">{formatRp(expense)}</span>
            <div className="w-[50px] bg-[#fee2e2] rounded-t-md transition-all duration-500" style={{ height: `${Math.max(10, (expense / maxBar) * 80)}%` }}></div>
            <span className="font-label-caps text-[11px] text-[#991b1b] uppercase font-semibold">Pengeluaran</span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-outline-variant/30">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Surplus / Defisit</span>
          <span className={`font-data-md text-data-md font-semibold ${net >= 0 ? 'text-[#166534]' : 'text-[#991b1b]'}`}>{net >= 0 ? '+ ' : '- '}{formatRp(Math.abs(net))}</span>
        </div>
      </div>

      {/* Chart 2: Top Expenses by Category */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-6">Pengeluaran Terbesar</h3>
          <div className="flex flex-col gap-5 mt-2">
            {(topExpenses || []).slice(0, 3).map((cat) => {
              const maxAmount = topExpenses && topExpenses.length > 0 ? topExpenses[0].total : 1;
              let percentage = (cat.total / maxAmount) * 100;
              let barColor = '#3b82f6'; // default blue if no budget

              // Find budget from category data as fallback
              const categoryInfo = categoriesData?.all?.find(c => c.name === cat.category);
              const actualBudget = cat.budget || categoryInfo?.budget || 0;

              if (actualBudget > 0) {
                percentage = Math.min((cat.total / actualBudget) * 100, 100);
                const usageRatio = cat.total / actualBudget;
                barColor = usageRatio >= 0.9 ? '#ef4444' : usageRatio >= 0.7 ? '#f59e0b' : '#10b981';
              }

              return (
                <div key={cat.category} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end font-body-sm text-[12px]">
                    <span className="flex items-center gap-1.5 font-semibold text-on-surface">
                      {cat.logo_path ? (
                        <img src={cat.logo_path} alt={cat.category} className="w-5 h-5 rounded object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{cat.icon || 'category'}</span>
                      )}
                      {cat.category}
                    </span>
                    <div className="text-right flex flex-col">
                      <span className="font-bold text-on-surface">{formatRp(cat.total)}</span>
                      <span className="text-[10px] text-on-surface-variant">
                        {actualBudget > 0 ? `${Math.round((cat.total / actualBudget) * 100)}% dari ${formatRp(actualBudget)}` : `${cat.count} transaksi`}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner mt-0.5">
                    {actualBudget === 0 ? (
                      <div className="bg-gradient-to-r from-outline-variant/10 to-outline-variant/30 h-full rounded-full w-full"></div>
                    ) : (
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: barColor }}></div>
                    )}
                  </div>
                </div>
              );
            })}
            {(!topExpenses || topExpenses.length === 0) && (
              <p className="text-on-surface-variant text-center py-4">Belum ada data</p>
            )}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-end">
          <button 
            onClick={onViewCategories} 
            className="flex items-center gap-2 font-label-caps text-[12px] text-secondary hover:text-on-secondary hover:bg-secondary border border-secondary px-4 py-2 rounded-lg transition-colors w-full justify-center sm:w-auto"
          >
            Lihat Rincian Kategori
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionCharts;
