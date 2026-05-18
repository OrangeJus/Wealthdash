const TopExpenses = () => {
  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
      <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-6">Top Pengeluaran</h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center font-body-sm text-body-sm">
            <span>Perumahan & Tagihan</span>
            <span className="font-data-sm text-data-sm font-semibold">Rp 8.500.000</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2">
            <div className="bg-secondary h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center font-body-sm text-body-sm">
            <span>Makanan & Groceries</span>
            <span className="font-data-sm text-data-sm font-semibold">Rp 4.200.000</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2">
            <div className="bg-secondary h-2 rounded-full opacity-80" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center font-body-sm text-body-sm">
            <span>Transportasi</span>
            <span className="font-data-sm text-data-sm font-semibold">Rp 2.100.000</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2">
            <div className="bg-secondary h-2 rounded-full opacity-60" style={{ width: '25%' }}></div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center font-body-sm text-body-sm">
            <span>Hiburan</span>
            <span className="font-data-sm text-data-sm font-semibold">Rp 1.500.000</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2">
            <div className="bg-secondary h-2 rounded-full opacity-40" style={{ width: '15%' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopExpenses;
