import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import { formatRp, formatNumberString, parseNumberString } from '../../hooks/useApi';
import type { Wallet } from '../../types';

interface RdnTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'topup' | 'withdraw';
  rdnBalance?: number;
  wallets?: Wallet[];
  onTransfer?: (data: any) => void;
}

const RdnTransferModal = ({ isOpen, onClose, type, rdnBalance = 0, wallets = [], onTransfer }: RdnTransferModalProps) => {
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setWalletId(wallets.length > 0 ? wallets[0].id : '');
    }
  }, [isOpen, wallets]);

  const selectedWallet = wallets.find(w => w.id === walletId);
  const numAmount = parseNumberString(amount) || 0;

  const handleSubmit = () => {
    if (!walletId || numAmount <= 0) return;
    if (type === 'topup') {
      onTransfer?.({ from_wallet_id: walletId, amount: numAmount });
    } else {
      onTransfer?.({ to_wallet_id: walletId, amount: numAmount });
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={type === 'topup' ? "Top-Up RDN" : "Tarik Dana RDN"} width="max-w-md">
      <div className="flex flex-col gap-5">
        {type === 'topup' ? (
          <>
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
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Ke Dompet</label>
              <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2.5 px-4 text-on-surface-variant text-body-md flex items-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
                RDN ({formatRp(rdnBalance)})
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Dari Dompet</label>
              <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2.5 px-4 text-on-surface-variant text-body-md flex items-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
                RDN ({formatRp(rdnBalance)})
              </div>
            </div>
            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Ke Dompet</label>
              <select value={walletId} onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none">
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nominal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input type="text" placeholder="0" value={amount} onChange={(e) => setAmount(formatNumberString(e.target.value))}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md font-data-md" />
          </div>
        </div>

        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start gap-2 mt-2">
          <span className="material-symbols-outlined text-[#0284c7] text-[18px] mt-0.5">info</span>
          <p className="font-body-sm text-body-sm text-[#0c4a6e]">
            {type === 'topup'
              ? `Saldo ${selectedWallet?.name || 'dompet'} saat ini: ${selectedWallet ? formatRp(selectedWallet.balance) : '-'}`
              : `Saldo RDN saat ini: ${formatRp(rdnBalance)}`
            }
          </p>
        </div>

        <button onClick={handleSubmit} disabled={!amount || numAmount <= 0}
          className={`w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${type === 'topup' ? 'bg-secondary hover:bg-secondary/90' : 'bg-[#0284c7] hover:bg-[#0369a1] transition-colors'}`}>
          <span className="material-symbols-outlined text-[18px]">{type === 'topup' ? 'add_circle' : 'account_balance_wallet'}</span>
          {type === 'topup' ? 'Top-Up RDN' : 'Tarik Dana'}
        </button>
      </div>
    </ModalOverlay>
  );
};

export default RdnTransferModal;
