import TransactionFilterBar from '../components/TransactionFilterBar';
import TransactionCharts from '../components/TransactionCharts';
import TransactionFullTable from '../components/TransactionFullTable';
import TransactionEmptyState from '../components/TransactionEmptyState';

interface TransaksiProps {
  onOpenTransaction: () => void;
  onEditTransaction: (tx: any) => void;
  onViewCategories: () => void;
}

const Transaksi = ({ onOpenTransaction, onEditTransaction, onViewCategories }: TransaksiProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop mb-20 md:mb-0 max-w-container-max-width mx-auto w-full flex flex-col gap-5">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Riwayat Transaksi</h2>
        </div>
        <button 
          onClick={onOpenTransaction}
          className="hidden md:flex items-center gap-2 bg-secondary hover:bg-secondary-container transition-colors text-on-secondary hover:text-on-secondary-container font-label-caps text-label-caps px-5 py-2.5 rounded-lg font-semibold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Transaksi
        </button>
      </header>

      {/* Summary Charts */}
      <TransactionCharts onViewCategories={onViewCategories} />

      {/* Filter Bar */}
      <TransactionFilterBar />

      {/* Content */}
      <div className="flex-1">
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
