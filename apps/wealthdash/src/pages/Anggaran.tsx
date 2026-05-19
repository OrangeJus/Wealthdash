import { useState } from 'react';
import { useApi, formatRp } from '../hooks/useApi';
import { budgetsApi } from '../services/api';
import type { Budget } from '../types';
import AnggaranFormModal from '../components/modals/AnggaranFormModal';

interface AnggaranProps {
  onOpenTransaction: () => void;
}

const Anggaran = ({ onOpenTransaction }: AnggaranProps) => {
  const { data: budgetsData, refetch } = useApi(() => budgetsApi.list(), []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'bill' | 'wishlist'>('bill');

  const handleOpenForm = (mode: 'bill' | 'wishlist') => {
    setFormMode(mode);
    setIsFormOpen(true);
  };

  const toggleItem = async (id: string) => {
    try {
      await budgetsApi.toggle(id);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await budgetsApi.create(data);
      setIsFormOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Hapus item ini?')) return;
    try {
      await budgetsApi.delete(id);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const bills = budgetsData?.bills || [];
  const wishlist = budgetsData?.wishlist || [];
  const unpaidBills = bills.filter(b => !b.is_done);
  const paidBills = bills.filter(b => b.is_done);
  const activeWishlist = wishlist.filter(w => !w.is_done);
  const boughtWishlist = wishlist.filter(w => w.is_done);

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop max-w-container-max-width mx-auto w-full flex flex-col gap-8 mb-20 md:mb-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Anggaran & Rencana</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Kelola pengeluaran wajib bulanan dan wishlist belanja Anda.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenForm('wishlist')}
            className="flex items-center gap-2 bg-surface-container border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-label-caps text-label-caps hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            Wishlist Baru
          </button>
          <button 
            onClick={() => handleOpenForm('bill')}
            className="flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-caps text-label-caps hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Tagihan Baru
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* SECTION 1: Pengeluaran Wajib */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">event_repeat</span>
              Pengeluaran Wajib Bulanan
            </h3>
            <span className="bg-error/10 text-error font-data-sm px-2 py-1 rounded-md">{unpaidBills.length} Belum Dibayar</span>
          </div>

          <div className="flex flex-col gap-3">
            {unpaidBills.map(bill => (
              <div key={bill.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 hover:border-secondary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => toggleItem(bill.id)}
                    className="mt-0.5 w-5 h-5 rounded-md border-2 border-outline-variant flex items-center justify-center text-transparent hover:border-secondary transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-body-md text-body-md font-semibold text-on-surface">{bill.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-data-md text-data-md font-bold text-on-surface">{formatRp(bill.estimate)}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(bill.id); }} className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors" title="Hapus">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-label-caps text-on-surface-variant uppercase">{bill.type}</span>
                      {bill.category && <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-label-caps text-on-surface-variant uppercase">{bill.category}</span>}
                    </div>
                    {bill.details && (() => {
                      try {
                        const details = JSON.parse(bill.details);
                        return (
                          <ul className="mt-3 list-disc list-inside text-[13px] text-on-surface-variant pl-1 space-y-1">
                            {details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                          </ul>
                        );
                      } catch { return null; }
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {paidBills.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase pl-1">Sudah Dibayar Bulan Ini</h4>
              {paidBills.map(bill => (
                <div key={bill.id} className="bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl p-3 flex items-center gap-3 opacity-70">
                  <button 
                    onClick={() => toggleItem(bill.id)}
                    className="w-5 h-5 rounded-md bg-primary text-on-primary flex items-center justify-center shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                  <div className="flex-1 flex justify-between items-center line-through decoration-outline-variant">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">{bill.name}</span>
                    <span className="font-data-sm text-data-sm">{formatRp(bill.estimate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: Wishlist */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f59e0b]">shopping_cart_checkout</span>
              List Yang Mau Dibeli
            </h3>
            <span className="bg-surface-container text-on-surface-variant font-data-sm px-2 py-1 rounded-md">{activeWishlist.length} Item</span>
          </div>

          <div className="flex flex-col gap-3">
            {activeWishlist.map(item => (
              <div key={item.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 hover:border-[#f59e0b]/50 transition-colors group">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => toggleItem(item.id)}
                    className="mt-0.5 w-5 h-5 rounded-md border-2 border-outline-variant flex items-center justify-center text-transparent hover:border-[#f59e0b] transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-body-md text-body-md font-semibold text-on-surface group-hover:text-[#b45309] transition-colors">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-data-sm text-data-sm font-medium text-on-surface-variant">± {formatRp(item.estimate)}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors" title="Hapus">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                    {item.category && (
                      <div className="inline-block bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded text-[11px] font-label-caps uppercase mt-2">
                        {item.category}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {boughtWishlist.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase pl-1">Sudah Terbeli</h4>
              {boughtWishlist.map(item => (
                <div key={item.id} className="bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl p-3 flex items-center gap-3 opacity-60">
                  <button 
                    onClick={() => toggleItem(item.id)}
                    className="w-5 h-5 rounded-md bg-[#f59e0b] text-white flex items-center justify-center shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                  <div className="flex-1 flex justify-between items-center line-through decoration-outline-variant">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">{item.name}</span>
                    <span className="font-data-sm text-data-sm">{formatRp(item.estimate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      
      <AnggaranFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        mode={formMode}
        onSave={handleSave}
      />
    </div>
  );
};

export default Anggaran;
