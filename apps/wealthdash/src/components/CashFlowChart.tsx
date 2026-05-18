

const CashFlowChart = () => {
  return (
    <div className="col-span-1 md:col-span-7 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-headline-md text-on-surface">Cash Flow</h3>
        <select className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm text-body-sm text-on-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary outline-none">
          <option>This Year</option>
          <option>Last 6 Months</option>
        </select>
      </div>
      <div className="flex-1 relative min-h-[240px] w-full flex items-end justify-between px-2 pt-8 pb-4 border-b border-l border-surface-variant">
        {/* Abstract Line Chart Representation */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAyMDBDMTAwIDE1MCAyMDAgMjUwIDMwMCAxMDBDMzUwIDUwIDQwMCAxMDAgNTAwIDUwQzYwMCAwIDcwMCAxNTAgODAwIDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM0I4MkY2IiBzdHJva2Utd2lkdGg9IjMiLz4KPHBhdGggZD0iTTAgMjUwQzEwMCAyMjAgMjAwIDI4MCAzMDAgMTgwQzM1MCAxMzAgNDAwIDE4MCA1MDAgMTUwQzYwMCAxMjAgNzAwIDI1MCA4MDAgMjAwIiBmaWxsPSJub25lIiBzdHJva2U9IiNFRjQ0NDQiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0Ii8+Cjwvc3ZnPg==')] bg-no-repeat bg-bottom bg-cover opacity-50 pointer-events-none"></div>
        {/* Axis Labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-on-surface-variant font-data-sm translate-y-6">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
        </div>
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant font-data-sm -translate-x-8 text-right w-6">
          <span>10M</span><span>5M</span><span>0</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 mt-8">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary"></div><span className="font-body-sm text-body-sm">Income</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-dashed border-[#ef4444]"></div><span className="font-body-sm text-body-sm">Expenses</span></div>
      </div>
    </div>
  );
};

export default CashFlowChart;
