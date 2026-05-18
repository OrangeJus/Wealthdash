interface WalletCardProps {
  icon: string;
  name: string;
  typeBadge: string;
  amount: string;
  iconBgClass: string;
  iconTextClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  logoUrl?: string;
  onEdit?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

const WalletCard = ({ icon, name, typeBadge, amount, iconBgClass, iconTextClass, badgeBgClass, badgeTextClass, logoUrl, onEdit, onClick }: WalletCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-[0px_4px_12px_rgba(15,23,42,0.05)] transition-shadow group flex flex-col gap-6 ${onClick ? 'cursor-pointer hover:border-outline' : ''}`}
    >
      <div className="flex justify-between items-start">
        {logoUrl ? (
          <div className="w-12 h-12 rounded-xl border border-outline-variant/30 overflow-hidden bg-white shadow-sm flex items-center justify-center p-1 shrink-0">
            <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgClass} ${iconTextClass} shrink-0`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(e);
          }}
          className="text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-lowest border border-outline-variant p-1.5 rounded-lg shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-body-md text-body-md font-semibold text-on-surface">{name}</h4>
          <span className={`${badgeBgClass} ${badgeTextClass} font-label-caps text-label-caps px-2 py-1 rounded-md text-[10px]`}>{typeBadge}</span>
        </div>
        <p className="font-data-lg text-data-lg text-on-surface text-right mt-4">{amount}</p>
      </div>
    </div>
  );
};

export default WalletCard;
