interface TransactionChartsProps {
  onViewCategories?: () => void;
}

const TransactionCharts = ({ onViewCategories }: TransactionChartsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Chart 1: Income vs Expense Summary */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Arus Kas (Periode Aktif)</h3>
        
        <div className="flex justify-center gap-12 items-end h-36 mt-4">
          {/* Income Bar */}
          <div className="flex flex-col items-center justify-end h-full gap-2">
            <span className="font-data-sm text-[12px] text-[#166534] font-medium">Rp 15jt</span>
            <div className="w-[50px] bg-[#dcfce7] rounded-t-md h-[80%]"></div>
            <span className="font-label-caps text-[11px] text-[#166534] uppercase font-semibold">Pemasukan</span>
          </div>
          {/* Expense Bar */}
          <div className="flex flex-col items-center justify-end h-full gap-2">
            <span className="font-data-sm text-[12px] text-[#991b1b] font-medium">Rp 6.5jt</span>
            <div className="w-[50px] bg-[#fee2e2] rounded-t-md h-[40%]"></div>
            <span className="font-label-caps text-[11px] text-[#991b1b] uppercase font-semibold">Pengeluaran</span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-outline-variant/30">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Surplus / Defisit</span>
          <span className="font-data-md text-data-md text-[#166534] font-semibold">+ Rp 8.500.000</span>
        </div>
      </div>

      {/* Chart 2: Top Expenses by Category */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-6">Pengeluaran Terbesar</h3>
          <div className="flex flex-col gap-5 mt-2">
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-body-sm text-body-sm">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-on-surface-variant">home</span> Utilitas & Tagihan</span>
                <span className="font-data-sm font-medium">Rp 3.200.000</span>
              </div>
              <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b] w-[60%] rounded-full"></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-body-sm text-body-sm">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-on-surface-variant">shopping_cart</span> Belanja Bulanan</span>
                <span className="font-data-sm font-medium">Rp 1.500.000</span>
              </div>
              <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b] w-[35%] rounded-full opacity-80"></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-body-sm text-body-sm">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-on-surface-variant">restaurant</span> Makanan</span>
                <span className="font-data-sm font-medium">Rp 800.000</span>
              </div>
              <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b] w-[15%] rounded-full opacity-60"></div>
              </div>
            </div>

          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-end">
          <button 
            onClick={onViewCategories} 
            className="flex items-center gap-2 font-label-caps text-[12px] text-secondary hover:text-on-secondary hover:bg-secondary border border-secondary px-4 py-2 rounded-lg transition-colors w-full justify-center sm:w-auto"
          >
            Lihat Rincian Kategori
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionCharts;
