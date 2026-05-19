import { useState, useCallback } from 'react';
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
import Kategori from './pages/Kategori';
import Anggaran from './pages/Anggaran';
import TransactionModal from './components/modals/TransactionModal';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionEditData, setTransactionEditData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectWallet = (id: string) => {
    setSelectedWalletId(id);
    setActiveTab('WalletDetail');
  };

  const handleOpenTransaction = (txData?: any) => {
    setTransactionEditData(txData || null);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSaved = useCallback(() => {
    setRefreshTrigger(k => k + 1);
  }, []);

  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col min-w-0 md:ml-[280px] overflow-hidden bg-background">
        <MobileHeader onOpenTransaction={() => handleOpenTransaction()} />
        
        {activeTab === 'Dashboard' && <Dashboard key={`d-${refreshTrigger}`} onOpenTransaction={() => handleOpenTransaction()} onViewAllTransactions={() => setActiveTab('Transaksi')} />}
        {activeTab === 'Analitik' && <Analytics key={`a-${refreshTrigger}`} />}
        {activeTab === 'Investasi' && <Investasi />}
        {activeTab === 'Anggaran' && <Anggaran key={`ag-${refreshTrigger}`} onOpenTransaction={() => handleOpenTransaction()} />}
        {activeTab === 'Tabungan' && <Tabungan />}
        {activeTab === 'Transaksi' && <Transaksi refreshTrigger={refreshTrigger} onOpenTransaction={() => handleOpenTransaction()} onEditTransaction={handleOpenTransaction} onViewCategories={() => setActiveTab('Kategori')} />}
        {activeTab === 'Kategori' && <Kategori onBack={() => setActiveTab('Transaksi')} />}
        {activeTab === 'Dompet' && <Dompet key={`dm-${refreshTrigger}`} onSelectWallet={handleSelectWallet} />}
        {activeTab === 'WalletDetail' && selectedWalletId && (
          <WalletDetail 
            key={`wd-${refreshTrigger}`}
            walletId={selectedWalletId} 
            onBack={() => setActiveTab('Dompet')} 
            onOpenTransaction={() => handleOpenTransaction()} 
            onEditTransaction={handleOpenTransaction}
          />
        )}
        {activeTab === 'Settings' && <Settings />}
        {activeTab !== 'Dashboard' && activeTab !== 'Analitik' && activeTab !== 'Investasi' && activeTab !== 'Tabungan' && activeTab !== 'Transaksi' && activeTab !== 'Dompet' && activeTab !== 'WalletDetail' && activeTab !== 'Kategori' && activeTab !== 'Anggaran' && activeTab !== 'Settings' && (
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
        onSaved={handleTransactionSaved}
      />
    </>
  );
}

export default App;
