import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface RdnTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'topup' | 'withdraw';
}

const RdnTransferModal = ({ isOpen, onClose, type }: RdnTransferModalProps) => {
  const [wallet, setWallet] = useState('bca');
  const [amount, setAmount] = useState('');

  const rdnBalance = 1500000;
  const bcaBalance = 8000000;

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setWallet('bca');
    }
  }, [isOpen]);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={type === 'topup' ? "Top-Up RDN" : "Tarik Dana RDN"} width="max-w-md">
      <div className="flex flex-col gap-5">
        
        {/* Wallet fields */}
        {type === 'topup' ? (
          <>
            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Dari Dompet</label>
              <select 
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
              >
                <option value="bca">BCA (Rp {bcaBalance.toLocaleString('id-ID')})</option>
                <option value="gopay">GoPay</option>
              </select>
            </div>
            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Ke Dompet</label>
              <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2.5 px-4 text-on-surface-variant text-body-md flex items-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
                RDN BCA Sekuritas (Auto)
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Dari Dompet</label>
              <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2.5 px-4 text-on-surface-variant text-body-md flex items-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
                RDN BCA Sekuritas (Auto)
              </div>
            </div>
            <div>
              <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Ke Dompet</label>
              <select 
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
              >
                <option value="bca">BCA</option>
                <option value="gopay">GoPay</option>
              </select>
            </div>
          </>
        )}

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

        {/* Info Box */}
        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start gap-2 mt-2">
          <span className="material-symbols-outlined text-[#0284c7] text-[18px] mt-0.5">info</span>
          <p className="font-body-sm text-body-sm text-[#0c4a6e]">
            {type === 'topup' 
              ? `Saldo ${wallet.toUpperCase()} saat ini: Rp ${(wallet === 'bca' ? bcaBalance : 350000).toLocaleString('id-ID')}` 
              : `Saldo RDN saat ini: Rp ${rdnBalance.toLocaleString('id-ID')}`
            }
          </p>
        </div>

        <button 
          onClick={onClose}
          disabled={!amount || Number(amount) <= 0}
          className={`w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${type === 'topup' ? 'bg-secondary hover:bg-secondary/90' : 'bg-[#0284c7] hover:bg-[#0369a1] transition-colors'}`}
        >
          <span className="material-symbols-outlined text-[18px]">{type === 'topup' ? 'add_circle' : 'account_balance_wallet'}</span>
          {type === 'topup' ? 'Top-Up RDN' : 'Tarik Dana'}
        </button>

      </div>
    </ModalOverlay>
  );
};

export default RdnTransferModal;
