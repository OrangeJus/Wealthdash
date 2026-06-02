import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { walletsApi, categoriesApi } from '../services/api';
import type { TransactionFilters } from '../types';
import CustomDateModal from './modals/CustomDateModal';

interface TransactionFilterBarProps {
  filters: TransactionFilters;
  onFilterChange: (newFilters: Partial<TransactionFilters>) => void;
}

interface SavedFilter {
  id: string;
  name: string;
  filter: Partial<TransactionFilters>;
}

const TransactionFilterBar = ({ filters, onFilterChange }: TransactionFilterBarProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [newFilterName, setNewFilterName] = useState('');
  const [isSavingFilter, setIsSavingFilter] = useState(false);

  // Fetch wallets and categories for dropdown options
  const { data: walletsData } = useApi(() => walletsApi.list(), []);
  const { data: categoriesData } = useApi(() => categoriesApi.list(), []);

  useEffect(() => {
    const saved = localStorage.getItem('wealthdash_saved_filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
  }, []);

  const saveFilterToStorage = (newFilters: SavedFilter[]) => {
    localStorage.setItem('wealthdash_saved_filters', JSON.stringify(newFilters));
    setSavedFilters(newFilters);
  };

  const handleSaveCurrentFilter = () => {
    if (!newFilterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: newFilterName.trim(),
      filter: {
        type: filters.type,
        wallet_id: filters.wallet_id,
        category_id: filters.category_id,
        period: filters.period,
        date_from: filters.date_from,
        date_to: filters.date_to,
      }
    };

    saveFilterToStorage([...savedFilters, newFilter]);
    setNewFilterName('');
    setIsSavingFilter(false);
  };

  const handleDeleteSavedFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveFilterToStorage(savedFilters.filter(f => f.id !== id));
  };

  const applySavedFilter = (savedFilter: SavedFilter) => {
    onFilterChange({
      type: savedFilter.filter.type,
      wallet_id: savedFilter.filter.wallet_id,
      category_id: savedFilter.filter.category_id,
      period: savedFilter.filter.period,
      date_from: savedFilter.filter.date_from,
      date_to: savedFilter.filter.date_to,
    });
  };

  // Quick tab views
  const tabs = [
    { id: 'all', label: 'Semua', filter: { type: undefined } },
    { id: 'expense', label: 'Pengeluaran', filter: { type: 'expense' } },
    { id: 'income', label: 'Pemasukan', filter: { type: 'income' } },
    { id: 'transfer', label: 'Transfer', filter: { type: 'transfer' } },
  ];

  const activeTab = filters.type || 'all';

  const handleTabClick = (tab: typeof tabs[0]) => {
    onFilterChange({ type: tab.filter.type });
  };

  const handleApplyCustomDate = (startDate: string, endDate: string) => {
    onFilterChange({ date_from: startDate, date_to: endDate, period: undefined });
    setIsDateModalOpen(false);
  };

  return (
    <>
      <section className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-sm flex flex-col transition-all">
        {/* ROW 1: Quick Tabs & Toggle */}
        <div className="flex items-center justify-between p-2">
          <div className="flex gap-1 items-center overflow-x-auto scrollbar-hide px-2">
            {tabs.map(tab => {
              const isActive = (tab.id === 'all' && !activeTab) || tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg font-label-caps text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-2 ml-2 pr-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-label-caps text-[12px] transition-colors ${
                showAdvanced ? 'bg-secondary/10 text-secondary' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Filter {showAdvanced ? 'Tutup' : ''}
            </button>
          </div>
        </div>

        {/* ROW 2: Advanced Filters */}
        {showAdvanced && (
          <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest rounded-b-xl flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {/* Wallet */}
              <select
                value={filters.wallet_id || ''}
                onChange={(e) => onFilterChange({ wallet_id: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
              >
                <option value="">Semua Dompet</option>
                {(walletsData?.wallets || []).map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              {/* Category */}
              <select
                value={filters.category_id || ''}
                onChange={(e) => onFilterChange({ category_id: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
              >
                <option value="">Semua Kategori</option>
                {(categoriesData?.all || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Period */}
              <select
                value={filters.period === 'today' || filters.period === 'this_week' || filters.period === 'this_year' ? filters.period : (filters.date_from ? 'custom' : (filters.period || ''))}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsDateModalOpen(true);
                    return;
                  }
                  onFilterChange({ period: e.target.value || undefined, date_from: undefined, date_to: undefined });
                }}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
              >
                <option value="">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="this_week">Minggu Ini</option>
                <option value={new Date().toISOString().substring(0, 7)}>Bulan Ini</option>
                <option value="this_year">Tahun Ini</option>
                <option value="custom">Tanggal Kustom...</option>
              </select>

              {/* Clear filters */}
              <button
                onClick={() => onFilterChange({ type: undefined, wallet_id: undefined, category_id: undefined, period: undefined, date_from: undefined, date_to: undefined })}
                className="px-4 py-2 border border-outline-variant rounded-lg font-label-caps text-[12px] text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Reset Filter
              </button>
            </div>

            {/* Active Filter Info & Save Filter */}
            {(() => {
              const hasActiveFilters = !!(filters.type || filters.wallet_id || filters.category_id || filters.period || filters.date_from || filters.date_to);
              if (!hasActiveFilters) return null;

              // Build a summary of active filters
              const dateLabel = filters.date_from
                ? (filters.date_from === filters.date_to
                    ? `Tanggal: ${filters.date_from}`
                    : `${filters.date_from} hingga ${filters.date_to}`)
                : (filters.period === 'today'
                    ? 'Hari Ini'
                    : filters.period === 'this_week'
                    ? 'Minggu Ini'
                    : filters.period === 'this_year'
                    ? 'Tahun Ini'
                    : null);

              return (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-secondary/5 p-3 rounded-lg border border-secondary/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    {dateLabel && (
                      <>
                        <span className="material-symbols-outlined text-secondary text-[18px]">event</span>
                        <span className="font-body-sm text-secondary">{dateLabel}</span>
                      </>
                    )}
                    {!dateLabel && (
                      <span className="font-body-sm text-secondary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                        Filter aktif
                      </span>
                    )}
                  </div>
                  {!isSavingFilter ? (
                    <button 
                      onClick={() => setIsSavingFilter(true)}
                      className="flex items-center gap-1.5 font-label-caps text-label-caps bg-secondary text-on-secondary px-4 py-2 rounded-lg shadow-sm hover:bg-secondary/90 transition-colors"
                    >
                      Simpan Filter Ini
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <input 
                        type="text" 
                        value={newFilterName}
                        onChange={(e) => setNewFilterName(e.target.value)}
                        placeholder="Nama Filter (mis. Liburan Bali)"
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveCurrentFilter}
                        className="text-secondary hover:text-secondary/80 font-semibold font-label-caps text-label-caps px-3 py-1 rounded-lg hover:bg-secondary/10 transition-colors"
                      >
                        Simpan
                      </button>
                      <button 
                        onClick={() => setIsSavingFilter(false)}
                        className="text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps px-3 py-1 rounded-lg hover:bg-surface-container transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Saved Filters List */}
            {savedFilters.length > 0 && (
              <div className="border-t border-outline-variant/30 pt-4 mt-2">
                <h4 className="font-label-caps text-[11px] text-on-surface-variant uppercase mb-3">Filter Tersimpan</h4>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map(sf => (
                    <div 
                      key={sf.id}
                      onClick={() => applySavedFilter(sf)}
                      className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded-full cursor-pointer group border border-transparent hover:border-outline-variant/50"
                    >
                      <span className="material-symbols-outlined text-[14px] text-secondary">bookmark</span>
                      <span className="font-body-sm text-[13px] text-on-surface">{sf.name}</span>
                      <button 
                        onClick={(e) => handleDeleteSavedFilter(sf.id, e)}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <CustomDateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleApplyCustomDate}
      />
    </>
  );
};

export default TransactionFilterBar;
