import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import { formatNumberString, parseNumberString } from '../../hooks/useApi';

interface TargetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMode?: boolean;
  initialData?: any;
}

const TargetFormModal = ({ isOpen, onClose, editMode = false, initialData }: TargetFormModalProps) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [icon, setIcon] = useState('savings');

  useEffect(() => {
    if (editMode && initialData && isOpen) {
      setName(initialData.name || '');
      setAmount(initialData.amount ? formatNumberString(initialData.amount) : '');
      setIcon(initialData.icon || 'savings');
    } else if (isOpen) {
      setName('');
      setAmount('');
      setIcon('savings');
    }
  }, [editMode, initialData, isOpen]);

  const handleClose = () => {
    setName('');
    setAmount('');
    setIcon('savings');
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose} title={editMode ? "Edit Target Rutin" : "Tambah Target Rutin"} width="max-w-md">
      <div className="flex flex-col gap-5">
        
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nama Target</label>
          <input 
            type="text" 
            placeholder="Contoh: Dana Darurat"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          />
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nominal Bulanan</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input 
              type="text" 
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(formatNumberString(e.target.value))}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
            />
          </div>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Ikon (Material Symbols)</label>
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/50 shrink-0">
              <span className="material-symbols-outlined text-on-surface text-[24px]">{icon || 'help'}</span>
            </div>
            <input 
              type="text" 
              placeholder="savings, home, flight"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
            />
          </div>
        </div>

        <button 
          onClick={handleClose}
          disabled={!name || !amount || parseNumberString(amount) <= 0}
          className="w-full mt-4 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Simpan Target
        </button>

      </div>
    </ModalOverlay>
  );
};

export default TargetFormModal;
