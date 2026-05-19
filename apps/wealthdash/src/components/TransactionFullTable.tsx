interface TransactionFullTableProps {
  onEdit?: (tx: any) => void;
  onDelete?: (id: string) => void;
}

const TransactionFullTable = ({ onEdit, onDelete }: TransactionFullTableProps) => {
  const transactions = [
    { id: '1', date: '24 Okt 2023', type: 'expense', icon: 'arrow_downward', iconBg: 'bg-error-container/30', iconColor: 'text-error', desc: 'Makan Malam (Sate Khas Senayan)', category: 'Makanan', wallet: 'BCA Utama', amount: '- Rp 350.000', amountColor: 'text-error' },
    { id: '2', date: '23 Okt 2023', type: 'income', icon: 'arrow_upward', iconBg: 'bg-[#3B82F6]/10', iconColor: 'text-[#3B82F6]', desc: 'Gaji Bulan Oktober', category: 'Gaji', wallet: 'BCA Utama', amount: '+ Rp 15.000.000', amountColor: 'text-[#3B82F6]' },
    { id: '3', date: '22 Okt 2023', type: 'expense', icon: 'arrow_downward', iconBg: 'bg-error-container/30', iconColor: 'text-error', desc: 'Isi Saldo GoPay', category: 'Transportasi', wallet: 'Mandiri Bisnis', amount: '- Rp 200.000', amountColor: 'text-error' },
    { id: '4', date: '20 Okt 2023', type: 'transfer', icon: 'sync_alt', iconBg: 'bg-surface-container-high', iconColor: 'text-on-surface-variant', desc: 'Transfer antar Rekening', category: 'Transfer', wallet: 'BCA ke Mandiri', amount: 'Rp 5.000.000', amountColor: 'text-on-surface' },
    { id: '5', date: '18 Okt 2023', type: 'expense', icon: 'arrow_downward', iconBg: 'bg-error-container/30', iconColor: 'text-error', desc: 'Tagihan Listrik PLN', category: 'Utilitas', wallet: 'BCA Utama', amount: '- Rp 850.000', amountColor: 'text-error' },
  ];

  return (
    <section className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-variant">
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[120px] cursor-pointer hover:text-on-surface">
                <div className="flex items-center gap-1">Tanggal <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span></div>
              </th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[80px]">Tipe</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[180px]">Deskripsi</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[140px]">Kategori</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[140px]">Dompet</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant text-right cursor-pointer hover:text-on-surface">
                <div className="flex items-center justify-end gap-1">Jumlah <span className="material-symbols-outlined text-[14px] opacity-0">arrow_drop_down</span></div>
              </th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant w-[80px] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant font-body-sm text-body-sm text-on-surface">
            {transactions.map((tx, idx) => (
              <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors h-[64px] group">
                <td className="px-6 py-4 whitespace-nowrap font-data-sm text-data-sm text-on-surface-variant">{tx.date}</td>
                <td className="px-6 py-4">
                  <div className={`w-8 h-8 rounded-full ${tx.iconBg} flex items-center justify-center ${tx.iconColor}`}>
                    <span className="material-symbols-outlined text-[16px]">{tx.icon}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{tx.desc}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-container text-on-surface-variant text-xs">{tx.category}</span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant">{tx.wallet}</td>
                <td className={`px-6 py-4 text-right font-data-md text-data-md ${tx.amountColor}`}>{tx.amount}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit?.(tx)}
                      className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete?.(tx.id)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex items-center justify-between">
        <span className="font-body-sm text-body-sm text-on-surface-variant">Menampilkan 1-5 dari 124 transaksi</span>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50" disabled>
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded flex items-center justify-center bg-secondary-container text-on-secondary-container font-body-sm font-medium">1</button>
          <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container-low text-on-surface font-body-sm font-medium">2</button>
          <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container-low text-on-surface font-body-sm font-medium">3</button>
          <span className="text-on-surface-variant">...</span>
          <button className="w-8 h-8 rounded flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TransactionFullTable;
