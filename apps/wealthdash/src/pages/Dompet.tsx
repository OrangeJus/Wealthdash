import { useState } from 'react';
import { useApi, formatRp } from '../hooks/useApi';
import { walletsApi, analyticsApi } from '../services/api';
import type { Wallet } from '../types';
import WalletCard from '../components/WalletCard';
import WalletFormModal from '../components/modals/WalletFormModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DompetProps {
  onSelectWallet: (id: string) => void;
}

const Dompet = ({ onSelectWallet }: DompetProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const { data: walletsData, refetch } = useApi(() => walletsApi.list(), []);
  const { data: allocation } = useApi(() => analyticsApi.assetAllocation(), []);

  const handleOpenAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wallet: Wallet) => {
    setEditData(wallet);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editData) {
        await walletsApi.update(editData.id, data);
      } else {
        await walletsApi.create(data);
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dompet ini?')) return;
    try {
      await walletsApi.delete(id);
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const wallets = walletsData?.wallets || [];
  const totalBalance = walletsData?.totalBalance || 0;

  // Compute change from last month (simplified — using totals)
  const iconBgMap: Record<string, string> = { liquid: 'bg-secondary-fixed', savings: 'bg-tertiary-fixed', investment: 'bg-primary-fixed' };
  const iconTextMap: Record<string, string> = { liquid: 'text-on-secondary-fixed', savings: 'text-on-tertiary-fixed', investment: 'text-on-primary-fixed' };
  const badgeBgMap: Record<string, string> = { liquid: 'bg-surface-variant', savings: 'bg-tertiary-fixed', investment: 'bg-primary-fixed' };
  const badgeTextMap: Record<string, string> = { liquid: 'text-on-surface-variant', savings: 'text-on-tertiary-fixed', investment: 'text-on-primary-fixed' };
  const badgeLabelMap: Record<string, string> = { liquid: 'Liquid', savings: 'Savings', investment: 'Investment' };

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
      <div className="max-w-container-max-width mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface">Dompet Saya</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage your liquid assets, savings, and investment accounts.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant transition-colors rounded-lg px-4 py-3 font-label-caps text-label-caps flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Tambah Dompet
          </button>
        </div>

        {/* Wallet Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-8 justify-between items-center shadow-sm">
          <div className="flex-1 w-full">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Total Kekayaan Bersih</h3>
            <p className="font-display-lg text-[32px] md:text-[40px] font-bold text-on-surface tracking-tight">{formatRp(totalBalance)}</p>
          </div>
          
          <div className="w-full md:w-[320px] flex flex-col gap-4 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-6 md:pt-0 md:pl-8">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Komposisi Aset</h4>
            
            <div className="relative flex-1 min-h-[160px] flex items-center justify-center">
              {allocation && allocation.allocation.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={allocation.allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="total"
                        stroke="none"
                      >
                        {allocation.allocation.map((item: any, index: number) => {
                          const colors: Record<string, string> = {
                            liquid: '#0284c7', // Blue
                            savings: '#f59e0b', // Yellow
                            investment: '#10b981', // Green
                          };
                          return <Cell key={`cell-${index}`} fill={colors[item.cluster] || '#94a3b8'} />;
                        })}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-surface-container-lowest border border-outline-variant p-2 rounded-lg shadow-md font-body-sm flex flex-col gap-1 z-50">
                                <p className="font-semibold" style={{ color: payload[0].payload.fill }}>{badgeLabelMap[data.cluster] || data.cluster}</p>
                                <p className="text-on-surface">{formatRp(data.total)}</p>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-display-md text-xl font-bold text-on-surface">{allocation.allocation.length}</span>
                    <span className="font-label-caps text-[9px] text-on-surface-variant uppercase">Classes</span>
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-on-surface-variant text-center w-full">Belum ada data komposisi aset.</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2 mt-1">
              {(allocation?.allocation || []).map(item => {
                const colors: Record<string, string> = {
                  liquid: '#0284c7', // Blue
                  savings: '#f59e0b', // Yellow
                  investment: '#10b981', // Green
                };
                return (
                  <div key={item.cluster} className="flex justify-between items-center font-body-sm text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[item.cluster] || '#94a3b8' }}></div> 
                      <span className="text-on-surface">{badgeLabelMap[item.cluster] || item.cluster}</span>
                    </div>
                    <span className="font-semibold text-[13px] text-on-surface">{parseFloat(item.percentage as any).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid of Wallets */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {wallets.map(wallet => (
            <WalletCard 
              key={wallet.id}
              icon={wallet.icon}
              name={wallet.name}
              typeBadge={badgeLabelMap[wallet.cluster] || wallet.cluster}
              amount={formatRp(wallet.balance)}
              iconBgClass={iconBgMap[wallet.cluster] || 'bg-surface-container'}
              iconTextClass={iconTextMap[wallet.cluster] || 'text-on-surface-variant'}
              badgeBgClass={badgeBgMap[wallet.cluster] || 'bg-surface-variant'}
              badgeTextClass={badgeTextMap[wallet.cluster] || 'text-on-surface-variant'}
              logoUrl={wallet.logo_path || undefined}
              onEdit={() => handleOpenEdit(wallet)}
              onClick={() => onSelectWallet(wallet.id)}
            />
          ))}
        </div>
      </div>
      
      <WalletFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editMode={!!editData}
        initialData={editData}
        onSave={handleSave}
        onDelete={editData ? () => handleDelete(editData.id) : undefined}
      />
    </div>
  );
};

export default Dompet;
