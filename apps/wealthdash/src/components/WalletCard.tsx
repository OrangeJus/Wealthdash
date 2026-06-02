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
      className={`bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 hover:shadow-[0px_8px_24px_rgba(15,23,42,0.06)] hover:border-outline transition-all duration-300 group flex items-center gap-4 relative w-full h-[100px] ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Absolute positioned edit button on hover */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(e);
        }}
        className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-surface-container-lowest border border-outline-variant p-1 rounded shadow-sm z-10 flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[16px]">edit</span>
      </button>

      {/* Left Area: Unified Logo + Badge Column (Vertically & Horizontally Centered) */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 h-full justify-between">
        {/* Logo Container (Square 1:1, Rounded corners, elegant focus size) */}
        {logoUrl ? (
          <div className="w-12 h-12 rounded-xl border border-outline-variant/30 overflow-hidden bg-white shadow-sm flex items-center justify-center p-1.5 shrink-0 transition-transform duration-300 group-hover:scale-105">
            <img src={logoUrl} alt={name} className="w-full h-full object-contain rounded-md" />
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconBgClass} ${iconTextClass}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
        )}

        {/* Badge (Small, readable, perfectly aligned & centered under the logo without truncation) */}
        <span className={`${badgeBgClass} ${badgeTextClass} font-label-caps text-[8px] px-1.5 py-0.5 rounded text-center shrink-0 whitespace-nowrap`}>
          {typeBadge}
        </span>
      </div>

      {/* Right Area: Name and Balance Column (Hierarchically Balanced) */}
      <div className="flex flex-col justify-center items-start min-w-0 flex-1 h-full py-0.5">
        {/* Wallet Name (Identitas Utama - Hierarchy 1) */}
        <h4 className="font-body-md text-[15px] font-bold text-on-surface truncate w-full leading-tight">{name}</h4>
        
        {/* Balance Amount (Informasi Terpenting Kedua - Hierarchy 2) */}
        <p className="font-data-sm text-data-sm text-on-surface-variant text-left font-semibold whitespace-nowrap mt-1 leading-none">{amount}</p>
      </div>
    </div>
  );
};

export default WalletCard;
