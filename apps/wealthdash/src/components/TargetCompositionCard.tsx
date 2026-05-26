import { formatRp } from '../hooks/useApi';
import type { SavingsProgress } from '../types';

interface TargetCompositionCardProps {
  progress?: SavingsProgress | null;
  onTopUp?: () => void;
}

const TargetCompositionCard = ({ progress, onTopUp }: TargetCompositionCardProps) => {
  const percentage = progress?.percentage || 0;
  const totalDeposited = progress?.totalDeposited || 0;
  const effectiveTarget = progress?.effectiveTarget || 0;

  return (
    <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-headline-md text-headline-md text-on-surface">Komposisi Target</h3>
        <button
          onClick={onTopUp}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg font-label-caps text-label-caps shadow-sm hover:bg-secondary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Top Up
        </button>
      </div>

      {/* Metric Cards — 2x2 grid for better space usage */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-2">Target Bulanan</p>
          <p className="font-data-lg text-[22px] font-bold text-on-surface">{progress ? formatRp(progress.totalTarget) : '...'}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-2">Rutin</p>
          <p className="font-data-lg text-[22px] font-bold text-secondary">{progress ? formatRp(progress.routineDeposited) : '...'}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-2">Top-up</p>
          <p className="font-data-lg text-[22px] font-bold text-on-surface">{progress ? formatRp(progress.topupDeposited) : '...'}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-2">Rollover</p>
          <p className="font-data-lg text-[22px] font-bold text-error">{progress ? formatRp(progress.rollover) : '...'}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Progres Bulan Ini</span>
          <span className="font-data-sm text-data-sm font-semibold text-secondary">{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(100, percentage)}%`,
              backgroundColor: percentage >= 100 ? '#10b981' : '#0058be',
            }}
          />
        </div>
        <p className="font-body-sm text-[13px] text-on-surface-variant">
          {progress
            ? `${formatRp(totalDeposited)} dari ${formatRp(effectiveTarget)} — ${
                percentage >= 100
                  ? 'Target tercapai! 🎉'
                  : `sisa ${formatRp(progress.remaining)}`
              }`
            : 'Memuat data...'}
        </p>
      </div>
    </div>
  );
};

export default TargetCompositionCard;
