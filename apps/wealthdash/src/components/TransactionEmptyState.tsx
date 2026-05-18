const TransactionEmptyState = () => {
  return (
    <section className="hidden bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <div className="w-48 h-48 mb-6 rounded-full bg-surface-container-low flex items-center justify-center relative overflow-hidden">
        {/* Abstract representation of empty wallet/data */}
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-variant to-surface-container-lowest opacity-50"></div>
        <span className="material-symbols-outlined text-[80px] text-outline-variant z-10" style={{ fontVariationSettings: "'wght' 200" }}>receipt_long</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Belum Ada Transaksi</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">Anda belum mencatat transaksi apapun pada periode ini. Mulai kelola keuangan Anda dengan menambahkan transaksi pertama.</p>
      <button className="flex items-center gap-2 bg-[#3B82F6] hover:bg-secondary-container transition-colors text-on-primary font-body-sm text-body-sm px-6 py-3 rounded-lg font-semibold shadow-sm">
        <span className="material-symbols-outlined text-[18px]">add</span>
        Tambah Transaksi
      </button>
    </section>
  );
};

export default TransactionEmptyState;
