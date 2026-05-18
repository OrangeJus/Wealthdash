const TransactionFilterBar = () => {
  return (
    <section className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 shadow-sm flex flex-col xl:flex-row gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors h-[42px]" placeholder="Cari deskripsi..." type="text" />
      </div>
      <div className="flex flex-wrap md:flex-nowrap gap-4">
        <div className="relative min-w-[140px] flex-1 md:flex-none">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_month</span>
          <input className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none cursor-pointer h-[42px]" readOnly type="text" value="Okt 1 - Okt 31, 2023" />
        </div>
        <select className="min-w-[120px] flex-1 md:flex-none px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary h-[42px]">
          <option value="">Semua Dompet</option>
          <option value="bca">BCA Utama</option>
          <option value="mandiri">Mandiri Bisnis</option>
          <option value="cash">Tunai</option>
        </select>
        <select className="min-w-[120px] flex-1 md:flex-none px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary h-[42px]">
          <option value="">Kategori</option>
          <option value="food">Makanan</option>
          <option value="transport">Transportasi</option>
          <option value="salary">Gaji</option>
        </select>
        <select className="min-w-[110px] flex-1 md:flex-none px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary h-[42px]">
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
      </div>
    </section>
  );
};

export default TransactionFilterBar;
