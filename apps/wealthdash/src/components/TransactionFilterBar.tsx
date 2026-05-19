import { useState } from 'react';
import CustomDateModal from './modals/CustomDateModal';

interface FilterState {
  search: string;
  dateRange: string;
  customStartDate?: string;
  customEndDate?: string;
  wallet: string;
  category: string;
  type: string;
}

interface CustomView {
  id: string;
  name: string;
  filters: FilterState;
  isCustom: boolean;
}

const DEFAULT_VIEWS: CustomView[] = [
  { id: 'all', name: 'Semua Transaksi', isCustom: false, filters: { search: '', dateRange: '', wallet: '', category: '', type: '' } },
  { id: 'expenses', name: 'Pengeluaran', isCustom: false, filters: { search: '', dateRange: '', wallet: '', category: '', type: 'expense' } },
  { id: 'incomes', name: 'Pemasukan', isCustom: false, filters: { search: '', dateRange: '', wallet: '', category: '', type: 'income' } },
  { id: 'this_month', name: 'Bulan Ini', isCustom: false, filters: { search: '', dateRange: 'this_month', wallet: '', category: '', type: '' } },
];

const TransactionFilterBar = () => {
  const [views, setViews] = useState<CustomView[]>(DEFAULT_VIEWS);
  const [activeViewId, setActiveViewId] = useState('all');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Current temporary filter state before saving
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: '', dateRange: '', wallet: '', category: '', type: ''
  });

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [previousDateRange, setPreviousDateRange] = useState('');

  const handleSelectView = (view: CustomView) => {
    setActiveViewId(view.id);
    setCurrentFilters(view.filters);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === 'dateRange' && value === 'custom_trigger') {
      setPreviousDateRange(currentFilters.dateRange);
      setIsDateModalOpen(true);
      return;
    }
    setCurrentFilters({ ...currentFilters, [key]: value });
  };

  const handleApplyCustomDate = (startDate: string, endDate: string) => {
    setCurrentFilters({
      ...currentFilters,
      dateRange: 'custom',
      customStartDate: startDate,
      customEndDate: endDate
    });
    setIsDateModalOpen(false);
  };

  const handleCancelCustomDate = () => {
    setIsDateModalOpen(false);
    // If they were previously on something else, revert. If they were already on 'custom', leave it.
    if (currentFilters.dateRange !== 'custom') {
      setCurrentFilters({ ...currentFilters, dateRange: previousDateRange });
    }
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    
    const newView: CustomView = {
      id: `custom_${Date.now()}`,
      name: newViewName,
      filters: { ...currentFilters },
      isCustom: true
    };
    
    setViews([...views, newView]);
    setActiveViewId(newView.id);
    setNewViewName('');
    setShowAdvanced(false); // Auto close advanced after saving
  };

  const handleDeleteView = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent selecting the view when clicking delete
    const newViews = views.filter(v => v.id !== id);
    setViews(newViews);
    if (activeViewId === id) {
      handleSelectView(newViews[0]); // fallback to 'all'
    }
  };

  const activeView = views.find(v => v.id === activeViewId);

  return (
    <>
      <section className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-sm flex flex-col transition-all">
      
      {/* ROW 1: Quick Tabs & Toggle */}
      <div className="flex items-center justify-between p-2">
        {/* Scrollable Tabs */}
        <div className="flex gap-1 items-center overflow-x-auto scrollbar-hide px-2">
          {views.map(view => {
            const isActive = activeViewId === view.id;
            return (
              <button 
                key={view.id}
                onClick={() => handleSelectView(view)}
                className={`group whitespace-nowrap pl-4 pr-3 py-2 rounded-lg font-label-caps text-[13px] font-semibold transition-all flex items-center gap-2 ${
                  isActive 
                  ? 'bg-secondary text-on-secondary shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {view.name}
                {view.isCustom && (
                  <span 
                    onClick={(e) => handleDeleteView(e, view.id)}
                    className={`material-symbols-outlined text-[14px] p-0.5 rounded-full opacity-50 hover:opacity-100 transition-opacity ${isActive ? 'hover:bg-on-secondary/20' : 'hover:bg-outline-variant'}`}
                  >
                    close
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-2 ml-2 pr-2">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-label-caps text-[12px] transition-colors ${
              showAdvanced ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Filter {showAdvanced ? 'Tutup' : ''}
          </button>
        </div>
      </div>

      {/* ROW 2: Advanced Filters (Collapsible) */}
      {showAdvanced && (
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest rounded-b-xl flex flex-col gap-5 animate-in slide-in-from-top-2 duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                value={currentFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:outline-none focus:border-secondary transition-colors" 
              />
            </div>
            
            {/* Date Range */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_today</span>
              <select 
                value={currentFilters.dateRange === 'custom' ? 'custom' : currentFilters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:outline-none focus:border-secondary transition-colors appearance-none"
              >
                {currentFilters.dateRange === 'custom' && (
                  <option value="custom">
                    {currentFilters.customEndDate 
                      ? `${new Date(currentFilters.customStartDate!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(currentFilters.customEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
                      : new Date(currentFilters.customStartDate!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                    }
                  </option>
                )}
                <option value="">Semua Waktu</option>
                <option value="this_month">Bulan Ini</option>
                <option value="last_month">Bulan Lalu</option>
                <option value="last_3_months">3 Bulan Terakhir</option>
                <option value="this_year">Tahun Ini</option>
                <option value="last_year">Tahun Lalu</option>
                <option value="custom_trigger">{currentFilters.dateRange === 'custom' ? 'Ubah Tanggal Kustom...' : 'Pilih Tanggal Kustom...'}</option>
              </select>
            </div>
            
            {/* Wallet */}
            <select 
              value={currentFilters.wallet}
              onChange={(e) => handleFilterChange('wallet', e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Semua Dompet</option>
              <option value="bca">BCA Utama</option>
              <option value="gopay">GoPay</option>
            </select>
            
            {/* Category */}
            <select 
              value={currentFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Semua Kategori</option>
              <option value="food">Makanan</option>
              <option value="transport">Transport</option>
            </select>

            {/* Type */}
            <select 
              value={currentFilters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          {/* Save Custom View Block */}
          <div className="bg-[#f0f9ff] dark:bg-primary/10 border border-[#bae6fd] dark:border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h5 className="font-label-caps text-[12px] font-bold text-primary dark:text-primary-fixed">SIMPAN FILTER INI</h5>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">Sering pakai kombinasi filter di atas? Simpan sebagai Tab View agar gampang diakses nanti!</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Contoh: Makan BCA" 
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                className="flex-1 sm:w-48 px-3 py-2 text-[13px] rounded-lg border border-outline-variant focus:outline-none focus:border-primary bg-white dark:bg-surface-container-lowest"
              />
              <button 
                onClick={handleSaveView}
                disabled={!newViewName.trim()}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-[12px] whitespace-nowrap disabled:opacity-50 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>

        </div>
      )}

    </section>
      
      <CustomDateModal 
        isOpen={isDateModalOpen}
        onClose={handleCancelCustomDate}
        onApply={handleApplyCustomDate}
        initialStartDate={currentFilters.customStartDate}
        initialEndDate={currentFilters.customEndDate}
      />
    </>
  );
};

export default TransactionFilterBar;
