import { useState } from 'react';
import ModalOverlay from './ModalOverlay';

interface SavingsTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SavingsTopUpModal = ({ isOpen, onClose }: SavingsTopUpModalProps) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const currentTarget = 400000;
  const numAmount = Number(amount) || 0;
  const newTarget = currentTarget + numAmount;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Top-Up Target Tabungan" width="max-w-md">
      <div className="flex flex-col gap-5">
        
        {/* Info Box */}
        <div className="bg-surface-container-low rounded-xl p-4 font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-1">
          <p>Target saat ini: <span className="font-semibold text-on-surface">Rp {currentTarget.toLocaleString('id-ID')}</span></p>
          <p className="text-[12px] opacity-80">(Rutin 250K + Rollover 100K + TopUp 50K)</p>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Tambah Target</label>
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

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Alasan</label>
          <input 
            type="text" 
            placeholder="Contoh: Bonus dari kantor"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          />
        </div>

        {/* Calculation Box */}
        <div className="border border-outline-variant/30 rounded-xl p-4 mt-2 bg-surface-container-lowest">
          <div className="flex justify-between items-center font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Target Baru Bulan Ini</span>
            <span className="font-data-sm font-semibold text-secondary">
              Rp {newTarget.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          disabled={!amount || Number(amount) <= 0}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Tambah Target
        </button>

      </div>
    </ModalOverlay>
  );
};

export default SavingsTopUpModal;
