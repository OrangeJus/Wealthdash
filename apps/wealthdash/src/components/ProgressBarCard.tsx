

interface ProgressBarCardProps {
  title: string;
  subtitle: string;
  amountText: string;
  percentage: number;
  gradientFrom: string;
  gradientTo: string;
}

const ProgressBarCard: React.FC<ProgressBarCardProps> = ({
  title,
  subtitle,
  amountText,
  percentage,
  gradientFrom,
  gradientTo,
}) => {
  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 flex flex-col justify-center">
      <div className="flex justify-between items-end mb-3">
        <div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">{title}</span>
          <span className="font-body-sm text-body-sm text-on-surface">{subtitle}</span>
        </div>
        <span className="font-data-md text-data-md text-on-surface">{amountText}</span>
      </div>
      <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBarCard;
