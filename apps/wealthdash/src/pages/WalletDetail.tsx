import { useState } from 'react';
import { useApi, formatRp } from '../hooks/useApi';
import { walletsApi, transactionsApi } from '../services/api';
import type { TransactionFilters } from '../types';
import TransactionFilterBar from '../components/TransactionFilterBar';
import TransactionFullTable from '../components/TransactionFullTable';
import TransactionEmptyState from '../components/TransactionEmptyState';
import WalletFormModal from '../components/modals/WalletFormModal';

interface WalletDetailProps {
  walletId: string;
  onBack: () => void;
  onOpenTransaction: () => void;
  onEditTransaction: (tx: any) => void;
}

const WalletDetail = ({ walletId, onBack, onOpenTransaction, onEditTransaction }: WalletDetailProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20, wallet_id: walletId });

  const { data: walletsData, refetch: refetchWallets } = useApi(() => walletsApi.list(), []);
  const { data: txData, refetch: refetchTx } = useApi(
    () => transactionsApi.list(filters),
    [JSON.stringify(filters)]
  );

  const wallet = walletsData?.wallets?.find((w: any) => w.id === walletId);

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, wallet_id: walletId, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await transactionsApi.delete(id);
      refetchTx();
      refetchWallets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveWallet = async (data: any) => {
    try {
      await walletsApi.update(walletId, data);
      setIsEditModalOpen(false);
      refetchWallets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteWallet = async () => {
    if (!confirm('Hapus dompet ini? Semua transaksi terkait juga akan terhapus.')) return;
    try {
      await walletsApi.delete(walletId);
      onBack();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const iconBgMap: Record<string, string> = {
    liquid: 'bg-secondary-fixed text-on-secondary-fixed',
    savings: 'bg-tertiary-fixed text-on-tertiary-fixed',
    investment: 'bg-primary-fixed text-on-primary-fixed',
  };

  if (!wallet) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-on-surface-variant">Memuat data dompet...</p>
      </div>
    );
  }

  const iconClasses = iconBgMap[wallet.cluster] || iconBgMap.liquid;

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background max-w-container-max-width mx-auto w-full flex flex-col gap-6">
      {/* Header with Back Button */}
      <header className="flex flex-col gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors w-fit font-label-caps text-label-caps"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Dompet
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {wallet.logo_path ? (
              <div className="w-14 h-14 rounded-2xl border border-outline-variant/30 overflow-hidden bg-white shadow-sm flex items-center justify-center p-1.5 shrink-0">
                <img src={wallet.logo_path} alt={wallet.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconClasses} shrink-0 shadow-sm`}>
                <span className="material-symbols-outlined text-[28px]">{wallet.icon}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display-lg-mobile md:font-display-lg text-[24px] md:text-[28px] font-bold text-on-surface">{wallet.name}</h2>
                <span className="bg-surface-variant text-on-surface-variant font-label-caps text-[10px] px-2 py-1 rounded-md uppercase">{wallet.cluster}</span>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="ml-2 text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 p-1.5 rounded-lg transition-colors flex items-center shadow-sm"
                  title="Edit Dompet"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
              <p className="font-data-lg text-data-lg text-on-surface mt-1">{formatRp(wallet.balance)}</p>
            </div>
          </div>
          
          <button 
            onClick={onOpenTransaction}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-container transition-colors text-on-secondary hover:text-on-secondary-container font-label-caps text-label-caps px-5 py-2.5 rounded-lg font-semibold shadow-sm w-full md:w-auto justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Transaksi
          </button>
        </div>
      </header>

      {/* Filter & Transactions */}
      <div className="mt-4">
        <h3 className="font-headline-md text-headline-md font-semibold mb-4 text-on-surface">Riwayat Transaksi {wallet.name}</h3>
        <TransactionFilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <div className="mt-4">
          {txData && txData.transactions.length > 0 ? (
            <TransactionFullTable 
              transactions={txData.transactions}
              pagination={txData.pagination}
              onEdit={onEditTransaction} 
              onDelete={handleDelete}
              onPageChange={handlePageChange}
            />
          ) : (
            <TransactionEmptyState />
          )}
        </div>
      </div>

      <WalletFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        editMode={true}
        initialData={wallet}
        onSave={handleSaveWallet}
        onDelete={handleDeleteWallet}
      />
    </div>
  );
};

export default WalletDetail;
