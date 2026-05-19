import { useApi, formatRp } from '../hooks/useApi';
import { analyticsApi } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AssetAllocation = () => {
  const { data } = useApi(() => analyticsApi.assetAllocation(), []);

  const clusterColors: Record<string, string> = {
    liquid: '#0284c7', // Blue
    savings: '#f59e0b', // Yellow/Orange
    investment: '#10b981', // Green
  };

  const clusterLabels: Record<string, string> = {
    liquid: 'Liquid Cash',
    savings: 'Savings',
    investment: 'Investment',
  };

  // Prepare data for recharts PieChart
  const chartData = (data?.allocation || []).map(item => ({
    name: clusterLabels[item.cluster] || item.cluster,
    value: item.total,
    percentage: parseFloat(item.percentage as any),
    cluster: item.cluster
  }));

  const totalClasses = chartData.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg shadow-md font-body-sm flex flex-col gap-1">
          <p className="font-semibold" style={{ color: payload[0].payload.fill }}>{data.name}</p>
          <p className="text-on-surface">{formatRp(data.value)}</p>
          <p className="text-on-surface-variant text-[11px]">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="col-span-1 md:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col h-full min-h-[350px]">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Asset Allocation</h3>

      <div className="relative flex-1 min-h-[200px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={clusterColors[entry.cluster] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display-md text-2xl font-bold text-on-surface">{totalClasses}</span>
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Classes</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 mt-4">
        {chartData.map((item) => (
          <div key={item.cluster} className="flex justify-between items-center">
            <div className="flex items-center gap-3 font-body-sm text-[13px] text-on-surface">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: clusterColors[item.cluster] || '#94a3b8' }}
              ></div>
              {item.name}
            </div>
            <div className="text-right">
              <span className="font-data-sm text-[13px] font-semibold text-on-surface">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetAllocation;
