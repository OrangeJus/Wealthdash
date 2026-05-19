interface TargetCompositionCardProps {
  onTopUp?: () => void;
  onEditRoutine?: () => void;
}

const TargetCompositionCard = ({ onTopUp, onEditRoutine }: TargetCompositionCardProps) => {
  return (
    <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col justify-between">
      <div>
        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-6 uppercase">Komposisi Target</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Target Rutin</span>
            <span className="font-data-md text-data-md text-on-surface">Rp 250.000</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Top-Up</span>
            <span className="font-data-md text-data-md text-on-surface">Rp 50.000</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Rollover</span>
            <span className="font-data-md text-data-md text-on-surface">Rp 100.000</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end p-4 bg-surface-container-low rounded-lg border border-surface-variant mt-4">
        <div className="flex flex-col gap-1 mb-4 sm:mb-0">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Target Bulan Ini</span>
          <span className="font-data-lg text-data-lg text-on-surface flex items-center gap-2">
            Rp 400.000
            <button 
              onClick={onTopUp}
              className="ml-2 text-[11px] font-label-caps px-2 py-1 bg-surface-container border border-outline-variant rounded hover:bg-surface-variant transition-colors flex items-center gap-1 text-on-surface"
            >
              <span className="material-symbols-outlined text-[12px]">add</span> Top-Up
            </button>
          </span>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Remaining</span>
          <span className="font-data-md text-data-md text-error">Rp 80.000</span>
        </div>
      </div>
    </div>
  );
};

export default TargetCompositionCard;
