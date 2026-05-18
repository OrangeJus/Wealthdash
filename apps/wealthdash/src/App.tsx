import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Investasi from './pages/Investasi';
import Tabungan from './pages/Tabungan';
import Transaksi from './pages/Transaksi';
import Dompet from './pages/Dompet';
import Settings from './pages/Settings';
import WalletDetail from './pages/WalletDetail';
import TransactionModal from './components/modals/TransactionModal';

function App() {
  const [activeTab, setActiveTab] = useState('Dompet');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionEditData, setTransactionEditData] = useState<any>(null);

  const handleSelectWallet = (id: string) => {
    setSelectedWalletId(id);
    setActiveTab('WalletDetail');
  };

  const handleOpenTransaction = (txData?: any) => {
    setTransactionEditData(txData || null);
    setIsTransactionModalOpen(true);
  };

  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col min-w-0 md:ml-[280px] overflow-hidden bg-background">
        <MobileHeader onOpenTransaction={() => handleOpenTransaction()} />
        
        {activeTab === 'Dashboard' && <Dashboard onOpenTransaction={() => handleOpenTransaction()} />}
        {activeTab === 'Analitik' && <Analytics />}
        {activeTab === 'Investasi' && <Investasi />}
        {activeTab === 'Tabungan' && <Tabungan />}
        {activeTab === 'Transaksi' && <Transaksi onOpenTransaction={() => handleOpenTransaction()} onEditTransaction={handleOpenTransaction} />}
        {activeTab === 'Dompet' && <Dompet onSelectWallet={handleSelectWallet} />}
        {activeTab === 'WalletDetail' && selectedWalletId && (
          <WalletDetail 
            walletId={selectedWalletId} 
            onBack={() => setActiveTab('Dompet')} 
            onOpenTransaction={() => handleOpenTransaction()} 
            onEditTransaction={handleOpenTransaction}
          />
        )}
        {activeTab === 'Settings' && <Settings />}
        {/* Placeholder for other tabs */}
        {activeTab !== 'Dashboard' && activeTab !== 'Analitik' && activeTab !== 'Investasi' && activeTab !== 'Tabungan' && activeTab !== 'Transaksi' && activeTab !== 'Dompet' && activeTab !== 'WalletDetail' && activeTab !== 'Settings' && (
          <div className="flex-1 flex items-center justify-center p-8 text-on-surface-variant">
            <p>Halaman {activeTab} sedang dalam pengembangan.</p>
          </div>
        )}
      </main>

      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
        editMode={!!transactionEditData}
        initialData={transactionEditData}
      />
    </>
  );
}

export default App;
