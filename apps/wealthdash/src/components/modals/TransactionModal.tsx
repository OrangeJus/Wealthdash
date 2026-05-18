import { useState, useEffect as import_react_useEffect } from 'react';
import ModalOverlay from './ModalOverlay';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'income' | 'expense' | 'transfer';
  editMode?: boolean;
  initialData?: any;
}

const TransactionModal = ({ isOpen, onClose, defaultTab = 'expense', editMode = false, initialData }: TransactionModalProps) => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'transfer'>(defaultTab);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [wallet, setWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [note, setNote] = useState('');

  // Effect to populate data when editing
  import_react_useEffect(() => {
    if (editMode && initialData && isOpen) {
      setActiveTab(initialData.type || 'expense');
      // For dummy data, convert '24 Okt 2023' or similar to YYYY-MM-DD roughly. In real app, date is YYYY-MM-DD
      setDate(new Date().toISOString().split('T')[0]); 
      setAmount(initialData.amount ? initialData.amount.replace(/[^0-9]/g, '') : '');
      setCategory(initialData.category ? initialData.category.toLowerCase() : '');
      setWallet('bca'); // Mock
      setNote(initialData.desc || '');
    } else if (isOpen) {
      setActiveTab(defaultTab);
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setCategory('');
      setWallet('');
      setToWallet('');
      setNote('');
    }
  }, [editMode, initialData, isOpen, defaultTab]);

  // Reset state when closing
  const handleClose = () => {
    setAmount('');
    setCategory('');
    setWallet('');
    setToWallet('');
    setNote('');
    onClose();
  };

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
              type="number" 
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md"
            />
          </div>
        </div>

        {/* Category Field (Only for Income & Expense) */}
        {activeTab !== 'transfer' && (
          <div>
            <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Kategori</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
            >
              <option value="" disabled>Pilih Kategori</option>
              {activeTab === 'expense' ? (
                <>
                  <option value="makanan">Makanan</option>
                  <option value="transport">Transport</option>
                  <option value="belanja">Belanja</option>
                  <option value="hiburan">Hiburan</option>
                </>
              ) : (
                <>
                  <option value="gaji">Gaji</option>
                  <option value="freelance">Freelance</option>
                  <option value="bonus">Bonus</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Wallet Fields */}
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">
            {activeTab === 'income' ? 'Masuk ke Dompet' : activeTab === 'expense' ? 'Bayar dari Dompet' : 'Dari Dompet'}
          </label>
          <select 
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
          >
            <option value="" disabled>Pilih Dompet</option>
            <option value="gopay">GoPay</option>
            <option value="ovo">OVO</option>
            <option value="bca">BCA</option>
            <option value="cash">Cash</option>
          </select>
          
          {activeTab === 'expense' && wallet === 'gopay' && (
            <p className="mt-1.5 text-[13px] text-[#b45309] bg-[#fef3c7] p-2 rounded flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Saldo GoPay saat ini: Rp 350.000
            </p>
          )}
        </div>

        {/* Transfer To Wallet */}
        {activeTab === 'transfer' && (
          <div>
            <label className="block font-body-sm text-body-sm text-on-surface-variant mb-1.5">Ke Dompet</label>
            <select 
              value={toWallet}
              onChange={(e) => setToWallet(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-on-surface text-body-md appearance-none"
            >
              <option value="" disabled>Pilih Dompet Tujuan</option>
              <option value="gopay">GoPay</option>
              <option value="ovo">OVO</option>
              <option value="bca">BCA</option>
              <option value="cash">Cash</option>
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
          className={`w-full py-3.5 rounded-lg font-label-caps text-[14px] flex items-center justify-center gap-2 mt-4 transition-opacity hover:opacity-90 shadow-sm
            ${activeTab === 'income' ? 'bg-[#166534] text-white' : 
              activeTab === 'expense' ? 'bg-[#991b1b] text-white' : 
              'bg-[#3730a3] text-white'
            }
          `}
          onClick={handleClose}
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Simpan {activeTab === 'income' ? 'Pemasukan' : activeTab === 'expense' ? 'Pengeluaran' : 'Transfer'}
        </button>

      </div>
    </ModalOverlay>
  );
};

export default TransactionModal;
