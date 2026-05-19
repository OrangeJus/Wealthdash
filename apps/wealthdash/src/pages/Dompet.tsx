import { useState } from 'react';
import WalletSection from '../components/WalletSection';
import WalletCard from '../components/WalletCard';
import WalletFormModal from '../components/modals/WalletFormModal';

interface DompetProps {
  onSelectWallet: (id: string) => void;
}

const Dompet = ({ onSelectWallet }: DompetProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleOpenAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (data: any) => {
    setEditData(data);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
      <div className="max-w-container-max-width mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface">Dompet Saya</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage your liquid assets, savings, and investment accounts.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant transition-colors rounded-lg px-4 py-3 font-label-caps text-label-caps flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Tambah Dompet
          </button>
        </div>

        {/* Wallet Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-8 justify-between items-center shadow-sm">
          <div className="flex-1 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Total Kekayaan Bersih</h3>
            <p className="font-display-lg text-[32px] md:text-[40px] font-bold text-on-surface tracking-tight">Rp 9.950.000</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded text-[12px] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +Rp 450.000
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">dari bulan lalu</span>
            </div>
          </div>
          
          <div className="w-full md:w-[320px] flex flex-col gap-4 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-6 md:pt-0 md:pl-8">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Komposisi Aset</h4>
            <div className="flex h-3 rounded-full overflow-hidden w-full bg-surface-container">
              <div className="bg-secondary w-[5%]" title="Liquid Cash"></div>
              <div className="bg-tertiary w-[80%]" title="Savings"></div>
              <div className="bg-primary w-[15%]" title="Investment"></div>
            </div>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center font-body-sm text-[12px]">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-secondary"></div> Liquid Cash</div>
                <span className="font-medium">4.5%</span>
              </div>
              <div className="flex justify-between items-center font-body-sm text-[12px]">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-tertiary"></div> Savings</div>
                <span className="font-medium">80.4%</span>
              </div>
              <div className="flex justify-between items-center font-body-sm text-[12px]">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary"></div> Investment</div>
                <span className="font-medium">15.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Wallets */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          <WalletCard 
            icon="account_balance_wallet"
            name="GoPay"
            typeBadge="Liquid"
            amount="Rp 350.000"
            iconBgClass="bg-secondary-fixed"
            iconTextClass="text-on-secondary-fixed"
            badgeBgClass="bg-surface-variant"
            badgeTextClass="text-on-surface-variant"
            onEdit={() => handleOpenEdit({ name: 'GoPay', icon: 'account_balance_wallet', cluster: 'liquid', balance: '350000' })}
            onClick={() => onSelectWallet('gopay')}
          />
          <WalletCard 
            icon="account_balance_wallet"
            name="OVO"
            typeBadge="Liquid"
            amount="Rp 100.000"
            iconBgClass="bg-secondary-fixed"
            iconTextClass="text-on-secondary-fixed"
            badgeBgClass="bg-surface-variant"
            badgeTextClass="text-on-surface-variant"
            onEdit={() => handleOpenEdit({ name: 'OVO', icon: 'account_balance_wallet', cluster: 'liquid', balance: '100000' })}
            onClick={() => onSelectWallet('ovo')}
          />
          <WalletCard 
            icon="account_balance"
            name="BCA"
            typeBadge="Savings"
            amount="Rp 8.000.000"
            iconBgClass="bg-tertiary-fixed"
            iconTextClass="text-on-tertiary-fixed"
            badgeBgClass="bg-tertiary-fixed"
            badgeTextClass="text-on-tertiary-fixed"
            onEdit={() => handleOpenEdit({ name: 'BCA', icon: 'account_balance', cluster: 'savings', balance: '8000000' })}
            onClick={() => onSelectWallet('bca')}
          />
          <WalletCard 
            icon="show_chart"
            name="RDN BCA"
            typeBadge="Investment"
            amount="Rp 1.500.000"
            iconBgClass="bg-primary-fixed"
            iconTextClass="text-on-primary-fixed"
            badgeBgClass="bg-primary-fixed"
            badgeTextClass="text-on-primary-fixed"
            onEdit={() => handleOpenEdit({ name: 'RDN BCA', icon: 'show_chart', cluster: 'investment', balance: '1500000' })}
            onClick={() => onSelectWallet('rdn_bca')}
          />
        </div>
      </div>
      
      <WalletFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editMode={!!editData}
        initialData={editData}
      />
    </div>
  );
};

export default Dompet;
