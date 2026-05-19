import { formatRp } from '../hooks/useApi';

interface RdnBalanceCardProps {
  balance: number;
  onTopUp: () => void;
  onWithdraw: () => void;
}

const RdnBalanceCard = ({ balance, onTopUp, onWithdraw }: RdnBalanceCardProps) => {
  return (
    <div className="md:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
      <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Saldo RDN</h3>
      <p className="font-data-lg text-[28px] font-bold text-on-surface tracking-tight">{formatRp(balance)}</p>
      <div className="flex gap-3 mt-4">
        <button
          onClick={onTopUp}
          className="flex-1 py-2 border border-outline-variant rounded-lg font-label-caps text-label-caps text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">add</span> Top Up
        </button>
        <button
          onClick={onWithdraw}
          className="flex-1 py-2 border border-outline-variant rounded-lg font-label-caps text-label-caps text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">remove</span> Withdraw
        </button>
      </div>
    </div>
  );
};

export default RdnBalanceCard;
