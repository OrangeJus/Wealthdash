import { useApi, formatRp } from '../hooks/useApi';
import { analyticsApi, categoriesApi } from '../services/api';

interface TopExpensesProps {
  refreshTrigger?: number;
}

const TopExpenses = ({ refreshTrigger = 0 }: TopExpensesProps) => {
  const { data: topExpenses } = useApi(() => analyticsApi.topExpenses(), [refreshTrigger]);
  const { data: categoriesData } = useApi(() => categoriesApi.list(), [refreshTrigger]);

  const maxAmount = topExpenses ? Math.max(...topExpenses.map(e => e.total), 1) : 1;

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Top Pengeluaran</h3>

      <div className="flex flex-col gap-4 flex-1">
        {(topExpenses || []).map((item, idx) => {
          let progressColor = 'bg-primary'; // Default if no budget
          let containerColor = 'bg-primary-container/30';
          let iconColor = 'text-primary';
          
          let percentage = (item.total / maxAmount) * 100;
          let showBudgetWarning = false;

          const categoryInfo = categoriesData?.all?.find(c => c.name === item.category);
          const actualBudget = item.budget || categoryInfo?.budget || 0;

          if (actualBudget > 0) {
            percentage = Math.min((item.total / actualBudget) * 100, 100);
            const usageRatio = item.total / actualBudget;
            
            if (usageRatio < 0.7) {
              progressColor = 'bg-[#166534]'; // Green
              containerColor = 'bg-[#dcfce7]';
              iconColor = 'text-[#166534]';
            } else if (usageRatio < 0.9) {
              progressColor = 'bg-[#f59e0b]'; // Orange
              containerColor = 'bg-[#fef3c7]';
              iconColor = 'text-[#d97706]';
            } else {
              progressColor = 'bg-[#dc2626]'; // Red
              containerColor = 'bg-[#fee2e2]';
              iconColor = 'text-[#b91c1c]';
              showBudgetWarning = true;
            }
          }

          return (
            <div key={idx} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${containerColor} ${iconColor} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon || 'category'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">
                    {item.category}
                    {showBudgetWarning && <span className="ml-2 text-[10px] bg-[#fee2e2] text-[#b91c1c] px-1.5 py-0.5 rounded uppercase font-bold">Over Budget</span>}
                  </span>
                  <span className="font-data-sm text-data-sm text-on-surface">{formatRp(item.total)}</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${progressColor} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  {item.count} transaksi {item.budget ? `• Target: ${formatRp(item.budget)}` : ''}
                </span>
              </div>
            </div>
          );
        })}
        {(!topExpenses || topExpenses.length === 0) && (
          <p className="text-on-surface-variant text-center py-8">Belum ada data pengeluaran</p>
        )}
      </div>
    </div>
  );
};

export default TopExpenses;
