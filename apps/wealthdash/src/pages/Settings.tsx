import { useState } from 'react';
import { useApi, formatNumberString, parseNumberString } from '../hooks/useApi';
import { settingsApi, exportApi, walletsApi } from '../services/api';

const Settings = () => {
  const { data: settings, refetch } = useApi(() => settingsApi.get(), []);
  const { data: walletsData } = useApi(() => walletsApi.list(), []);
  const [expenseLimit, setExpenseLimit] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [defaultWallet, setDefaultWallet] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Sync API data to local state once loaded
  if (settings && !initialized) {
    setExpenseLimit(formatNumberString(settings.expense_limit) || '3.000.000');
    setSavingsTarget(formatNumberString(settings.savings_target) || '250.000');
    setDefaultWallet(settings.default_wallet || '');
    setInitialized(true);
  }

  const handleSaveExpenseLimit = async () => {
    try {
      await settingsApi.update('expense_limit', String(parseNumberString(expenseLimit)));
      refetch();
      alert('Limit pengeluaran berhasil disimpan!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSavingsTarget = async () => {
    try {
      await settingsApi.update('savings_target', String(parseNumberString(savingsTarget)));
      refetch();
      alert('Target tabungan berhasil disimpan!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveDefaultWallet = async () => {
    try {
      await settingsApi.update('default_wallet', defaultWallet);
      refetch();
      alert('Dompet default berhasil disimpan!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReset = async () => {
    if (!confirm('PERINGATAN: Semua data akan dihapus permanen. Lanjutkan?')) return;
    if (!confirm('Yakin? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      await settingsApi.reset();
      alert('Semua data berhasil direset.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

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
                    onChange={(e) => setExpenseLimit(formatNumberString(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface"
                  />
                </div>
                <button 
                  onClick={handleSaveExpenseLimit}
                  className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-label-caps text-label-caps shadow-sm hover:opacity-90 flex items-center gap-2"
                >
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
                    onChange={(e) => setSavingsTarget(formatNumberString(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface"
                  />
                </div>
                <button 
                  onClick={handleSaveSavingsTarget}
                  className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-label-caps text-label-caps shadow-sm hover:opacity-90 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Simpan
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 opacity-80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Berlaku tiap bulan, bisa diubah kapan saja
              </p>
            </div>

            <div className="h-px bg-outline-variant/20 w-full"></div>

            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-2">Dompet Default Pembayaran</label>
              <div className="flex gap-4 items-start">
                <select 
                  value={defaultWallet}
                  onChange={(e) => setDefaultWallet(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
                >
                  <option value="">-- Tanpa Dompet Default (Gunakan Fallback) --</option>
                  {(walletsData?.wallets || []).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(w.balance)})
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleSaveDefaultWallet}
                  className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-label-caps text-label-caps shadow-sm hover:opacity-90 flex items-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Simpan
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 opacity-80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Dompet ini akan otomatis dipilih saat mencentang tagihan di halaman Anggaran
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
          
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => exportApi.downloadCSV('transactions').catch(e => alert(e.message))}
                className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors font-body-sm font-medium"
              >
                <span className="material-symbols-outlined">receipt_long</span>
                Export Transaksi
              </button>
              <button 
                onClick={() => exportApi.downloadCSV('wallets').catch(e => alert(e.message))}
                className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors font-body-sm font-medium"
              >
                <span className="material-symbols-outlined">account_balance_wallet</span>
                Export Dompet
              </button>
              <button 
                onClick={() => exportApi.downloadCSV('holdings').catch(e => alert(e.message))}
                className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors font-body-sm font-medium"
              >
                <span className="material-symbols-outlined">trending_up</span>
                Export Saham
              </button>
              <button 
                onClick={() => exportApi.downloadCSV('all').catch(e => alert(e.message))}
                className="flex items-center justify-center gap-2 bg-secondary/10 text-secondary border border-secondary/30 px-6 py-3 rounded-lg hover:bg-secondary/20 transition-colors font-body-sm font-medium"
              >
                <span className="material-symbols-outlined">download</span>
                Export Semua Data
              </button>
            </div>

            <div className="h-px bg-outline-variant/20 w-full"></div>

            <button 
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-error-container/50 text-on-error-container border border-error-container px-6 py-3 rounded-lg hover:bg-error-container transition-colors font-body-sm font-medium"
            >
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
