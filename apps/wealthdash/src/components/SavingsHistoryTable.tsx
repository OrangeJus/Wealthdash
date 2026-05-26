import { useState } from 'react';
import { formatRp } from '../hooks/useApi';

interface SavingsDeposit {
  id: string;
  target_id: string;
  wallet_id: string;
  wallet_name: string;
  period: string;
  amount: number;
  type: 'routine' | 'topup';
  transaction_id: string | null;
  created_at: string;
}

interface SavingsHistoryTableProps {
  deposits: SavingsDeposit[];
  wallets: { id: string; name: string; balance: number }[];
  onEdit: (id: string, data: { amount?: number; wallet_id?: string }) => void;
  onDelete: (id: string) => void;
}

const SavingsHistoryTable = ({ deposits, wallets, onEdit, onDelete }: SavingsHistoryTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editWalletId, setEditWalletId] = useState('');

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMonth = (period: string) => {
    const [y, m] = period.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  const startEdit = (deposit: SavingsDeposit) => {
    setEditingId(deposit.id);
    setEditAmount(String(deposit.amount));
    setEditWalletId(deposit.wallet_id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditWalletId('');
  };

  const submitEdit = () => {
    if (!editingId || !editAmount) return;
    onEdit(editingId, {
      amount: Number(editAmount),
      wallet_id: editWalletId,
    });
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus riwayat setoran ini? Saldo dompet akan disesuaikan kembali.')) return;
    onDelete(id);
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
        <h3 className="font-headline-md text-headline-md text-on-surface">Riwayat Setor Tabungan</h3>
        <span className="font-body-sm text-on-surface-variant">{deposits.length} setoran</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant">Tanggal</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant">Periode</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant">Dompet Asal</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant">Tipe</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-right">Nominal</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-center w-[100px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {deposits.map((dep) => (
              <tr key={dep.id} className="hover:bg-surface-container-low/50 transition-colors group">
                {editingId === dep.id ? (
                  // Edit mode
                  <>
                    <td className="px-6 py-3 font-body-sm text-on-surface-variant">{formatDate(dep.created_at)}</td>
                    <td className="px-6 py-3 font-body-sm">{formatMonth(dep.period)}</td>
                    <td className="px-6 py-3">
                      <select 
                        value={editWalletId} 
                        onChange={(e) => setEditWalletId(e.target.value)}
                        className="w-full px-2 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-sm focus:outline-none focus:border-secondary"
                      >
                        {wallets.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        dep.type === 'routine' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
                      }`}>
                        {dep.type === 'routine' ? 'Rutin' : 'Top-up'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="relative inline-block">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs">Rp</span>
                        <input 
                          type="number" 
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-[140px] pl-8 pr-2 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-sm text-right focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={submitEdit}
                          className="p-1.5 text-secondary hover:bg-secondary/10 rounded transition-colors"
                          title="Simpan"
                        >
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded transition-colors"
                          title="Batal"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="px-6 py-3 font-body-sm text-on-surface-variant">{formatDate(dep.created_at)}</td>
                    <td className="px-6 py-3 font-body-sm">{formatMonth(dep.period)}</td>
                    <td className="px-6 py-3 font-body-sm font-medium">{dep.wallet_name || '-'}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        dep.type === 'routine' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
                      }`}>
                        {dep.type === 'routine' ? 'Rutin' : 'Top-up'}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-data-sm text-right font-semibold text-secondary">{formatRp(dep.amount)}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(dep)}
                          className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(dep.id)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {deposits.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">Belum ada riwayat setoran</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SavingsHistoryTable;
