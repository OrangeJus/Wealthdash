import { formatRp } from '../hooks/useApi';

interface PortfolioSummaryCardProps {
  summary?: {
    totalModal: number;
    totalMarketValue: number;
    totalFloatingPnl: number;
    totalFloatingPnlPercent: number;
  };
}

const PortfolioSummaryCard = ({ summary }: PortfolioSummaryCardProps) => {
  const isProfit = (summary?.totalFloatingPnl || 0) >= 0;

  return (
    <div className="md:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
      <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">Portfolio Summary</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Modal</p>
          <p className="font-data-md text-data-md font-semibold text-on-surface">{summary ? formatRp(summary.totalModal) : '...'}</p>
        </div>
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Market Value</p>
          <p className="font-data-md text-data-md font-semibold text-on-surface">{summary ? formatRp(summary.totalMarketValue) : '...'}</p>
        </div>
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Floating P&L</p>
          <p className={`font-data-md text-data-md font-semibold ${isProfit ? 'text-secondary' : 'text-error'}`}>
            {summary ? `${isProfit ? '+' : ''}${formatRp(summary.totalFloatingPnl)}` : '...'}
          </p>
        </div>
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Return</p>
          <p className={`font-data-md text-data-md font-semibold ${isProfit ? 'text-secondary' : 'text-error'}`}>
            {summary ? `${isProfit ? '+' : ''}${summary.totalFloatingPnlPercent}%` : '...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummaryCard;
