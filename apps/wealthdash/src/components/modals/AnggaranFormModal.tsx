import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface AnggaranFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'bill' | 'wishlist';
}

const AnggaranFormModal = ({ isOpen, onClose, mode }: AnggaranFormModalProps) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [billType, setBillType] = useState('Wajib');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setAmount('');
      setCategory('');
      setBillType('Wajib');
    }
  }, [isOpen]);

  const isWishlist = mode === 'wishlist';

  return (
    <ModalOverlay 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isWishlist ? "Tambah Wishlist Baru" : "Tambah Tagihan Baru"} 
      width="max-w-md"
    >
      <div className="flex flex-col gap-5">
        
        {/* Name Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">
            Nama {isWishlist ? 'Barang' : 'Tagihan'}
          </label>
          <input 
            type="text" 
            placeholder={isWishlist ? "Contoh: Sepatu Baru, Meja Kerja" : "Contoh: Uang Kos, Internet, Netflix"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          />
        </div>

        {/* Amount Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">
            Perkiraan Harga / Biaya
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input 
              type="number" 
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
            />
          </div>
        </div>

        {/* Category Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Kategori</label>
          <input 
            type="text" 
            placeholder={isWishlist ? "Contoh: Gadget, Fashion, Kosan" : "Contoh: Utilitas, Hiburan, Kebutuhan"}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          />
        </div>

        {/* Type Field - Only for Bills */}
        {!isWishlist && (
          <div>
            <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Tipe Pengeluaran</label>
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/30">
              <button
                onClick={() => setBillType('Wajib')}
                className={`flex-1 py-2 rounded-md font-label-caps text-[12px] font-semibold transition-colors ${billType === 'Wajib' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                Wajib Pokok
              </button>
              <button
                onClick={() => setBillType('Langganan')}
                className={`flex-1 py-2 rounded-md font-label-caps text-[12px] font-semibold transition-colors ${billType === 'Langganan' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                Langganan
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4">
          <button 
            onClick={onClose}
            disabled={!name || !amount}
            className="w-full py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Simpan
          </button>
        </div>

      </div>
    </ModalOverlay>
  );
};

export default AnggaranFormModal;
