interface RdnBalanceCardProps {
  onTopUp?: () => void;
  onWithdraw?: () => void;
}

const RdnBalanceCard = ({ onTopUp, onWithdraw }: RdnBalanceCardProps) => {
  return (
    <div className="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-outline" data-icon="account_balance">account_balance</span>
        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">RDN Balance</h3>
      </div>
      <div className="mb-6">
        <p className="font-data-lg text-data-lg text-on-surface">Rp 1.500.000</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Available for trading</p>
      </div>
      <div className="flex items-center gap-3 mt-auto">
        <button 
          onClick={onTopUp}
          className="flex-1 py-2 bg-primary-container text-on-primary border border-transparent rounded-lg font-label-caps text-label-caps hover:bg-opacity-90 transition-colors text-center"
        >
          Top-Up
        </button>
        <button 
          onClick={onWithdraw}
          className="flex-1 py-2 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg font-label-caps text-label-caps hover:bg-surface-container-low transition-colors text-center"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default RdnBalanceCard;
