import { useApi } from '../hooks/useApi';
import { analyticsApi } from '../services/api';

interface SavingsRateChartProps {
  refreshTrigger?: number;
}

const SavingsRateChart = ({ refreshTrigger = 0 }: SavingsRateChartProps) => {
  const { data: savingsRate } = useApi(() => analyticsApi.savingsRate(6), [refreshTrigger]);

  const formatMonth = (period: string) => {
    const [, m] = period.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months[parseInt(m) - 1] || m;
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Savings Rate</h3>

      <div className="flex-1 flex flex-col gap-3">
        {(savingsRate || []).map((point, idx) => {
          const rate = parseFloat(point.rate);
          const isPositive = rate >= 0;
          return (
            <div key={idx} className="flex items-center gap-3">
              <span className="font-label-caps text-[11px] text-on-surface-variant w-10">{formatMonth(point.period)}</span>
              <div className="flex-1 bg-surface-container-high rounded-full h-5 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-secondary' : 'bg-error'}`}
                  style={{ width: `${Math.min(100, Math.abs(rate))}%` }}
                ></div>
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 font-data-sm text-[11px] font-semibold ${isPositive ? 'text-on-surface' : 'text-error'}`}>
                  {rate}%
                </span>
              </div>
            </div>
          );
        })}
        {(!savingsRate || savingsRate.length === 0) && (
          <p className="text-on-surface-variant text-center py-8">Belum ada data</p>
        )}
      </div>
    </div>
  );
};

export default SavingsRateChart;
