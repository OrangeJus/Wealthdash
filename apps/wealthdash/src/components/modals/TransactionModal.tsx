import { useState, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import { useApi, formatNumberString, parseNumberString } from '../../hooks/useApi';
import { walletsApi, categoriesApi, transactionsApi } from '../../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'income' | 'expense' | 'transfer';
  editMode?: boolean;
  initialData?: any;
  onSaved?: () => void;
}

const TransactionModal = ({ isOpen, onClose, defaultTab = 'expense', editMode = false, initialData, onSaved }: TransactionModalProps) => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'transfer'>(defaultTab);
  const [saving, setSaving] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [note, setNote] = useState('');

  // Fetch wallets and categories from API
  const { data: walletsData } = useApi(() => walletsApi.list(), [isOpen]);
  const { data: categoriesData } = useApi(() => categoriesApi.list(), [isOpen]);

  const wallets = walletsData?.wallets || [];
  const expenseCategories = categoriesData?.expense || [];
  const incomeCategories = categoriesData?.income || [];

  // Effect to populate data when editing
  useEffect(() => {
    if (editMode && initialData && isOpen) {
      setActiveTab(initialData.type || 'expense');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setAmount(formatNumberString(initialData.amount));
      setCategoryId(initialData.category_id || '');
      setWalletId(initialData.wallet_id || '');
      setToWalletId(initialData.to_wallet_id || '');
      setNote(initialData.note || '');
    } else if (isOpen) {
      setActiveTab(defaultTab);
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setCategoryId('');
      setWalletId('');
      setToWalletId('');
      setNote('');
    }
  }, [editMode, initialData, isOpen, defaultTab]);

  const handleClose = () => {
    setAmount('');
    setCategoryId('');
    setWalletId('');
    setToWalletId('');
    setNote('');
    onClose();
  };

  const handleSave = async () => {
    if (!amount || !walletId) {
      alert('Nominal dan Dompet harus diisi');
      return;
    }
    if (activeTab !== 'transfer' && !categoryId) {
      alert('Kategori harus dipilih');
      return;
    }
    if (activeTab === 'transfer' && !toWalletId) {
      alert('Dompet tujuan harus dipilih');
      return;
    }

    setSaving(true);
    try {
      const data = {
        date,
        type: activeTab,
        amount: parseNumberString(amount),
        category_id: activeTab !== 'transfer' ? categoryId : null,
        wallet_id: walletId,
        to_wallet_id: activeTab === 'transfer' ? toWalletId : null,
        note: note || undefined,
      };

      if (editMode && initialData?.id) {
        await transactionsApi.update(initialData.id, data);
      } else {
        await transactionsApi.create(data);
      }

      handleClose();
      onSaved?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Find selected wallet balance for helper text
  const selectedWallet = wallets.find(w => w.id === walletId);

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose} title={editMode ? "Edit Transaksi" : "Tambah Transaksi"} width="max-w-lg">
      
      {/* Tabs */}
      <div className="flex bg-surface-container-low p-1 rounded-lg mb-6">
        <button 
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 font-label-caps text-[13px] rounded-md transition-all ${activeTab === 'income' ? 'bg-[#dcfce7] text-[#166534] shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Income
        </button>
        <button 
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 font-label-caps text-[13px] rounded-md transition-all ${activeTab === 'expense' ? 'bg-[#fee2e2] text-[#991b1b] shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Expense
        </button>
        <button 
          onClick={() => setActiveTab('transfer')}
          className={`flex-1 py-2 font-label-caps text-[13px] rounded-md transition-all ${activeTab === 'transfer' ? 'bg-[#e0e7ff] text-[#3730a3] shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Transfer
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* Date Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Tanggal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[18px]">calendar_today</span>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
            />
          </div>
        </div>

        {/* Amount Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Nominal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
            <input 
              type="text" 
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(formatNumberString(e.target.value))}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
            />
          </div>
        </div>

        {/* Category Field (Only for Income & Expense) */}
        {activeTab !== 'transfer' && (
          <div>
            <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Kategori</label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
            >
              <option value="" disabled>Pilih Kategori</option>
              {(activeTab === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Wallet Fields */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">
            {activeTab === 'income' ? 'Masuk ke Dompet' : activeTab === 'expense' ? 'Bayar dari Dompet' : 'Dari Dompet'}
          </label>
          <select 
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
          >
            <option value="" disabled>Pilih Dompet</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name} — Rp {w.balance.toLocaleString('id-ID')}</option>
            ))}
          </select>
          
          {activeTab === 'expense' && selectedWallet && (
            <p className="mt-1.5 text-[13px] text-[#b45309] bg-[#fef3c7] p-2 rounded flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
              Saldo saat ini: Rp {selectedWallet.balance.toLocaleString('id-ID')}
            </p>
          )}
        </div>

        {/* Transfer To Wallet */}
        {activeTab === 'transfer' && (
          <div>
            <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Ke Dompet</label>
            <select 
              value={toWalletId}
              onChange={(e) => setToWalletId(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
            >
              <option value="" disabled>Pilih Dompet Tujuan</option>
              {wallets.filter(w => w.id !== walletId).map(w => (
                <option key={w.id} value={w.id}>{w.name} — Rp {w.balance.toLocaleString('id-ID')}</option>
              ))}
            </select>
            
            <p className="mt-2 text-[13px] text-on-surface-variant flex items-center gap-1.5 bg-surface-container-low p-2 rounded">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Transfer tidak mengubah Net Worth
            </p>
          </div>
        )}

        {/* Note Field */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Keterangan</label>
          <input 
            type="text" 
            placeholder="Opsional"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
          />
        </div>

        {/* Action Button */}
        <button 
          className={`w-full py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 mt-4 transition-opacity hover:opacity-90 shadow-sm disabled:opacity-50
            ${activeTab === 'income' ? 'bg-[#166534] text-white' : 
              activeTab === 'expense' ? 'bg-[#991b1b] text-white' : 
              'bg-[#3730a3] text-white'
            }
          `}
          onClick={handleSave}
          disabled={saving}
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? 'Menyimpan...' : `Simpan ${activeTab === 'income' ? 'Pemasukan' : activeTab === 'expense' ? 'Pengeluaran' : 'Transfer'}`}
        </button>

      </div>
    </ModalOverlay>
  );
};

export default TransactionModal;
