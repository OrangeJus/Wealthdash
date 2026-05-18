import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface SetorTabunganModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SetorTabunganModal = ({ isOpen, onClose }: SetorTabunganModalProps) => {
  const [fromWallet, setFromWallet] = useState('bca');
  const [toWallet, setToWallet] = useState('tabungan_bca');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const bcaBalance = 8000000;

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setFromWallet('bca');
    }
  }, [isOpen]);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Setor ke Tabungan" width="max-w-md">
      <div className="flex flex-col gap-5">
        
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Dari Dompet</label>
          <select 
            value={fromWallet}
            onChange={(e) => setFromWallet(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
          >
            <option value="bca">BCA (Rp {bcaBalance.toLocaleString('id-ID')})</option>
            <option value="gopay">GoPay</option>
          </select>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Ke Dompet (Savings)</label>
          <select 
            value={toWallet}
            onChange={(e) => setToWallet(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
          >
            <option value="tabungan_bca">Tabungan BCA</option>
          </select>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nominal</label>
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
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Keterangan</label>
          <input 
            type="text" 
            placeholder="Contoh: Setor tabungan Mei"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          />
        </div>

        {/* Info Box */}
        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start gap-2 mt-2">
          <span className="material-symbols-outlined text-[#0284c7] text-[18px] mt-0.5">info</span>
          <p className="font-body-sm text-body-sm text-[#0c4a6e]">
            Setoran ini akan menggerakkan <strong>Savings Target Bar</strong> pada dashboard utama.
          </p>
        </div>

        <button 
          onClick={onClose}
          disabled={!amount || Number(amount) <= 0}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-[#166534] text-white hover:bg-[#15803d] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">savings</span>
          Setor Tabungan
        </button>

      </div>
    </ModalOverlay>
  );
};

export default SetorTabunganModal;
