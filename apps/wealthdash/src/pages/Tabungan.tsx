import { useState } from 'react';
import TargetCompositionCard from '../components/TargetCompositionCard';
import AchievementRingCard from '../components/AchievementRingCard';
import RolloverHistoryTable from '../components/RolloverHistoryTable';
import SavingsTopUpModal from '../components/modals/SavingsTopUpModal';
import SetorTabunganModal from '../components/modals/SetorTabunganModal';

const Tabungan = () => {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSetorOpen, setIsSetorOpen] = useState(false);

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
          <TargetCompositionCard onTopUp={() => setIsTopUpOpen(true)} />
          <AchievementRingCard onSetor={() => setIsSetorOpen(true)} />
        </div>

        {/* Row 2: History Table */}
        <RolloverHistoryTable />
      </div>

      <SavingsTopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <SetorTabunganModal isOpen={isSetorOpen} onClose={() => setIsSetorOpen(false)} />
    </div>
  );
};

export default Tabungan;
