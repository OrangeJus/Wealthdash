import { useState } from 'react';
import { useApi, formatRp } from '../hooks/useApi';
import { categoriesApi } from '../services/api';
import type { Category } from '../types';
import CategoryFormModal from '../components/modals/CategoryFormModal';

interface KategoriProps {
  onBack?: () => void;
}

const Kategori = ({ onBack }: KategoriProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const { data: categoriesData, refetch } = useApi(() => categoriesApi.list(), []);

  const expenses = categoriesData?.expense || [];
  const incomes = categoriesData?.income || [];

  const handleEdit = (cat: Category) => {
    setEditData(cat);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setIsFormOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editData) {
        await categoriesApi.update(editData.id, data);
      } else {
        await categoriesApi.create(data);
      }
      setIsFormOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await categoriesApi.delete(id);
      setIsFormOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop max-w-container-max-width mx-auto w-full flex flex-col gap-8 mb-20 md:mb-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors w-fit font-label-caps text-label-caps mb-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Transaksi
            </button>
          )}
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Kelola Kategori</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Atur kategori pemasukan dan pengeluaran Anda.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-lg font-label-caps text-label-caps hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Kategori
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Pengeluaran */}
        <div className="flex flex-col gap-4">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-2">Kategori Pengeluaran</h3>
          <div className="flex flex-col gap-3">
            {expenses.map(cat => {
              const spent = cat.spent_this_month || 0;
              const budget = cat.budget || 0;
              const percentage = budget > 0 ? Math.min((spent / budget) * 100, 150) : 0;
              const barColorClass = percentage >= 90 ? '#ef4444' : percentage >= 70 ? '#f59e0b' : '#10b981';

              return (
                <div key={cat.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => handleEdit(cat)}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {cat.logo_path ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <img src={cat.logo_path} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#fee2e2] text-[#991b1b] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">{cat.icon}</span>
                        </div>
                      )}
                      <div>
                        <div className="font-body-md text-body-md font-semibold text-on-surface">{cat.name}</div>
                        <div className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">{cat.transaction_count || 0} Transaksi</div>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:text-on-secondary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-outline-variant/30">
                    <div className="flex justify-between font-body-sm text-[11px] mb-2 font-medium text-on-surface-variant">
                      <span>{formatRp(spent)} terpakai</span>
                      {budget > 0
                        ? <span className={`font-semibold ${percentage >= 90 ? 'text-[#ef4444]' : percentage >= 70 ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>{Math.round(percentage)}% dari {formatRp(budget)}</span>
                        : <span className="flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">all_inclusive</span> Bebas</span>
                      }
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden shadow-inner">
                      {budget > 0
                        ? <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColorClass }}></div>
                        : <div className="bg-gradient-to-r from-outline-variant/10 to-outline-variant/30 h-full rounded-full w-full"></div>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolom Pemasukan */}
        <div className="flex flex-col gap-4">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-2">Kategori Pemasukan</h3>
          <div className="flex flex-col gap-3">
            {incomes.map(cat => (
              <div key={cat.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => handleEdit(cat)}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {cat.logo_path ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img src={cat.logo_path} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#dcfce7] text-[#166534] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">{cat.icon}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">{cat.name}</div>
                      <div className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">{cat.transaction_count || 0} Transaksi</div>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:text-on-secondary transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CategoryFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        editMode={!!editData}
        initialData={editData}
        onSave={handleSave}
        onDelete={editData ? () => handleDelete(editData.id) : undefined}
      />
    </div>
  );
};

export default Kategori;
