import { useState } from 'react';

const Settings = () => {
  const [expenseLimit, setExpenseLimit] = useState('3000000');
  const [savingsTarget, setSavingsTarget] = useState('250000');
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
