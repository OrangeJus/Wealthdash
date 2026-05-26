import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import { formatRp } from '../../hooks/useApi';
import type { Wallet, Budget } from '../../types';

interface WalletPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetItem: Budget | null;
  wallets: Wallet[];
  defaultWalletId?: string;
  onConfirm: (walletId: string) => void;
}

const WalletPickerModal = ({
  isOpen,
  onClose,
  budgetItem,
  wallets = [],
  defaultWalletId,
  onConfirm,
}: WalletPickerModalProps) => {
  const [selectedWalletId, setSelectedWalletId] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Filter for liquid wallets or fallback to all wallets
      const liquidWallets = wallets.filter(w => w.cluster === 'liquid');
      if (defaultWalletId && wallets.some(w => w.id === defaultWalletId)) {
        setSelectedWalletId(defaultWalletId);
      } else if (liquidWallets.length > 0) {
        setSelectedWalletId(liquidWallets[0].id);
      } else if (wallets.length > 0) {
        setSelectedWalletId(wallets[0].id);
      } else {
        setSelectedWalletId('');
      }
    }
  }, [isOpen, wallets, defaultWalletId]);

  if (!budgetItem) return null;

  const activeWallet = wallets.find(w => w.id === selectedWalletId);

  const handlePay = () => {
    if (!selectedWalletId) return;
    onConfirm(selectedWalletId);
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Pilih Dompet Pembayaran" width="max-w-md">
      <div className="flex flex-col gap-5">
        <div>
          <p className="font-body-md text-on-surface-variant mb-2">
            Anda akan menandai tagihan/rencana berikut sebagai selesai:
          </p>
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex items-center justify-between">
            <div>
              <p className="font-title-md font-semibold text-on-surface text-[16px]">{budgetItem.name}</p>
              <p className="font-body-sm text-on-surface-variant capitalize text-[13px] mt-0.5">
                {budgetItem.type} • {budgetItem.category || 'Tanpa Kategori'}
              </p>
            </div>
            <p className="font-title-lg font-bold text-secondary text-[18px]">{formatRp(budgetItem.estimate)}</p>
          </div>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5 font-medium">Pilih Dompet Pembayaran</label>
          <select 
            value={selectedWalletId} 
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          >
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({formatRp(w.balance)}) {w.id === defaultWalletId ? '🌟 [Default]' : ''}
              </option>
            ))}
          </select>
        </div>

        {activeWallet && (
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start gap-2 text-[#0c4a6e]">
            <span className="material-symbols-outlined text-[#0284c7] text-[18px] mt-0.5">info</span>
            <p className="font-body-sm text-body-sm">
              Saldo {activeWallet.name} setelah pembayaran akan menjadi: <strong>{formatRp(activeWallet.balance - budgetItem.estimate)}</strong>
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-label-caps text-[14px] flex items-center justify-center border border-outline-variant/50 text-on-surface hover:bg-surface-container-low transition-colors"
          >
            Batal
          </button>
          <button 
            type="button"
            onClick={handlePay} 
            disabled={!selectedWalletId}
            className="flex-1 py-3 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-[#0058be] hover:bg-[#004bb1] text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Bayar
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default WalletPickerModal;
