import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { savingsApi, walletsApi } from '../services/api';
import TargetCompositionCard from '../components/TargetCompositionCard';
import AchievementRingCard from '../components/AchievementRingCard';
import RolloverHistoryTable from '../components/RolloverHistoryTable';
import SavingsHistoryTable from '../components/SavingsHistoryTable';
import SavingsTopUpModal from '../components/modals/SavingsTopUpModal';
import SetorTabunganModal from '../components/modals/SetorTabunganModal';

const Tabungan = () => {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSetorOpen, setIsSetorOpen] = useState(false);

  const { data: progress, refetch: refetchProgress } = useApi(() => savingsApi.progress(), []);
  const { data: history, refetch: refetchHistory } = useApi(() => savingsApi.history(), []);
  const { data: deposits, refetch: refetchDeposits } = useApi(() => savingsApi.listDeposits(), []);
  const { data: walletsData, refetch: refetchWallets } = useApi(() => walletsApi.list(), []);

  const refetchAll = () => {
    refetchProgress();
    refetchHistory();
    refetchDeposits();
    refetchWallets();
  };

  const handleDeposit = async (data: any) => {
    try {
      await savingsApi.deposit(data);
      refetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditDeposit = async (id: string, data: { amount?: number; wallet_id?: string }) => {
    try {
      await savingsApi.updateDeposit(id, data);
      refetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDeposit = async (id: string) => {
    try {
      await savingsApi.deleteDeposit(id);
      refetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-surface-container-low px-margin-mobile py-6 md:px-margin-desktop md:py-8">
      <div className="max-w-container-max-width mx-auto flex flex-col gap-card-gap">
        {/* Page Header */}
        <header className="flex flex-col gap-2">
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Target Tabungan</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau progres dan kelola alokasi tabungan bulanan Anda.</p>
        </header>

        {/* Row 1: Key Metrics & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-card-gap">
          <TargetCompositionCard 
            progress={progress}
            onTopUp={() => setIsTopUpOpen(true)} 
          />
          <AchievementRingCard 
            progress={progress}
            onSetor={() => setIsSetorOpen(true)} 
          />
        </div>

        {/* Row 2: Deposit History */}
        <SavingsHistoryTable
          deposits={deposits || []}
          wallets={walletsData?.wallets || []}
          onEdit={handleEditDeposit}
          onDelete={handleDeleteDeposit}
        />

        {/* Row 3: Rollover History Table */}
        <RolloverHistoryTable history={history || []} />
      </div>

      <SavingsTopUpModal 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)}
        targets={progress?.targets || []}
        wallets={walletsData?.wallets || []}
        onSave={handleDeposit}
      />
      <SetorTabunganModal 
        isOpen={isSetorOpen} 
        onClose={() => setIsSetorOpen(false)}
        targets={progress?.targets || []}
        wallets={walletsData?.wallets || []}
        onSave={handleDeposit}
      />
    </div>
  );
};

export default Tabungan;
