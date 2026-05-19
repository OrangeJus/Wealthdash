import { formatRp } from '../hooks/useApi';
import type { SavingsHistoryRow } from '../types';

interface RolloverHistoryTableProps {
  history: SavingsHistoryRow[];
}

const RolloverHistoryTable = ({ history }: RolloverHistoryTableProps) => {
  const formatMonth = (period: string) => {
    const [y, m] = period.split('-');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-outline-variant">
        <h3 className="font-headline-md text-headline-md text-on-surface">Riwayat Rollover</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant">Bulan</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-right">Target</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-right">Tercapai</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-right">Defisit</th>
              <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-right">Kumulatif Rollover</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {history.map((row, idx) => (
              <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-3 font-body-sm">{formatMonth(row.month)}</td>
                <td className="px-6 py-3 font-data-sm text-right">{formatRp(row.target)}</td>
                <td className="px-6 py-3 font-data-sm text-right text-secondary">{formatRp(row.achieved)}</td>
                <td className={`px-6 py-3 font-data-sm text-right ${row.deficit > 0 ? 'text-error' : 'text-secondary'}`}>
                  {row.deficit > 0 ? formatRp(row.deficit) : '-'}
                </td>
                <td className={`px-6 py-3 font-data-sm text-right font-semibold ${row.carriedForward > 0 ? 'text-error' : 'text-on-surface'}`}>
                  {row.carriedForward > 0 ? formatRp(row.carriedForward) : '-'}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Belum ada riwayat</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolloverHistoryTable;
