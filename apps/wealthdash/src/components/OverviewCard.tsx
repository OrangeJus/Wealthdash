

interface OverviewCardProps {
  title: string;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  amount: string;
  trendIcon: string;
  trendText: string;
  trendBgClass: string;
  trendTextClass: string;
  trendIconClass?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  icon,
  iconBgClass,
  iconTextClass,
  amount,
  trendIcon,
  trendText,
  trendBgClass,
  trendTextClass,
  trendIconClass = "text-[14px]",
}) => {
  return (
    <div className="col-span-1 md:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col gap-4 transition-shadow hover:shadow-[0px_4px_12px_rgba(15,23,42,0.05)]">
      <div className="flex justify-between items-start">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{title}</span>
        <div className={`${iconBgClass} p-2 rounded-lg ${iconTextClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div>
        <span className="font-data-lg text-data-lg text-on-surface block">{amount}</span>
        <div className="flex items-center gap-2 mt-2">
          <span className={`${trendBgClass} ${trendTextClass} px-2 py-0.5 rounded text-[11px] font-data-sm flex items-center gap-1`}>
            <span className={`material-symbols-outlined ${trendIconClass}`}>{trendIcon}</span> {trendText}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">vs last month</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;
