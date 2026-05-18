import { useState } from 'react';
import RdnBalanceCard from '../components/RdnBalanceCard';
import PortfolioSummaryCard from '../components/PortfolioSummaryCard';
import PortfolioHoldingsTable from '../components/PortfolioHoldingsTable';
import BuyStockModal from '../components/modals/BuyStockModal';
import SellStockModal from '../components/modals/SellStockModal';
import RdnTransferModal from '../components/modals/RdnTransferModal';

const Investasi = () => {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellStockData, setSellStockData] = useState<any>(null);
  
  const [isRdnModalOpen, setIsRdnModalOpen] = useState(false);
  const [rdnModalType, setRdnModalType] = useState<'topup' | 'withdraw'>('topup');

  const handleOpenSell = (stockData: any) => {
    setSellStockData(stockData);
    setIsSellModalOpen(true);
  };

  const handleOpenRdn = (type: 'topup' | 'withdraw') => {
    setRdnModalType(type);
    setIsRdnModalOpen(true);
  };

  return (
    <div className="flex-1 p-margin-mobile md:p-margin-desktop bg-background max-w-container-max-width mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Investment Portfolio</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage your stocks and track market performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-outline-variant rounded-lg font-label-caps text-label-caps text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]" data-icon="refresh">refresh</span>
            Update Semua Harga
          </button>
          <button 
            onClick={() => setIsBuyModalOpen(true)}
            className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-label-caps text-label-caps shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]" data-icon="add">add</span>
            Beli Saham
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-8">
        <RdnBalanceCard onTopUp={() => handleOpenRdn('topup')} onWithdraw={() => handleOpenRdn('withdraw')} />
        <PortfolioSummaryCard />
      </div>

      {/* Portfolio Table */}
      <PortfolioHoldingsTable onSell={handleOpenSell} />

      <BuyStockModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
      <SellStockModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} stockData={sellStockData} />
      <RdnTransferModal isOpen={isRdnModalOpen} onClose={() => setIsRdnModalOpen(false)} type={rdnModalType} />
    </div>
  );
};

export default Investasi;
