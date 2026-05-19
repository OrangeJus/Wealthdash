import { useApi, formatRp } from '../hooks/useApi';
import { transactionsApi } from '../services/api';
import type { Transaction } from '../types';

interface RecentTransactionsProps {
  onViewAll?: () => void;
}

const RecentTransactions = ({ onViewAll }: RecentTransactionsProps) => {
  const { data: transactions } = useApi(() => transactionsApi.recent(), []);

  const getTypeDisplay = (tx: Transaction) => {
    if (tx.type === 'income') return { label: 'INCOME', icon: 'work', typeClass: 'bg-[#dcfce7] text-[#166534]' };
    if (tx.type === 'expense') return { label: 'EXPENSE', icon: tx.category_icon || 'receipt', typeClass: 'bg-[#fee2e2] text-[#991b1b]' };
    return { label: 'TRANSFER', icon: 'sync_alt', typeClass: 'bg-[#f1f5f9] text-[#475569]' };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="col-span-1 md:col-span-12 bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-container-lowest">
        <h3 className="font-headline-md text-headline-md text-on-surface">Recent Transactions</h3>
        <button 
          onClick={(e) => { e.preventDefault(); onViewAll?.(); }}
          className="font-body-sm text-body-sm text-secondary hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-variant font-label-caps text-label-caps text-on-surface-variant">
              <th className="py-4 px-6 font-medium uppercase tracking-wider">Tanggal</th>
              <th className="py-4 px-6 font-medium uppercase tracking-wider">Tipe</th>
              <th className="py-4 px-6 font-medium uppercase tracking-wider">Kategori</th>
              <th className="py-4 px-6 font-medium uppercase tracking-wider">Dompet</th>
              <th className="py-4 px-6 font-medium uppercase tracking-wider hidden sm:table-cell">Keterangan</th>
              <th className="py-4 px-6 font-medium uppercase tracking-wider text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm text-on-surface">
            {(transactions || []).map((tx) => {
              const display = getTypeDisplay(tx);
              const amountPrefix = tx.type === 'income' ? '+ ' : tx.type === 'expense' ? '- ' : '';
              const amountClass = tx.type === 'income' ? 'text-secondary' : tx.type === 'expense' ? 'text-on-surface' : 'text-on-surface';
              const walletLabel = tx.type === 'transfer' ? `${tx.wallet_name} → ${tx.to_wallet_name}` : tx.wallet_name;

              return (
                <tr key={tx.id} className="border-b border-surface-variant hover:bg-surface-container-low/50 transition-colors h-[56px]">
                  <td className="py-3 px-6 whitespace-nowrap">{formatDate(tx.date)}</td>
                  <td className="py-3 px-6 whitespace-nowrap">
                    <span className={`${display.typeClass} px-2 py-1 rounded text-[11px] font-label-caps`}>{display.label}</span>
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{display.icon}</span> {tx.category_name || tx.type}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap">{walletLabel}</td>
                  <td className="py-3 px-6 hidden sm:table-cell text-on-surface-variant truncate max-w-[200px]">{tx.note || '-'}</td>
                  <td className={`py-3 px-6 whitespace-nowrap text-right font-data-md ${amountClass}`}>{amountPrefix}{formatRp(tx.amount)}</td>
                </tr>
              );
            })}
            {(!transactions || transactions.length === 0) && (
              <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">Belum ada transaksi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
