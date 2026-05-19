import { formatRp } from '../hooks/useApi';
import type { SavingsProgress } from '../types';

interface AchievementRingCardProps {
  progress?: SavingsProgress | null;
  onSetor?: () => void;
}

const AchievementRingCard = ({ progress, onSetor }: AchievementRingCardProps) => {
  const percentage = progress?.percentage || 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const ringColor = percentage >= 100 ? '#10b981' : percentage >= 50 ? '#3B82F6' : '#f59e0b';

  return (
    <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col items-center gap-6 shadow-sm">
      <h3 className="font-headline-md text-headline-md text-on-surface self-start">Pencapaian Bulan Ini</h3>
      
      {/* Ring */}
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container-high" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-data-lg text-[24px] font-bold" style={{ color: ringColor }}>{percentage.toFixed(0)}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2 w-full text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {progress ? formatRp(progress.totalDeposited) : '...'} dari {progress ? formatRp(progress.effectiveTarget) : '...'}
        </p>
        {progress && progress.remaining > 0 && (
          <p className="font-body-sm text-[12px] text-on-surface-variant">Sisa: {formatRp(progress.remaining)}</p>
        )}
      </div>

      <button
        onClick={onSetor}
        className="w-full py-2.5 border border-secondary text-secondary rounded-lg font-label-caps text-label-caps hover:bg-secondary hover:text-on-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-[16px] align-middle mr-1">payments</span>
        Setor Tabungan
      </button>
    </div>
  );
};

export default AchievementRingCard;
