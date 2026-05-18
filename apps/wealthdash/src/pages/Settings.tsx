import { useState } from 'react';

const Settings = () => {
  const [expenseLimit, setExpenseLimit] = useState('3000000');
  const [savingsTarget, setSavingsTarget] = useState('250000');
  
  const defaultIncomeCategories = [
    { id: 1, name: 'Gaji', editable: true },
    { id: 2, name: 'Freelance', editable: true },
    { id: 3, name: 'Bonus', editable: true },
    { id: 4, name: 'Hadiah', editable: true },
    { id: 5, name: 'Lainnya', editable: false },
  ];
  
  const defaultExpenseCategories = [
    { id: 1, name: 'Makanan', editable: true },
    { id: 2, name: 'Transport', editable: true },
    { id: 3, name: 'Belanja', editable: true },
    { id: 4, name: 'Hiburan', editable: true },
    { id: 5, name: 'Tagihan', editable: true },
    { id: 6, name: 'Kesehatan', editable: true },
    { id: 7, name: 'Pendidikan', editable: true },
    { id: 8, name: 'Lainnya', editable: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop w-full max-w-container-max-width mx-auto">
      <div className="flex flex-col gap-card-gap pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="font-display-lg text-display-lg hidden md:block">Pengaturan</h1>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:hidden">Pengaturan</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Kelola batas, target, kategori, dan data aplikasi Anda.</p>
          </div>
        </div>

        {/* Batas & Target */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">tune</span>
            Batas & Target
          </h2>
          
          <div className="flex flex-col gap-6 max-w-2xl">
            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-2">Limit Pengeluaran Bulanan</label>
              <div className="flex gap-4 items-start">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">Rp</span>
                  <input 
                    type="text" 
                    value={expenseLimit}
                    onChange={(e) => setExpenseLimit(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface"
                  />
                </div>
                <button className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-label-caps text-label-caps shadow-sm hover:opacity-90 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Simpan
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 opacity-80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Jika pengeluaran melebihi ini, bar di dashboard akan menjadi merah
              </p>
            </div>

            <div className="h-px bg-outline-variant/20 w-full"></div>

            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-2">Target Tabungan Rutin / Bulan</label>
              <div className="flex gap-4 items-start">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">Rp</span>
                  <input 
                    type="text" 
                    value={savingsTarget}
                    onChange={(e) => setSavingsTarget(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface"
                  />
                </div>
                <button className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-label-caps text-label-caps shadow-sm hover:opacity-90 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Simpan
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 opacity-80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Berlaku tiap bulan, bisa diubah kapan saja
              </p>
            </div>
          </div>
        </section>

        {/* Kategori Transaksi */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-card-gap">
          {/* Pemasukan */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-[18px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[#22c55e]">arrow_downward</span>
                Kategori Pemasukan
              </h3>
              <button className="text-secondary hover:bg-secondary/10 px-3 py-1.5 rounded-lg text-label-caps font-label-caps flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span> Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {defaultIncomeCategories.map(cat => (
                <div key={cat.id} className="group flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 px-3 py-1.5 rounded-lg text-body-sm font-body-sm text-on-surface">
                  {cat.name}
                  {cat.editable ? (
                    <div className="hidden group-hover:flex items-center gap-1 ml-1 text-on-surface-variant">
                      <button className="hover:text-secondary"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                      <button className="hover:text-error"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-[14px] text-outline ml-1">lock</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-[18px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">arrow_upward</span>
                Kategori Pengeluaran
              </h3>
              <button className="text-secondary hover:bg-secondary/10 px-3 py-1.5 rounded-lg text-label-caps font-label-caps flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span> Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {defaultExpenseCategories.map(cat => (
                <div key={cat.id} className="group flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 px-3 py-1.5 rounded-lg text-body-sm font-body-sm text-on-surface">
                  {cat.name}
                  {cat.editable ? (
                    <div className="hidden group-hover:flex items-center gap-1 ml-1 text-on-surface-variant">
                      <button className="hover:text-secondary"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                      <button className="hover:text-error"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-[14px] text-outline ml-1">lock</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data & Backup */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">storage</span>
            Data & Backup
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors font-body-sm font-medium">
              <span className="material-symbols-outlined">download</span>
              Export Data (Excel)
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors font-body-sm font-medium">
              <span className="material-symbols-outlined">download</span>
              Export Data (CSV)
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-error-container/50 text-on-error-container border border-error-container px-6 py-3 rounded-lg hover:bg-error-container transition-colors font-body-sm font-medium">
              <span className="material-symbols-outlined">delete_forever</span>
              Reset Semua Data
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;
