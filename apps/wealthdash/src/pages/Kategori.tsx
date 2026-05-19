import { useState } from 'react';
import CategoryFormModal from '../components/modals/CategoryFormModal';

interface KategoriProps {
  onBack?: () => void;
}

const Kategori = ({ onBack }: KategoriProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const categories = [
    { id: 1, name: 'Makanan', type: 'expense', icon: 'restaurant', count: 45 },
    { id: 2, name: 'Belanja Bulanan', type: 'expense', icon: 'shopping_cart', count: 12 },
    { id: 3, name: 'Utilitas & Tagihan', type: 'expense', icon: 'home', count: 8 },
    { id: 4, name: 'Gaji', type: 'income', icon: 'work', count: 1 },
    { id: 5, name: 'Bonus', type: 'income', icon: 'payments', count: 0 },
    { id: 6, name: 'Transportasi', type: 'expense', icon: 'directions_car', count: 20 },
  ];

  const expenses = categories.filter(c => c.type === 'expense');
  const incomes = categories.filter(c => c.type === 'income');

  const handleEdit = (cat: any) => {
    setEditData(cat);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setIsFormOpen(true);
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
            {expenses.map(cat => (
              <div key={cat.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex justify-between items-center hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => handleEdit(cat)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#fee2e2] text-[#991b1b] flex items-center justify-center">
                    <span className="material-symbols-outlined">{cat.icon}</span>
                  </div>
                  <div>
                    <div className="font-body-md text-body-md font-semibold text-on-surface">{cat.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{cat.count} Transaksi</div>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Pemasukan */}
        <div className="flex flex-col gap-4">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-2">Kategori Pemasukan</h3>
          <div className="flex flex-col gap-3">
            {incomes.map(cat => (
              <div key={cat.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex justify-between items-center hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => handleEdit(cat)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#dcfce7] text-[#166534] flex items-center justify-center">
                    <span className="material-symbols-outlined">{cat.icon}</span>
                  </div>
                  <div>
                    <div className="font-body-md text-body-md font-semibold text-on-surface">{cat.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{cat.count} Transaksi</div>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
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
      />
    </div>
  );
};

export default Kategori;
