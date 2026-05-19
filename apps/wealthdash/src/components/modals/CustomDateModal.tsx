import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface CustomDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const CustomDateModal = ({ isOpen, onClose, onApply, initialStartDate, initialEndDate }: CustomDateModalProps) => {
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');

  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate || '');
      setEndDate(initialEndDate || '');
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  const handleApply = () => {
    if (startDate) {
      onApply(startDate, endDate);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Pilih Rentang Tanggal" width="max-w-sm">
      <div className="flex flex-col gap-5">
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5 font-semibold">Mulai Tanggal</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface font-body-md"
          />
        </div>
        
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5 font-semibold flex justify-between items-center">
            <span>Sampai Tanggal</span>
            <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-normal">Opsional</span>
          </label>
          <input 
            type="date" 
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface font-body-md"
          />
          <p className="text-[11px] text-on-surface-variant mt-2 italic">Biarkan kosong jika hanya ingin melihat satu tanggal spesifik.</p>
        </div>

        <div className="mt-2 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-label-caps text-[13px] border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleApply}
            disabled={!startDate}
            className="flex-1 py-3 rounded-xl font-label-caps text-[13px] bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            Terapkan
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default CustomDateModal;
