import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import { formatRp } from '../../hooks/useApi';

interface SellStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockData?: any;
  onSell?: (holdingId: string, sellPrice: number) => void;
}

const SellStockModal = ({ isOpen, onClose, stockData, onSell }: SellStockModalProps) => {
  const [sellPrice, setSellPrice] = useState('');

  useEffect(() => {
    if (isOpen && stockData) {
      setSellPrice(String(stockData.currentPrice || ''));
    }
  }, [isOpen, stockData]);

  if (!stockData) return null;

  const numSellPrice = Number(sellPrice) || 0;
  const shares = (stockData.lots || 0) * 100;
  const totalSale = numSellPrice * shares;
  const totalModal = (stockData.buyPrice || 0) * shares;
  const pnl = totalSale - totalModal;
  const isProfit = pnl >= 0;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={`Jual ${stockData.code}`} width="max-w-md">
      <div className="flex flex-col gap-5">
        <div className="bg-surface-container rounded-lg p-4 flex justify-between">
          <div>
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Kode</p>
            <p className="font-data-md text-data-md font-bold">{stockData.code}</p>
          </div>
          <div className="text-right">
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Lot Dimiliki</p>
            <p className="font-data-md text-data-md font-bold">{stockData.lots}</p>
          </div>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Harga Jual per Lembar</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md" />
          </div>
        </div>

        {numSellPrice > 0 && (
          <div className={`rounded-xl p-4 border ${isProfit ? 'bg-[#f0fdf4] border-[#86efac]' : 'bg-[#fef2f2] border-[#fca5a5]'}`}>
            <div className="flex justify-between font-body-sm text-[13px] mb-2">
              <span>Total Penjualan</span>
              <span className="font-semibold">{formatRp(totalSale)}</span>
            </div>
            <div className="flex justify-between font-body-sm text-[13px] mb-2">
              <span>Total Modal</span>
              <span>{formatRp(totalModal)}</span>
            </div>
            <div className="h-px bg-outline-variant/30 my-2"></div>
            <div className="flex justify-between font-data-md text-[14px] font-bold">
              <span>Realized P&L</span>
              <span className={isProfit ? 'text-secondary' : 'text-error'}>{isProfit ? '+' : ''}{formatRp(pnl)}</span>
            </div>
          </div>
        )}

        <button onClick={() => onSell?.(stockData.id, numSellPrice)} disabled={numSellPrice <= 0}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-error text-white hover:bg-error/90 transition-colors shadow-sm disabled:opacity-50">
          <span className="material-symbols-outlined text-[18px]">sell</span>
          Jual Semua ({stockData.lots} Lot)
        </button>
      </div>
    </ModalOverlay>
  );
};

export default SellStockModal;
