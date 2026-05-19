interface RecentTransactionsProps {
  onViewAll?: () => void;
}

const RecentTransactions = ({ onViewAll }: RecentTransactionsProps) => {
  const transactions = [
    { date: '24 Oct 2023', type: 'EXPENSE', category: 'Makanan', icon: 'restaurant', wallet: 'BCA Utama', desc: 'Makan siang di cafe', amount: '- Rp 150.000', amountClass: 'text-on-surface', typeClass: 'bg-[#fee2e2] text-[#991b1b]' },
    { date: '23 Oct 2023', type: 'INCOME', category: 'Gaji', icon: 'work', wallet: 'Mandiri Payroll', desc: 'Gaji Bulan Oktober', amount: '+ Rp 5.000.000', amountClass: 'text-secondary', typeClass: 'bg-[#dcfce7] text-[#166534]' },
    { date: '22 Oct 2023', type: 'EXPENSE', category: 'Transportasi', icon: 'local_taxi', wallet: 'Gopay', desc: 'Gojek ke kantor', amount: '- Rp 35.000', amountClass: 'text-on-surface', typeClass: 'bg-[#fee2e2] text-[#991b1b]' },
    { date: '21 Oct 2023', type: 'TRANSFER', category: 'Internal', icon: 'sync_alt', wallet: 'BCA -> Bibit', desc: 'Top up Reksadana', amount: 'Rp 500.000', amountClass: 'text-on-surface', typeClass: 'bg-[#f1f5f9] text-[#475569]' },
    { date: '20 Oct 2023', type: 'EXPENSE', category: 'Belanja', icon: 'shopping_cart', wallet: 'Kartu Kredit', desc: 'Groceries bulanan di Superindo', amount: '- Rp 850.000', amountClass: 'text-on-surface', typeClass: 'bg-[#fee2e2] text-[#991b1b]' },
  ];

  return (
    <div className="col-span-1 md:col-span-12 bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-container-lowest">
        <h3 className="font-headline-md text-headline-md text-on-surface">Recent Transactions</h3>
        <button 
          onClick={(e) => {
            e.preventDefault();
            onViewAll?.();
          }}
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
            {transactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-surface-variant hover:bg-surface-container-low/50 transition-colors h-[56px]">
                <td className="py-3 px-6 whitespace-nowrap">{tx.date}</td>
                <td className="py-3 px-6 whitespace-nowrap">
                  <span className={`${tx.typeClass} px-2 py-1 rounded text-[11px] font-label-caps`}>{tx.type}</span>
                </td>
                <td className="py-3 px-6 whitespace-nowrap flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{tx.icon}</span> {tx.category}
                </td>
                <td className="py-3 px-6 whitespace-nowrap">{tx.wallet}</td>
                <td className="py-3 px-6 hidden sm:table-cell text-on-surface-variant truncate max-w-[200px]">{tx.desc}</td>
                <td className={`py-3 px-6 whitespace-nowrap text-right font-data-md ${tx.amountClass}`}>{tx.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
