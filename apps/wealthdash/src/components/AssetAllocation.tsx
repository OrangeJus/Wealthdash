

const AssetAllocation = () => {
  return (
    <div className="col-span-1 md:col-span-5 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Asset Allocation</h3>
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Abstract Donut Representation */}
        <div className="relative w-48 h-48 rounded-full border-[24px] border-surface-container border-t-secondary border-r-secondary border-b-[#f59e0b] border-l-[#10b981] flex items-center justify-center shadow-inner">
          <div className="text-center">
            <span className="font-data-lg text-data-lg block text-on-surface">3</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">Classes</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex justify-between items-center p-2 rounded hover:bg-surface-container-low transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="font-body-sm text-body-sm text-on-surface">Liquid Cash</span>
          </div>
          <span className="font-data-md text-data-md">45%</span>
        </div>
        <div className="flex justify-between items-center p-2 rounded hover:bg-surface-container-low transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span className="font-body-sm text-body-sm text-on-surface">Savings</span>
          </div>
          <span className="font-data-md text-data-md">35%</span>
        </div>
        <div className="flex justify-between items-center p-2 rounded hover:bg-surface-container-low transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
            <span className="font-body-sm text-body-sm text-on-surface">Investment</span>
          </div>
          <span className="font-data-md text-data-md">20%</span>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
