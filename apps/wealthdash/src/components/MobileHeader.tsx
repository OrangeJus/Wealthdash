

const MobileHeader = () => {
  return (
    <header className="md:hidden flex justify-between items-center px-margin-mobile h-[56px] w-full z-40 bg-surface border-b border-outline-variant sticky top-0 shrink-0">
      <h1 className="font-headline-md text-headline-md font-bold text-primary">WealthDash</h1>
      <button className="bg-secondary text-on-secondary px-3 py-1.5 rounded-lg font-label-caps text-label-caps flex items-center gap-1 shadow-sm active:scale-95 transition-transform">
        <span className="material-symbols-outlined text-[16px]">add</span>
        Transaksi
      </button>
    </header>
  );
};

export default MobileHeader;
