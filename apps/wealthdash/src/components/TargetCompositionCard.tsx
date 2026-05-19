import { formatRp } from '../hooks/useApi';
import type { SavingsProgress } from '../types';

interface TargetCompositionCardProps {
  progress?: SavingsProgress | null;
  onTopUp?: () => void;
}

const TargetCompositionCard = ({ progress, onTopUp }: TargetCompositionCardProps) => {
  return (
    <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-headline-md text-headline-md text-on-surface">Komposisi Target</h3>
        <button
          onClick={onTopUp}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg font-label-caps text-label-caps shadow-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Top Up
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low rounded-xl p-4">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">Target Bulanan</p>
          <p className="font-data-md text-data-md font-bold">{progress ? formatRp(progress.totalTarget) : '...'}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">Rutin</p>
          <p className="font-data-md text-data-md font-bold text-secondary">{progress ? formatRp(progress.routineDeposited) : '...'}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">Top-up</p>
          <p className="font-data-md text-data-md font-bold text-tertiary">{progress ? formatRp(progress.topupDeposited) : '...'}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">Rollover</p>
          <p className="font-data-md text-data-md font-bold text-error">{progress ? formatRp(progress.rollover) : '...'}</p>
        </div>
      </div>

      {/* Targets list */}
      <div className="flex flex-col gap-3">
        {(progress?.targets || []).map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">{t.icon}</span>
              <span className="font-body-sm text-body-sm font-medium">{t.name}</span>
            </div>
            <span className="font-data-sm text-data-sm">{formatRp(t.monthly_amount)}/bln</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetCompositionCard;
