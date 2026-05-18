const IncomeExpenseChart = () => {
  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Pemasukan vs Pengeluaran (6 Bulan)</h2>
        <div className="flex gap-4 font-body-sm text-body-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary"></div> Pemasukan</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-surface-variant"></div> Pengeluaran</div>
        </div>
      </div>
      <div className="h-[240px] flex items-end justify-between gap-4 pt-4 border-b border-outline-variant/30">
        {/* Chart Columns (Simulated) */}
        <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full group">
          <div className="flex gap-1 items-end h-[80%] w-full justify-center">
            <div className="w-1/3 bg-secondary rounded-t-sm h-[60%]"></div>
            <div className="w-1/3 bg-surface-variant rounded-t-sm h-[80%]"></div>
          </div>
          <span className="font-data-sm text-data-sm text-on-surface-variant">Jan</span>
        </div>
        <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full group">
          <div className="flex gap-1 items-end h-[80%] w-full justify-center">
            <div className="w-1/3 bg-secondary rounded-t-sm h-[75%]"></div>
            <div className="w-1/3 bg-surface-variant rounded-t-sm h-[65%]"></div>
          </div>
          <span className="font-data-sm text-data-sm text-on-surface-variant">Feb</span>
        </div>
        <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full group">
          <div className="flex gap-1 items-end h-[80%] w-full justify-center">
            <div className="w-1/3 bg-secondary rounded-t-sm h-[90%]"></div>
            <div className="w-1/3 bg-surface-variant rounded-t-sm h-[40%]"></div>
          </div>
          <span className="font-data-sm text-data-sm text-on-surface-variant">Mar</span>
        </div>
        <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full group">
          <div className="flex gap-1 items-end h-[80%] w-full justify-center">
            <div className="w-1/3 bg-secondary rounded-t-sm h-[50%]"></div>
            <div className="w-1/3 bg-surface-variant rounded-t-sm h-[70%]"></div>
          </div>
          <span className="font-data-sm text-data-sm text-on-surface-variant">Apr</span>
        </div>
        <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full group">
          <div className="flex gap-1 items-end h-[80%] w-full justify-center">
            <div className="w-1/3 bg-secondary rounded-t-sm h-[85%]"></div>
            <div className="w-1/3 bg-surface-variant rounded-t-sm h-[55%]"></div>
          </div>
          <span className="font-data-sm text-data-sm text-on-surface-variant">May</span>
        </div>
        <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full group">
          <div className="flex gap-1 items-end h-[80%] w-full justify-center">
            <div className="w-1/3 bg-secondary rounded-t-sm h-[100%]"></div>
            <div className="w-1/3 bg-surface-variant rounded-t-sm h-[85%]"></div>
          </div>
          <span className="font-data-sm text-data-sm text-on-surface-variant">Jun</span>
        </div>
      </div>
    </section>
  );
};

export default IncomeExpenseChart;
