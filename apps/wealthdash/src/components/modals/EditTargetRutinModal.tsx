import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface EditTargetRutinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmount?: number;
}

const EditTargetRutinModal = ({ isOpen, onClose, currentAmount = 250000 }: EditTargetRutinModalProps) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount.toString());
    }
  }, [isOpen, currentAmount]);

  const handleClose = () => {
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose} title="Ubah Target Rutin" width="max-w-sm">
      <div className="flex flex-col gap-5">
        
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Sesuaikan target menabung bulanan Anda jika ada perubahan pada pendapatan atau pengeluaran tetap.
        </p>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Target Bulanan Baru</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input 
              type="number" 
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md font-data-md"
            />
          </div>
        </div>

        <button 
          onClick={handleClose}
          disabled={!amount || Number(amount) <= 0}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Simpan Perubahan
        </button>

      </div>
    </ModalOverlay>
  );
};

export default EditTargetRutinModal;
