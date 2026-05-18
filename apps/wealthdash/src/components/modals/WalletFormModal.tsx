import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMode?: boolean;
  initialData?: any;
}

const WalletFormModal = ({ isOpen, onClose, editMode = false, initialData }: WalletFormModalProps) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('account_balance_wallet');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [cluster, setCluster] = useState('liquid');
  const [balance, setBalance] = useState('');

  // Icon options
  const icons = [
    { id: 'account_balance_wallet', name: 'Wallet' },
    { id: 'account_balance', name: 'Bank' },
    { id: 'payments', name: 'Cash' },
    { id: 'credit_card', name: 'Card' },
    { id: 'show_chart', name: 'Invest' }
  ];

  useEffect(() => {
    if (editMode && initialData) {
      setName(initialData.name || '');
      setIcon(initialData.icon || 'account_balance_wallet');
      setLogoUrl(initialData.logoUrl || null);
      setCluster(initialData.cluster || 'liquid');
      setBalance(initialData.balance || '');
    } else {
      setName('');
      setIcon('account_balance_wallet');
      setLogoUrl(null);
      setCluster('liquid');
      setBalance('');
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

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={editMode ? "Edit Dompet" : "Tambah Dompet"} width="max-w-md">
      <div className="flex flex-col gap-5">
        {/* Name Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nama Dompet</label>
          <input 
            type="text" 
            placeholder="Contoh: GoPay, BCA, Dompet Fisik"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          />
        </div>

        {/* Icon/Logo Selector */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5 flex justify-between items-center">
            Ikon / Logo
            {logoUrl && (
              <button 
                onClick={() => setLogoUrl(null)}
                className="text-[12px] text-error hover:underline flex items-center"
              >
                Hapus Logo
              </button>
            )}
          </label>
          
          <div className="flex gap-2 items-center">
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

        {/* Cluster Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Klaster Aset</label>
          <select 
            value={cluster}
            onChange={(e) => setCluster(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
          >
            <option value="liquid">💵 Liquid Cash (Untuk jajan)</option>
            <option value="savings">🏦 Savings (Tabungan)</option>
            <option value="investment">📊 Investment (Investasi)</option>
          </select>
          
          {!editMode && (
            <p className="mt-2 text-[13px] text-on-surface-variant flex gap-1.5 bg-surface-container-low p-2 rounded">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Klaster menentukan posisi dompet di Donut Chart alokasi aset.
            </p>
          )}
        </div>

        {/* Balance Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">
            {editMode ? 'Saldo Saat Ini' : 'Saldo Awal'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input 
              type="number" 
              placeholder="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              disabled={editMode} // Saldo tidak bisa diedit langsung jika edit mode
              className={`w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md ${editMode ? 'opacity-70 cursor-not-allowed bg-surface-container-low' : ''}`}
            />
          </div>
          {editMode && (
             <p className="mt-2 text-[13px] text-[#b45309] bg-[#fef3c7] p-2 rounded flex gap-1.5">
               <span className="material-symbols-outlined text-[14px] shrink-0">warning</span>
               Saldo tidak bisa diedit langsung. Gunakan form transaksi untuk mengubah saldo (Income/Expense/Transfer).
             </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {editMode && (
            <button className="flex-1 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 border border-error text-error hover:bg-error/10 transition-colors">
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Hapus
            </button>
          )}
          <button 
            onClick={onClose}
            className={`py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm ${editMode ? 'flex-[2]' : 'w-full'}`}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Simpan Dompet
          </button>
        </div>

      </div>
    </ModalOverlay>
  );
};

export default WalletFormModal;
