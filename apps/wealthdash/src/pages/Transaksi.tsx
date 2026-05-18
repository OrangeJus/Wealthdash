import TransactionFilterBar from '../components/TransactionFilterBar';
import TransactionFullTable from '../components/TransactionFullTable';
import TransactionEmptyState from '../components/TransactionEmptyState';

interface TransaksiProps {
  onOpenTransaction: () => void;
  onEditTransaction: (tx: any) => void;
}

const Transaksi = ({ onOpenTransaction, onEditTransaction }: TransaksiProps) => {
  return (
    <div className="flex-1 p-margin-mobile md:p-margin-desktop mb-20 md:mb-0 max-w-container-max-width mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Riwayat Transaksi</h2>
        </div>
        <button 
          onClick={onOpenTransaction}
          className="hidden md:flex items-center gap-2 bg-[#3B82F6] hover:bg-secondary-container transition-colors text-on-primary font-body-sm text-body-sm px-5 py-2.5 rounded-lg font-semibold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Transaksi
        </button>
      </header>

      {/* Filter Bar */}
      <TransactionFilterBar />

      {/* Content */}
      <div className="flex-1 mt-6">
        <TransactionFullTable 
          onEdit={onEditTransaction} 
          onDelete={(id) => alert(`Delete transaction ${id}`)} 
        />
      </div>

      {/* Empty State (Hidden by default for demonstration) */}
      <TransactionEmptyState />
    </div>
  );
};

export default Transaksi;
