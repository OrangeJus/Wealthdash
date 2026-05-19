import { useApi, formatRp } from '../hooks/useApi';
import { analyticsApi } from '../services/api';

const IncomeExpenseChart = () => {
  const { data: cashflow } = useApi(() => analyticsApi.cashflow(6), []);

  const formatMonth = (period: string) => {
    const [, m] = period.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months[parseInt(m) - 1] || m;
  };

  const maxValue = cashflow ? Math.max(...cashflow.map(d => Math.max(d.income, d.expense)), 1) : 1;

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-headline-md text-on-surface">Tren Bulanan</h3>
        <div className="flex items-center gap-4 font-body-sm text-[12px]">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-secondary"></div>Income</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-error"></div>Expense</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-tertiary"></div>Net</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-variant">
              <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Bulan</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant text-right">Income</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant text-right">Expense</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant text-right">Net</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant w-[200px]">Visual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {(cashflow || []).map((point, idx) => {
              const net = point.income - point.expense;
              return (
                <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-body-sm font-medium">{formatMonth(point.period)}</td>
                  <td className="py-3 px-4 font-data-sm text-right text-secondary">{formatRp(point.income)}</td>
                  <td className="py-3 px-4 font-data-sm text-right text-error">{formatRp(point.expense)}</td>
                  <td className={`py-3 px-4 font-data-sm text-right font-semibold ${net >= 0 ? 'text-secondary' : 'text-error'}`}>{formatRp(net)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 items-end h-6">
                      <div className="bg-secondary rounded-sm transition-all" style={{ width: `${(point.income / maxValue) * 100}%`, height: '100%' }}></div>
                      <div className="bg-error rounded-sm transition-all" style={{ width: `${(point.expense / maxValue) * 100}%`, height: '100%' }}></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
