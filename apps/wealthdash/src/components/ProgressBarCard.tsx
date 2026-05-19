

interface ProgressBarCardProps {
  title: string;
  subtitle: string;
  amountText: string;
  percentage: number;
  type?: 'expense' | 'savings';
}

const ProgressBarCard: React.FC<ProgressBarCardProps> = ({
  title,
  subtitle,
  amountText,
  percentage,
  type = 'expense',
}) => {
  let barColorClass = "bg-[#10b981]"; // Hijau (Aman / < 70%)
  
  if (percentage >= 90) barColorClass = "bg-[#ef4444]"; // Merah (Bahaya / >= 90%)
  else if (percentage >= 70) barColorClass = "bg-[#f59e0b]"; // Oranye (Peringatan / >= 70%)

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-center transition-colors shadow-sm">
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${type === 'expense' ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-[#dcfce7] text-[#166534]'}`}>
            <span className="material-symbols-outlined text-[20px]">{type === 'expense' ? 'money_off' : 'savings'}</span>
          </div>
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">{title}</span>
            <span className="font-body-sm text-[12px] text-on-surface-variant">{subtitle}</span>
          </div>
        </div>
        <span className="font-data-md text-data-md text-on-surface font-bold">{amountText}</span>
      </div>
      <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden shadow-inner">
        <div 
          className={`${barColorClass} h-full rounded-full transition-all duration-500`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBarCard;
