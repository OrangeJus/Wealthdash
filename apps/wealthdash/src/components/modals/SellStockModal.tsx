import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface SellStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockData?: any;
}

const SellStockModal = ({ isOpen, onClose, stockData }: SellStockModalProps) => {
  const [sellPrice, setSellPrice] = useState('');

  useEffect(() => {
    if (isOpen && stockData) {
      setSellPrice(stockData.currentPrice.toString());
    } else {
      setSellPrice('');
    }
  }, [isOpen, stockData]);

  if (!stockData) return null;

  const numSellPrice = Number(sellPrice) || 0;
  const shares = stockData.lots * 100;
  const hasilJual = numSellPrice * shares;
  const totalModal = stockData.buyPrice * shares;
  
  const profitLoss = hasilJual - totalModal;
  const profitLossPercent = totalModal > 0 ? (profitLoss / totalModal) * 100 : 0;
  const isProfit = profitLoss >= 0;

  const rdnBalance = 1500000;
  const rdnAfter = rdnBalance + hasilJual;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={`Jual Saham: ${stockData.code}`} width="max-w-md">
      <div className="flex flex-col gap-5">
        
        {/* Info Box */}
        <div className="bg-surface-container-low rounded-xl p-4 grid grid-cols-2 gap-y-3 font-body-sm text-body-sm">
          <div>
            <span className="text-on-surface-variant block mb-1 font-label-caps text-label-caps text-[10px]">KODE</span>
            <span className="font-semibold">{stockData.code}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block mb-1 font-label-caps text-label-caps text-[10px]">LOT / LEMBAR</span>
            <span className="font-semibold">{stockData.lots} ({shares})</span>
          </div>
          <div>
            <span className="text-on-surface-variant block mb-1 font-label-caps text-label-caps text-[10px]">HARGA BELI</span>
            <span className="font-data-sm">Rp {stockData.buyPrice.toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block mb-1 font-label-caps text-label-caps text-[10px]">TOTAL MODAL</span>
            <span className="font-data-sm">Rp {totalModal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Harga Jual</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input 
              type="number" 
              placeholder="0"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md font-data-md"
            />
          </div>
        </div>

        {/* Calculation Box */}
        <div className="border border-outline-variant/30 rounded-xl p-4 mt-2 bg-surface-container-lowest">
          <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            Kalkulasi Penjualan
          </h4>
          
          <div className="flex justify-between items-center mb-4 font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Hasil Jual</span>
            <span className="font-data-sm font-semibold">Rp {hasilJual.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="flex justify-between items-center mb-4 font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Profit/Loss Riil</span>
            <span className={`font-data-sm font-semibold px-2 py-1 rounded-md ${isProfit ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
              {isProfit ? '▲ +' : '▼ '}Rp {Math.abs(profitLoss).toLocaleString('id-ID')} ({isProfit ? '+' : ''}{profitLossPercent.toFixed(1)}%)
            </span>
          </div>
          
          <div className="h-px bg-outline-variant/20 w-full mb-4"></div>
          
          <div className="flex justify-between items-center font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Saldo RDN Setelah</span>
            <span className="font-data-sm font-semibold text-secondary">
              Rp {rdnAfter.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          disabled={!sellPrice || Number(sellPrice) <= 0}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-[#166534] text-white hover:bg-[#15803d] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          Konfirmasi Jual
        </button>

      </div>
    </ModalOverlay>
  );
};

export default SellStockModal;
