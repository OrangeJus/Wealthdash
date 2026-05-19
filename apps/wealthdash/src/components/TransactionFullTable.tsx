import { formatRp } from '../hooks/useApi';
import type { Transaction, TransactionPagination } from '../types';

interface TransactionFullTableProps {
  transactions: Transaction[];
  pagination?: TransactionPagination;
  onEdit?: (tx: any) => void;
  onDelete?: (id: string) => void;
  onPageChange?: (page: number) => void;
}

const TransactionFullTable = ({ transactions, pagination, onEdit, onDelete, onPageChange }: TransactionFullTableProps) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTypeDisplay = (tx: Transaction) => {
    if (tx.type === 'income') return { icon: 'arrow_upward', iconBg: 'bg-[#3B82F6]/10', iconColor: 'text-[#3B82F6]' };
    if (tx.type === 'expense') return { icon: 'arrow_downward', iconBg: 'bg-error-container/30', iconColor: 'text-error' };
    return { icon: 'sync_alt', iconBg: 'bg-surface-container-high', iconColor: 'text-on-surface-variant' };
  };

  return (
    <section className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-variant">
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[120px]">Tanggal</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[80px]">Tipe</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[180px]">Deskripsi</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[140px]">Kategori</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[140px]">Dompet</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant text-right">Jumlah</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[80px] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant font-body-sm text-body-sm text-on-surface">
            {transactions.map((tx) => {
              const display = getTypeDisplay(tx);
              const amountPrefix = tx.type === 'income' ? '+ ' : tx.type === 'expense' ? '- ' : '';
              const amountColor = tx.type === 'income' ? 'text-[#3B82F6]' : tx.type === 'expense' ? 'text-error' : 'text-on-surface';
              const walletLabel = tx.type === 'transfer' ? `${tx.wallet_name} → ${tx.to_wallet_name}` : tx.wallet_name;

              return (
                <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors h-[64px] group">
                  <td className="px-6 py-4 whitespace-nowrap font-data-sm text-data-sm text-on-surface-variant">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full ${display.iconBg} flex items-center justify-center ${display.iconColor}`}>
                      <span className="material-symbols-outlined text-[16px]">{display.icon}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{tx.note || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-container text-on-surface-variant text-xs">
                      {tx.category_name || tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{walletLabel}</td>
                  <td className={`px-6 py-4 text-right font-data-md text-data-md ${amountColor}`}>{amountPrefix}{formatRp(tx.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit?.(tx); }}
                        className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(tx.id); }}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex items-center justify-between">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} transaksi
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-8 h-8 rounded flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button 
                key={p}
                onClick={() => onPageChange?.(p)}
                className={`w-8 h-8 rounded flex items-center justify-center font-body-sm font-medium ${p === pagination.page ? 'bg-secondary-container text-on-secondary-container' : 'hover:bg-surface-container-low text-on-surface'}`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-8 h-8 rounded flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TransactionFullTable;
