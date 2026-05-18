interface PortfolioHoldingsTableProps {
  onSell?: (stockData: any) => void;
}

const PortfolioHoldingsTable = ({ onSell }: PortfolioHoldingsTableProps) => {
  const holdings = [
    { code: 'BBCA', name: 'Bank Central Asia Tbk.', buyPrice: 8500, lot: 10, capital: 'Rp 8.500.000', currPrice: 9800, pnlAmount: '+Rp 1.300.000', pnlPercent: '+15.29%', pnlClass: 'text-secondary' },
    { code: 'BBRI', name: 'Bank Rakyat Indonesia Tbk.', buyPrice: 5200, lot: 25, capital: 'Rp 13.000.000', currPrice: 4950, pnlAmount: '-Rp 625.000', pnlPercent: '-4.80%', pnlClass: 'text-error' },
    { code: 'TLKM', name: 'Telkom Indonesia Tbk.', buyPrice: 3800, lot: 15, capital: 'Rp 5.700.000', currPrice: 4100, pnlAmount: '+Rp 450.000', pnlPercent: '+7.89%', pnlClass: 'text-secondary' },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-center">
        <h3 className="font-headline-md text-headline-md text-on-surface">Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Kode Saham</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Harga Beli</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Lot</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Total Modal</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Harga Sekarang</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Floating P&L</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {holdings.map((holding, idx) => (
              <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-caps text-[10px]">{holding.code.substring(0, 4).replace('BB', 'B')}</div>
                    <div>
                      <p className="font-data-md text-data-md text-on-surface">{holding.code}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{holding.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-data-sm text-data-sm text-on-surface text-right">Rp {holding.buyPrice.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 font-data-sm text-data-sm text-on-surface text-right">{holding.lot}</td>
                <td className="px-6 py-4 font-data-sm text-data-sm text-on-surface text-right">{holding.capital}</td>
                <td className="px-6 py-4 font-data-sm text-data-sm text-on-surface text-right">
                  <div className="flex justify-end group/edit items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-outline opacity-0 group-hover/edit:opacity-100 cursor-pointer">edit</span>
                    <span>Rp {holding.currPrice.toLocaleString('id-ID')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className={`font-data-sm text-data-sm ${holding.pnlClass}`}>{holding.pnlAmount}</p>
                  <p className={`font-data-sm text-[11px] ${holding.pnlClass}`}>{holding.pnlPercent}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onSell?.({ code: holding.code, lots: holding.lot, buyPrice: holding.buyPrice, currentPrice: holding.currPrice })}
                    className="px-3 py-1.5 border border-outline-variant rounded font-label-caps text-label-caps text-on-surface hover:bg-error-container hover:text-on-error-container hover:border-error-container transition-colors"
                  >
                    Jual
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioHoldingsTable;
