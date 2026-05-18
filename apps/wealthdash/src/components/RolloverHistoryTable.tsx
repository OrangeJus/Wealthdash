const RolloverHistoryTable = () => {
  const historyData = [
    { month: 'April 2024', target: 'Rp 400.000', achieved: 'Rp 320.000', deficit: 'Rp 80.000', carriedForward: '-', deficitClass: 'text-error', cfClass: 'text-on-surface-variant' },
    { month: 'Maret 2024', target: 'Rp 300.000', achieved: 'Rp 200.000', deficit: 'Rp 100.000', carriedForward: '+ Rp 100.000', deficitClass: 'text-error', cfClass: 'text-secondary-container', bgClass: 'bg-surface-bright/50' },
    { month: 'Februari 2024', target: 'Rp 300.000', achieved: 'Rp 300.000', deficit: 'Rp 0', carriedForward: '-', deficitClass: 'text-on-surface-variant', cfClass: 'text-on-surface-variant' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h3 className="font-headline-md text-headline-md text-on-surface">Riwayat Rollover</h3>
        <button className="text-secondary font-label-caps text-label-caps hover:underline">Lihat Semua</button>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-variant">
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Bulan</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Target</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Tercapai</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Defisit</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Carried Forward</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {historyData.map((row, idx) => (
              <tr key={idx} className={`hover:bg-surface-container-lowest transition-colors ${row.bgClass || ''}`}>
                <td className="px-6 py-5 font-body-md text-body-md text-on-surface font-medium">{row.month}</td>
                <td className="px-6 py-5 font-data-md text-data-md text-on-surface text-right">{row.target}</td>
                <td className="px-6 py-5 font-data-md text-data-md text-on-surface text-right">{row.achieved}</td>
                <td className={`px-6 py-5 font-data-md text-data-md text-right ${row.deficitClass}`}>{row.deficit}</td>
                <td className={`px-6 py-5 font-data-md text-data-md text-right ${row.cfClass}`}>{row.carriedForward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolloverHistoryTable;
