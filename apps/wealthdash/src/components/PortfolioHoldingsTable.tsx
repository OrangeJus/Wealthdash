import { formatRp } from '../hooks/useApi';
import type { StockHolding } from '../types';

interface PortfolioHoldingsTableProps {
  holdings: StockHolding[];
  onSell?: (stockData: any) => void;
  onUpdatePrice?: (id: string, price: number) => void;
}

const PortfolioHoldingsTable = ({ holdings, onSell, onUpdatePrice }: PortfolioHoldingsTableProps) => {
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
            {holdings.map((holding) => {
              const isProfit = holding.floatingPnl >= 0;
              const pnlClass = isProfit ? 'text-secondary' : 'text-error';

              return (
                <tr key={holding.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-caps text-[10px]">{holding.code.substring(0, 2)}</div>
                      <div>
                        <p className="font-data-md text-data-md text-on-surface">{holding.code}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{holding.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-data-sm text-data-sm text-on-surface text-right">{formatRp(holding.buy_price)}</td>
                  <td className="px-6 py-4 font-data-sm text-data-sm text-on-surface text-right">{holding.lots}</td>
                  <td className="px-6 py-4 font-data-sm text-data-sm text-on-surface text-right">{formatRp(holding.totalModal)}</td>
                  <td className="px-6 py-4 font-data-sm text-data-sm text-on-surface text-right">
                    <div className="flex justify-end items-center gap-1 group/edit">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const newPrice = prompt('Update harga pasar:', String(holding.current_price));
                          if (newPrice && !isNaN(Number(newPrice))) {
                            onUpdatePrice?.(holding.id, Number(newPrice));
                          }
                        }}
                        className="material-symbols-outlined text-[14px] text-outline opacity-0 group-hover/edit:opacity-100 cursor-pointer"
                      >edit</button>
                      <span>{formatRp(holding.current_price)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className={`font-data-sm text-data-sm ${pnlClass}`}>{isProfit ? '+' : ''}{formatRp(holding.floatingPnl)}</p>
                    <p className={`font-data-sm text-[11px] ${pnlClass}`}>{isProfit ? '+' : ''}{holding.floatingPnlPercent}%</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onSell?.({ id: holding.id, code: holding.code, lots: holding.lots, buyPrice: holding.buy_price, currentPrice: holding.current_price })}
                      className="px-3 py-1.5 border border-outline-variant rounded font-label-caps text-label-caps text-on-surface hover:bg-error-container hover:text-on-error-container hover:border-error-container transition-colors"
                    >
                      Jual
                    </button>
                  </td>
                </tr>
              );
            })}
            {holdings.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-on-surface-variant">Belum ada holdings</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioHoldingsTable;
