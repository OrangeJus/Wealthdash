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

        {/* Sections */}
        <div className="space-y-12">
          {/* Section: Liquid Cash */}
          <WalletSection title="Liquid Cash" icon="payments">
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
          </WalletSection>

          {/* Section: Savings */}
          <WalletSection title="Savings" icon="savings">
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
          </WalletSection>

          {/* Section: Investment */}
          <WalletSection title="Investment" icon="monitoring">
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
          </WalletSection>
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
