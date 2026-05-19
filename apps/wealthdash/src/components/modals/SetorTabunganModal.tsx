import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import { formatRp } from '../../hooks/useApi';
import type { Wallet, SavingsTarget } from '../../types';

interface SetorTabunganModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets?: SavingsTarget[];
  wallets?: Wallet[];
  onSave?: (data: any) => void;
}

const SetorTabunganModal = ({ isOpen, onClose, targets = [], wallets = [], onSave }: SetorTabunganModalProps) => {
  const [targetId, setTargetId] = useState('');
  const [fromWalletId, setFromWalletId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setTargetId(targets.length > 0 ? targets[0].id : '');
      setFromWalletId(wallets.length > 0 ? wallets[0].id : '');
    }
  }, [isOpen, targets, wallets]);

  const selectedWallet = wallets.find(w => w.id === fromWalletId);

  const handleSubmit = () => {
    if (!targetId || !fromWalletId || !amount) return;
    onSave?.({
      target_id: targetId,
      wallet_id: fromWalletId,
      amount: Number(amount),
      type: 'routine',
    });
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Setor ke Tabungan" width="max-w-md">
      <div className="flex flex-col gap-5">
        
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Target Tabungan</label>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none">
            {targets.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({formatRp(t.monthly_amount)}/bln)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Dari Dompet</label>
          <select value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none">
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({formatRp(w.balance)})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nominal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md font-data-md" />
          </div>
        </div>

        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start gap-2 mt-2">
          <span className="material-symbols-outlined text-[#0284c7] text-[18px] mt-0.5">info</span>
          <p className="font-body-sm text-body-sm text-[#0c4a6e]">
            Setoran ini akan menggerakkan <strong>Savings Target Bar</strong> pada dashboard utama.
            {selectedWallet && <><br/>Saldo {selectedWallet.name}: {formatRp(selectedWallet.balance)}</>}
          </p>
        </div>

        <button onClick={handleSubmit} disabled={!amount || Number(amount) <= 0}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-[#166534] text-white hover:bg-[#15803d] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <span className="material-symbols-outlined text-[18px]">savings</span>
          Setor Tabungan
        </button>
      </div>
    </ModalOverlay>
  );
};

export default SetorTabunganModal;
