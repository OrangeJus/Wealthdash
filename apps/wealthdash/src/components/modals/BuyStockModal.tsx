import { useState } from 'react';
import ModalOverlay from './ModalOverlay';
import { formatRp } from '../../hooks/useApi';

interface BuyStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  rdnBalance?: number;
  onBuy?: (data: { code: string; name?: string; price: number; lots: number }) => void;
}

const BuyStockModal = ({ isOpen, onClose, rdnBalance = 0, onBuy }: BuyStockModalProps) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [lots, setLots] = useState('');

  const numPrice = Number(price) || 0;
  const numLots = Number(lots) || 0;
  const totalCost = numPrice * numLots * 100;
  const canAfford = totalCost <= rdnBalance && totalCost > 0;

  const handleSave = () => {
    if (!code || !price || !lots) return;
    onBuy?.({ code: code.toUpperCase(), name: name || undefined, price: numPrice, lots: numLots });
    setCode(''); setName(''); setPrice(''); setLots('');
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Beli Saham" width="max-w-md">
      <div className="flex flex-col gap-5">
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Kode Saham</label>
          <input type="text" placeholder="Contoh: BBCA" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md uppercase" />
        </div>
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nama Emiten (opsional)</label>
          <input type="text" placeholder="Contoh: Bank Central Asia Tbk." value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md" />
        </div>
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Harga per Lembar</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md" />
          </div>
        </div>
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Jumlah Lot</label>
          <input type="number" placeholder="0" value={lots} onChange={(e) => setLots(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md" />
        </div>

        {totalCost > 0 && (
          <div className={`rounded-xl p-3 flex items-start gap-2 ${canAfford ? 'bg-[#f0fdf4] border border-[#86efac]' : 'bg-[#fef2f2] border border-[#fca5a5]'}`}>
            <span className="material-symbols-outlined text-[18px] mt-0.5">{canAfford ? 'check_circle' : 'warning'}</span>
            <div className="font-body-sm text-body-sm">
              <p>Total: <strong>{formatRp(totalCost)}</strong></p>
              <p className="text-[12px] opacity-70">Saldo RDN: {formatRp(rdnBalance)}</p>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={!canAfford || !code}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50">
          <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
          Beli {code || 'Saham'}
        </button>
      </div>
    </ModalOverlay>
  );
};

export default BuyStockModal;
