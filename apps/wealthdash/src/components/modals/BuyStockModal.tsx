import { useState } from 'react';
import ModalOverlay from './ModalOverlay';

interface BuyStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuyStockModal = ({ isOpen, onClose }: BuyStockModalProps) => {
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [lots, setLots] = useState('');

  const numPrice = Number(price) || 0;
  const numLots = Number(lots) || 0;
  const shares = numLots * 100;
  const totalModal = numPrice * shares;

  const rdnBalance = 3200000;
  const rdnAfter = rdnBalance - totalModal;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Beli Saham" width="max-w-md">
      <div className="flex flex-col gap-5">
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Kode Saham</label>
          <input 
            type="text" 
            placeholder="Contoh: BBCA"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md uppercase"
          />
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Harga Beli</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input 
              type="number" 
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
            />
          </div>
        </div>

        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Jumlah Lot</label>
          <div className="relative">
            <input 
              type="number" 
              placeholder="0"
              value={lots}
              onChange={(e) => setLots(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">Lot</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 mt-2">
          <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3">Ringkasan Pembelian</h4>
          
          <div className="flex justify-between items-center mb-2 font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Total Lembar</span>
            <span className="font-data-sm font-semibold">{shares.toLocaleString('id-ID')} lembar</span>
          </div>
          
          <div className="flex justify-between items-center mb-4 font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Total Modal</span>
            <span className="font-data-sm font-semibold">Rp {totalModal.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="h-px bg-outline-variant/20 w-full mb-4"></div>
          
          <div className="flex justify-between items-center mb-2 font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Saldo RDN</span>
            <span className="font-data-sm">Rp {rdnBalance.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="flex justify-between items-center font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Saldo Setelah</span>
            <span className={`font-data-sm font-semibold ${rdnAfter < 0 ? 'text-error' : 'text-secondary'}`}>
              Rp {rdnAfter.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          disabled={rdnAfter < 0 || totalModal <= 0 || !code}
          className="w-full mt-2 py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          Beli Saham
        </button>

      </div>
    </ModalOverlay>
  );
};

export default BuyStockModal;
