interface AchievementRingCardProps {
  onSetor?: () => void;
}

const AchievementRingCard = ({ onSetor }: AchievementRingCardProps) => {
  return (
    <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col items-center justify-center text-center">
      <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-6 uppercase w-full text-left">Pencapaian</h3>
      <div className="relative w-32 h-32 mb-6">
        {/* SVG Progress Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Background Track */}
          <path className="text-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
          {/* Progress Fill (80%) */}
          <path className="text-secondary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeLinecap="round" strokeWidth="4"></path>
        </svg>
        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="font-data-lg text-data-lg text-on-surface">80%</span>
        </div>
      </div>
      <button 
        onClick={onSetor}
        className="w-full bg-secondary text-on-secondary font-label-caps text-label-caps py-3 px-6 rounded-lg hover:bg-secondary-fixed-dim transition-colors shadow-sm flex justify-center items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Setor Tabungan
      </button>
    </div>
  );
};

export default AchievementRingCard;
