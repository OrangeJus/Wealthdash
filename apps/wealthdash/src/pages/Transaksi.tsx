import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { transactionsApi } from '../services/api';
import type { TransactionFilters } from '../types';
import TransactionFilterBar from '../components/TransactionFilterBar';
import TransactionCharts from '../components/TransactionCharts';
import TransactionFullTable from '../components/TransactionFullTable';
import TransactionEmptyState from '../components/TransactionEmptyState';

interface TransaksiProps {
  onOpenTransaction: () => void;
  onEditTransaction: (tx: any) => void;
  onViewCategories: () => void;
  refreshTrigger?: number;
}

const Transaksi = ({ onOpenTransaction, onEditTransaction, onViewCategories, refreshTrigger }: TransaksiProps) => {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20 });

  const { data: txData, refetch } = useApi(
    () => transactionsApi.list(filters),
    [JSON.stringify(filters)]
  );

  // Refetch when refreshTrigger changes (e.g. after saving a transaction from modal)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await transactionsApi.delete(id);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

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
      <TransactionCharts onViewCategories={onViewCategories} filters={filters} />

      {/* Filter Bar */}
      <TransactionFilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Content */}
      <div className="flex-1">
        {txData && txData.transactions.length > 0 ? (
          <TransactionFullTable 
            transactions={txData.transactions}
            pagination={txData.pagination}
            onEdit={onEditTransaction} 
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        ) : (
          <TransactionEmptyState />
        )}
      </div>
    </div>
  );
};

export default Transaksi;
