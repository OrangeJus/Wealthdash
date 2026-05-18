import { useState } from 'react';
import TransactionFilterBar from '../components/TransactionFilterBar';
import TransactionFullTable from '../components/TransactionFullTable';
import WalletFormModal from '../components/modals/WalletFormModal';

interface WalletDetailProps {
  walletId: string;
  onBack: () => void;
  onOpenTransaction: () => void;
  onEditTransaction: (tx: any) => void;
}

const WalletDetail = ({ walletId, onBack, onOpenTransaction, onEditTransaction }: WalletDetailProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // In a real app, fetch wallet data based on walletId.
  // Using dummy data for now.
  const walletData = {
    id: walletId,
    name: walletId === 'gopay' ? 'GoPay' : walletId === 'bca' ? 'BCA' : 'Wallet',
    icon: walletId === 'bca' ? 'account_balance' : 'account_balance_wallet',
    logoUrl: undefined as string | undefined, // Mock for logoUrl
    cluster: walletId === 'bca' ? 'Savings' : 'Liquid Cash',
    balance: walletId === 'bca' ? 'Rp 8.000.000' : 'Rp 350.000',
    iconBgClass: walletId === 'bca' ? 'bg-tertiary-fixed' : 'bg-secondary-fixed',
    iconTextClass: walletId === 'bca' ? 'text-on-tertiary-fixed' : 'text-on-secondary-fixed',
  };

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
            {walletData.logoUrl ? (
              <div className="w-14 h-14 rounded-2xl border border-outline-variant/30 overflow-hidden bg-white shadow-sm flex items-center justify-center p-1.5 shrink-0">
                <img src={walletData.logoUrl} alt={walletData.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${walletData.iconBgClass} ${walletData.iconTextClass} shrink-0 shadow-sm`}>
                <span className="material-symbols-outlined text-[28px]">{walletData.icon}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display-lg-mobile md:font-display-lg text-[24px] md:text-[28px] font-bold text-on-surface">{walletData.name}</h2>
                <span className="bg-surface-variant text-on-surface-variant font-label-caps text-[10px] px-2 py-1 rounded-md uppercase">{walletData.cluster}</span>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="ml-2 text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 p-1.5 rounded-lg transition-colors flex items-center shadow-sm"
                  title="Edit Dompet"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
              <p className="font-data-lg text-data-lg text-on-surface mt-1">{walletData.balance}</p>
            </div>
          </div>
          
          <button 
            onClick={onOpenTransaction}
            className="flex items-center gap-2 bg-[#3B82F6] hover:bg-secondary-container transition-colors text-on-primary font-body-sm text-body-sm px-5 py-2.5 rounded-lg font-semibold shadow-sm w-full md:w-auto justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Transaksi
          </button>
        </div>
      </header>

      {/* Filter & Transactions (Filtered by this wallet in real app) */}
      <div className="mt-4">
        <h3 className="font-headline-md text-headline-md font-semibold mb-4 text-on-surface">Riwayat Transaksi {walletData.name}</h3>
        <TransactionFilterBar />
        <div className="mt-4">
          <TransactionFullTable 
            onEdit={onEditTransaction} 
            onDelete={(id) => alert(`Delete transaction ${id} from wallet`)} 
          />
        </div>
      </div>

      <WalletFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        editMode={true}
        initialData={walletData}
      />
    </div>
  );
};

export default WalletDetail;
