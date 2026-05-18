interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const navItems = [
    { id: 'Dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'Transaksi', icon: 'receipt_long', label: 'Transaksi' },
    { id: 'Dompet', icon: 'account_balance_wallet', label: 'Dompet' },
    { id: 'Tabungan', icon: 'savings', label: 'Tabungan' },
    { id: 'Investasi', icon: 'monitoring', label: 'Investasi' },
    { id: 'Analitik', icon: 'analytics', label: 'Analitik' }
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[280px] bg-primary-container dark:bg-surface-container-lowest z-50 overflow-y-auto py-6 shadow-sm border-r border-outline-variant/20">
      <div className="px-6 mb-8">
        <div className="font-headline-md text-headline-md font-black text-on-primary">WealthDash</div>
        <div className="font-body-sm text-body-sm text-on-primary-container mt-1">Wealth Management</div>
      </div>
      <nav className="flex-1 flex flex-col gap-2 px-2 font-label-caps text-label-caps">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (activeTab === 'WalletDetail' && item.id === 'Dompet');
          return (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={isActive 
                ? "flex items-center gap-3 bg-secondary-container text-on-secondary-container border-l-4 border-secondary px-4 py-3 rounded-r-lg w-full text-left" 
                : "flex items-center gap-3 text-on-primary-container px-4 py-3 opacity-70 hover:bg-secondary/10 hover:opacity-100 transition-all rounded-lg w-full text-left"
              }
            >
              <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto px-2 font-label-caps text-label-caps">
        <button 
          onClick={() => setActiveTab('Settings')}
          className={activeTab === 'Settings' 
            ? "flex items-center gap-3 bg-secondary-container text-on-secondary-container border-l-4 border-secondary px-4 py-3 rounded-r-lg w-full text-left"
            : "flex items-center gap-3 text-on-primary-container px-4 py-3 opacity-70 hover:bg-secondary/10 hover:opacity-100 transition-all rounded-lg w-full text-left"
          }
        >
          <span className={`material-symbols-outlined ${activeTab === 'Settings' ? 'filled' : ''}`} style={activeTab === 'Settings' ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
          Pengaturan
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
