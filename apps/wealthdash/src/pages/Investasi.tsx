import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { investmentsApi, walletsApi } from '../services/api';
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
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  const { data: holdingsData, refetch: refetchHoldings } = useApi(() => investmentsApi.holdings(), []);
  const { data: rdnData, refetch: refetchRdn } = useApi(() => investmentsApi.rdnBalance(), []);
  const { data: walletsData } = useApi(() => walletsApi.list(), []);

  const handleOpenSell = (stockData: any) => {
    setSellStockData(stockData);
    setIsSellModalOpen(true);
  };

  const handleOpenRdn = (type: 'topup' | 'withdraw') => {
    setRdnModalType(type);
    setIsRdnModalOpen(true);
  };

  const handleBuy = async (data: { code: string; name?: string; price: number; lots: number }) => {
    try {
      await investmentsApi.buy(data);
      setIsBuyModalOpen(false);
      refetchHoldings();
      refetchRdn();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSell = async (holdingId: string, sellPrice: number) => {
    try {
      await investmentsApi.sell({ holding_id: holdingId, sell_price: sellPrice });
      setIsSellModalOpen(false);
      refetchHoldings();
      refetchRdn();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePrice = async (id: string, price: number) => {
    try {
      await investmentsApi.updatePrice(id, price);
      refetchHoldings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRdnTransfer = async (data: any) => {
    try {
      if (rdnModalType === 'topup') {
        await investmentsApi.rdnTopup(data);
      } else {
        await investmentsApi.rdnWithdraw(data);
      }
      setIsRdnModalOpen(false);
      refetchRdn();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const nonInvestmentWallets = (walletsData?.wallets || []).filter(w => w.cluster !== 'investment');

  return (
    <div className="flex-1 p-margin-mobile md:p-margin-desktop bg-background max-w-container-max-width mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Investment Portfolio</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage your stocks and track market performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              setIsUpdatingPrices(true);
              try {
                const result = await investmentsApi.updateAllPrices();
                refetchHoldings();
                alert(`Harga diperbarui: ${result.updated} berhasil, ${result.failed} gagal`);
              } catch (err: any) {
                alert('Gagal update harga: ' + err.message);
              } finally {
                setIsUpdatingPrices(false);
              }
            }}
            disabled={isUpdatingPrices}
            className="px-4 py-2 border border-outline-variant rounded-lg font-label-caps text-label-caps text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isUpdatingPrices ? 'animate-spin' : ''}`}>refresh</span>
            {isUpdatingPrices ? 'Memperbarui...' : 'Update Semua Harga'}
          </button>
          <button 
            onClick={() => setIsBuyModalOpen(true)}
            className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-label-caps text-label-caps shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Beli Saham
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-8">
        <RdnBalanceCard 
          balance={rdnData?.balance || 0}
          onTopUp={() => handleOpenRdn('topup')} 
          onWithdraw={() => handleOpenRdn('withdraw')} 
        />
        <PortfolioSummaryCard summary={holdingsData?.summary} />
      </div>

      {/* Portfolio Table */}
      <PortfolioHoldingsTable 
        holdings={holdingsData?.holdings || []}
        onSell={handleOpenSell} 
        onUpdatePrice={handleUpdatePrice}
      />

      <BuyStockModal 
        isOpen={isBuyModalOpen} 
        onClose={() => setIsBuyModalOpen(false)} 
        rdnBalance={rdnData?.balance || 0}
        onBuy={handleBuy}
      />
      <SellStockModal 
        isOpen={isSellModalOpen} 
        onClose={() => setIsSellModalOpen(false)} 
        stockData={sellStockData}
        onSell={handleSell}
      />
      <RdnTransferModal 
        isOpen={isRdnModalOpen} 
        onClose={() => setIsRdnModalOpen(false)} 
        type={rdnModalType}
        rdnBalance={rdnData?.balance || 0}
        wallets={nonInvestmentWallets}
        onTransfer={handleRdnTransfer}
      />
    </div>
  );
};

export default Investasi;
