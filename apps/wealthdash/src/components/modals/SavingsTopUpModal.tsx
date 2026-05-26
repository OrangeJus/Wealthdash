import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import { formatRp, formatNumberString, parseNumberString } from '../../hooks/useApi';
import type { Wallet, SavingsTarget } from '../../types';

interface SavingsTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets?: SavingsTarget[];
  wallets?: Wallet[];
  onSave?: (data: any) => void;
}

const SavingsTopUpModal = ({ isOpen, onClose, wallets = [], onSave }: SavingsTopUpModalProps) => {
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setWalletId(wallets.length > 0 ? wallets[0].id : '');
    }
  }, [isOpen, wallets]);

  const selectedWallet = wallets.find(w => w.id === walletId);

  const handleSubmit = () => {
    if (!walletId || !amount) return;
    onSave?.({
      wallet_id: walletId,
      amount: parseNumberString(amount),
      type: 'topup',
    });
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Top-Up Tabungan" width="max-w-md">
      <div className="flex flex-col gap-5">

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Dari Dompet</label>
          <select value={walletId} onChange={(e) => setWalletId(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none">
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({formatRp(w.balance)})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nominal Top-Up</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input type="text" placeholder="0" value={amount} onChange={(e) => setAmount(formatNumberString(e.target.value))}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md font-data-md" />
          </div>
        </div>

        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start gap-2 mt-2">
          <span className="material-symbols-outlined text-[#0284c7] text-[18px] mt-0.5">info</span>
          <p className="font-body-sm text-body-sm text-[#0c4a6e]">
            Top-up ini akan menambah progres tabungan bulan ini.
            {selectedWallet && <><br/>Saldo {selectedWallet.name}: {formatRp(selectedWallet.balance)}</>}
          </p>
        </div>

        <button onClick={handleSubmit} disabled={!amount || parseNumberString(amount) <= 0}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Top-Up Tabungan
        </button>
      </div>
    </ModalOverlay>
  );
};

export default SavingsTopUpModal;
