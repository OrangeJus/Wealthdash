import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMode?: boolean;
  initialData?: any;
  onSave?: (data: any) => void;
  onDelete?: () => void;
}

const CategoryFormModal = ({ isOpen, onClose, editMode = false, initialData, onSave, onDelete }: CategoryFormModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('category');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [budget, setBudget] = useState('');

  const icons = [
    { id: 'restaurant', name: 'Makanan' },
    { id: 'shopping_cart', name: 'Belanja' },
    { id: 'home', name: 'Rumah' },
    { id: 'directions_car', name: 'Transport' },
    { id: 'health_and_safety', name: 'Kesehatan' },
    { id: 'school', name: 'Pendidikan' },
    { id: 'work', name: 'Pekerjaan' },
    { id: 'category', name: 'Lainnya' }
  ];

  useEffect(() => {
    if (editMode && initialData && isOpen) {
      setName(initialData.name || '');
      setType(initialData.type || 'expense');
      setIcon(initialData.icon || 'category');
      setLogoUrl(initialData.logo_path || null);
      setBudget(initialData.budget ? initialData.budget.toString() : '');
    } else if (isOpen) {
      setName('');
      setType('expense');
      setIcon('category');
      setLogoUrl(null);
      setBudget('');
    }
  }, [editMode, initialData, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave?.({
      name: name.trim(),
      type,
      icon,
      logo_path: logoUrl,
      budget: budget ? Number(budget) : null,
    });
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={editMode ? "Edit Kategori" : "Tambah Kategori"} width="max-w-md">
      <div className="flex flex-col gap-5">
        {/* Type Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Tipe Kategori</label>
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/30">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-md font-label-caps text-[12px] font-semibold transition-colors ${type === 'expense' ? 'bg-[#fee2e2] text-[#991b1b] shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-md font-label-caps text-[12px] font-semibold transition-colors ${type === 'income' ? 'bg-[#dcfce7] text-[#166534] shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              Pemasukan
            </button>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nama Kategori</label>
          <input 
            type="text" 
            placeholder="Contoh: Makanan, Gaji, dll"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          />
        </div>

        {/* Budget Field (Only for Expense) */}
        {type === 'expense' && (
          <div>
            <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5 flex justify-between">
              <span>Batas Anggaran Bulanan</span>
              <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-normal">Opsional</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">Rp</span>
              <input 
                type="number" 
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-12 pr-4 bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-on-surface-variant italic">Kosongkan jika kategori ini tidak memiliki batas pengeluaran.</p>
          </div>
        )}

        {/* Icon/Logo Selector */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5 flex justify-between items-center">
            Ikon / Logo
            {logoUrl && (
              <button onClick={() => setLogoUrl(null)} className="text-[12px] text-error hover:underline flex items-center">
                Hapus Logo
              </button>
            )}
          </label>
          
          <div className="flex gap-2 items-center flex-wrap">
            {logoUrl ? (
              <div className="w-16 h-16 rounded-xl border-2 border-secondary overflow-hidden shrink-0 shadow-sm relative group">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            ) : (
              <>
                {icons.map(i => (
                  <button 
                    key={i.id}
                    onClick={() => setIcon(i.id)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      icon === i.id 
                        ? 'bg-secondary text-on-secondary shadow-md' 
                        : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined">{i.id}</span>
                  </button>
                ))}
                
                <div className="w-px h-8 bg-outline-variant/30 mx-2"></div>
                
                <label className="w-12 h-12 rounded-lg flex items-center justify-center bg-surface-container-low text-on-surface-variant border border-dashed border-outline-variant hover:bg-surface-container cursor-pointer transition-all hover:text-secondary hover:border-secondary">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </>
            )}
          </div>
          <p className="mt-2 text-[12px] text-on-surface-variant opacity-70">Pilih ikon default atau upload logo kustom (JPG/PNG).</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {editMode && onDelete && (
            <button 
              onClick={onDelete}
              className="flex-1 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 border border-error text-error hover:bg-error/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Hapus
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!name}
            className={`py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${editMode ? 'flex-[2]' : 'w-full'}`}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Simpan Kategori
          </button>
        </div>

      </div>
    </ModalOverlay>
  );
};

export default CategoryFormModal;
