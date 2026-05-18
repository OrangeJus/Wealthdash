const SavingsRateChart = () => {
  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Rasio Tabungan</h2>
          <div className="font-data-lg text-data-lg mt-1 text-primary">32.5%</div>
        </div>
        <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">trending_up</span>
      </div>
      <div className="h-[140px] w-full relative mt-4">
        {/* Simple SVG representation of a line chart */}
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
          {/* Grid lines */}
          <line className="text-outline-variant/50" stroke="currentColor" strokeWidth="0.2" x1="0" x2="100" y1="10" y2="10"></line>
          <line className="text-outline-variant/50" stroke="currentColor" strokeWidth="0.2" x1="0" x2="100" y1="20" y2="20"></line>
          <line className="text-outline-variant/50" stroke="currentColor" strokeWidth="0.2" x1="0" x2="100" y1="30" y2="30"></line>
          {/* Data Line */}
          <polyline className="text-secondary" fill="none" points="0,35 15,30 30,25 45,28 60,15 75,18 90,8 100,5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></polyline>
          {/* Data Points */}
          <circle className="text-secondary" cx="60" cy="15" fill="currentColor" r="1.5"></circle>
          <circle className="text-secondary" cx="90" cy="8" fill="currentColor" r="1.5"></circle>
        </svg>
        <div className="flex justify-between font-data-sm text-data-sm text-on-surface-variant mt-2 px-1">
          <span>Q1</span>
          <span>Q2</span>
          <span>Q3</span>
          <span>Q4</span>
        </div>
      </div>
    </section>
  );
};

export default SavingsRateChart;
