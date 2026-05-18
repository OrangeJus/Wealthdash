const PortfolioSummaryCard = () => {
  return (
    <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[180px]" data-icon="monitoring">monitoring</span>
      </div>
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-outline" data-icon="pie_chart">pie_chart</span>
        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Portfolio Summary</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Capital</p>
          <p className="font-data-md text-data-md text-on-surface">Rp 3.200.000</p>
        </div>
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Market Value</p>
          <p className="font-data-md text-data-md text-on-surface">Rp 3.680.000</p>
        </div>
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Floating P&L</p>
          <div className="flex items-baseline gap-2">
            <p className="font-data-md text-data-md text-secondary">+Rp 480.000</p>
            <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded font-data-sm text-data-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span>
              +15.0%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummaryCard;
