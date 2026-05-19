import { useApi, formatRp } from '../hooks/useApi';
import { analyticsApi } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CashFlowChart = () => {
  const { data: cashflow } = useApi(() => analyticsApi.cashflow(6), []);

  const formatMonth = (period: string) => {
    if (!period) return '';
    const [y, m] = period.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(m) - 1] || m;
  };

  const yAxisFormatter = (value: number) => {
    if (value === 0) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  // Ensure data is sorted by period if it isn't already
  const sortedData = cashflow ? [...cashflow].sort((a, b) => a.period.localeCompare(b.period)) : [];
  
  // Map data to match exact desired format
  const chartData = sortedData.map(d => ({
    name: formatMonth(d.period),
    Income: d.income,
    Expenses: d.expense
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg shadow-md font-body-sm">
          <p className="font-semibold text-on-surface mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-medium">{formatRp(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="col-span-1 md:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col h-full min-h-[350px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-headline-md text-on-surface">Cash Flow</h3>
        <select className="bg-surface-container-low text-on-surface text-[12px] font-medium border border-outline-variant rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-secondary/50">
          <option>This Year</option>
          <option>Last 6 Months</option>
        </select>
      </div>

      <div className="flex-1 w-full h-full min-h-[250px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              {/* <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /> */}
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={yAxisFormatter}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
              />
              <Line 
                type="monotone" 
                dataKey="Income" 
                stroke="#0284c7" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="Expenses" 
                stroke="#f87171" 
                strokeWidth={3} 
                strokeDasharray="5 5" 
                dot={false}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-on-surface-variant text-sm">
            Loading data...
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowChart;
