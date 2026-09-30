import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  Tag, 
  CreditCard, 
  FileText, 
  Check, 
  Sparkles,
  Info,
  TrendingDown,
  TrendingUp,
  Receipt,
  PiggyBank,
  Settings2,
  Target,
  Edit3,
  Trash2
} from 'lucide-react';
import { 
  Expense, 
  TransactionFlow, 
  DebtDirection, 
  DebtStatus, 
  BASE_CATEGORIES_BY_FLOW, 
  PAYMENT_METHODS 
} from '../types/expense';
import { formatRupiahInput, parseRupiahInput, getTodayDateString, getCurrentTimeString } from '../utils/formatters';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  initialData?: Expense | null;
  availableScopes: string[];
  onAddScope: (newScope: string) => void;
  onEditScope?: (oldScope: string, newScope: string) => void;
  onDeleteScope?: (scopeToDelete: string) => void;
  onOpenManageScopes: () => void;
  customCategoriesByFlow?: Record<TransactionFlow, string[]>;
  onAddCustomCategory?: (flow: TransactionFlow, cat: string) => void;
  defaultFlowType?: TransactionFlow;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableScopes,
  onAddScope,
  onEditScope,
  onDeleteScope,
  onOpenManageScopes,
  customCategoriesByFlow,
  onAddCustomCategory,
  defaultFlowType = 'expense',
}) => {
  const [flowType, setFlowType] = useState<TransactionFlow>(defaultFlowType);
  const [title, setTitle] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [category, setCategory] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Pribadi']);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');

  // Utang / Piutang fields
  const [debtDirection, setDebtDirection] = useState<DebtDirection>('payable');
  const [debtContact, setDebtContact] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtStatus, setDebtStatus] = useState<DebtStatus>('unpaid');

  // Tabungan fields (Pernikahan, Umroh, Emas, dll.)
  const [savingAccount, setSavingAccount] = useState('');
  const [savingTargetDisplay, setSavingTargetDisplay] = useState('');

  // Custom Category Input state
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Scope Inline Management
  const [editingScopeInline, setEditingScopeInline] = useState<string | null>(null);
  const [inlineScopeName, setInlineScopeName] = useState('');
  const [showAddScopeInput, setShowAddScopeInput] = useState(false);
  const [newScopeInput, setNewScopeInput] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Compute available categories for current flow
  const currentCategories = React.useMemo(() => {
    const base = BASE_CATEGORIES_BY_FLOW[flowType] || [];
    const custom = customCategoriesByFlow?.[flowType] || [];
    return Array.from(new Set([...base, ...custom]));
  }, [flowType, customCategoriesByFlow]);

  // Sync category when flow changes
  useEffect(() => {
    if (!initialData || initialData.flowType !== flowType) {
      if (currentCategories.length > 0) {
        setCategory(currentCategories[0]);
      }
    }
    setIsAddingCustomCategory(false);
    setCustomCategoryInput('');
  }, [flowType, initialData, currentCategories]);

  useEffect(() => {
    if (initialData) {
      setFlowType(initialData.flowType || 'expense');
      setTitle(initialData.title);
      setAmountDisplay(new Intl.NumberFormat('id-ID').format(initialData.amount));
      setDate(initialData.date);
      setTime(initialData.time || getCurrentTimeString());
      setCategory(initialData.category);
      setSelectedTypes(initialData.types.length > 0 ? initialData.types : ['Pribadi']);
      setPaymentMethod(initialData.paymentMethod || PAYMENT_METHODS[0]);
      setNotes(initialData.notes || '');

      setDebtDirection(initialData.debtDirection || 'payable');
      setDebtContact(initialData.debtContact || '');
      setDebtDueDate(initialData.debtDueDate || '');
      setDebtStatus(initialData.debtStatus || 'unpaid');
      setSavingAccount(initialData.savingAccount || '');
      setSavingTargetDisplay(initialData.savingTargetAmount ? new Intl.NumberFormat('id-ID').format(initialData.savingTargetAmount) : '');
    } else {
      setFlowType(defaultFlowType);
      setTitle('');
      setAmountDisplay('');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      const defaultCats = BASE_CATEGORIES_BY_FLOW[defaultFlowType] || [];
      setCategory(defaultCats[0] || 'Lain-lain');
      setSelectedTypes(availableScopes.length > 0 ? [availableScopes[0]] : ['Pribadi']);
      setPaymentMethod(PAYMENT_METHODS[0]);
      setNotes('');
      setDebtDirection('payable');
      setDebtContact('');
      setDebtDueDate('');
      setDebtStatus('unpaid');
      setSavingAccount('');
      setSavingTargetDisplay('');
    }
    setErrorMsg('');
    setIsAddingCustomCategory(false);
    setCustomCategoryInput('');
    setShowAddScopeInput(false);
    setNewScopeInput('');
    setEditingScopeInline(null);
  }, [initialData, isOpen, defaultFlowType, availableScopes]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRupiahInput(e.target.value);
    setAmountDisplay(formatted);
  };

  const addQuickAmount = (increment: number) => {
    const current = parseRupiahInput(amountDisplay);
    const updated = current + increment;
    setAmountDisplay(new Intl.NumberFormat('id-ID').format(updated));
  };

  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== typeId));
      }
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handleSaveInlineScope = (oldScope: string) => {
    const clean = inlineScopeName.trim().replace(/^\++\s*/, '');
    if (!clean || clean === oldScope) {
      setEditingScopeInline(null);
      return;
    }
    onEditScope?.(oldScope, clean);
    // Update selected types
    setSelectedTypes(prev => prev.map(t => (t === oldScope ? clean : t)));
    setEditingScopeInline(null);
  };

  const handleDeleteInlineScope = (scopeToDelete: string) => {
    if (availableScopes.length <= 1) {
      setErrorMsg('Minimal harus ada 1 kalangan.');
      return;
    }
    onDeleteScope?.(scopeToDelete);
    setSelectedTypes(prev => prev.filter(t => t !== scopeToDelete));
    if (selectedTypes.length <= 1 && selectedTypes.includes(scopeToDelete)) {
      const remaining = availableScopes.filter(s => s !== scopeToDelete);
      if (remaining.length > 0) setSelectedTypes([remaining[0]]);
    }
  };

  const handleCreateNewScope = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newScopeInput.trim().replace(/^\++\s*/, '');
    if (!clean) return;
    if (availableScopes.some(s => s.toLowerCase() === clean.toLowerCase())) {
      if (!selectedTypes.includes(clean)) setSelectedTypes([...selectedTypes, clean]);
    } else {
      onAddScope(clean);
      setSelectedTypes([...selectedTypes, clean]);
    }
    setNewScopeInput('');
    setShowAddScopeInput(false);
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsAddingCustomCategory(true);
    } else {
      setCategory(val);
      setIsAddingCustomCategory(false);
    }
  };

  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customCategoryInput.trim().replace(/^\++\s*/, '');
    if (!clean) return;
    onAddCustomCategory?.(flowType, clean);
    setCategory(clean);
    setIsAddingCustomCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Harap masukkan keterangan transaksi');
      return;
    }

    const amount = parseRupiahInput(amountDisplay);
    if (amount <= 0) {
      setErrorMsg('Harap masukkan nominal yang valid');
      return;
    }

    if (selectedTypes.length === 0) {
      setErrorMsg('Pilih minimal satu kalangan / jenis');
      return;
    }

    const finalCategory = isAddingCustomCategory && customCategoryInput.trim() 
      ? customCategoryInput.trim() 
      : category;

    const savingTargetAmount = savingTargetDisplay ? parseRupiahInput(savingTargetDisplay) : undefined;

    onSave({
      flowType,
      title: title.trim(),
      amount,
      date,
      time,
      category: finalCategory,
      types: selectedTypes,
      paymentMethod,
      notes: notes.trim(),
      ...(flowType === 'debt' ? {
        debtDirection,
        debtContact: debtContact.trim(),
        debtDueDate,
        debtStatus,
      } : {}),
      ...(flowType === 'saving' ? {
        savingAccount: savingAccount.trim(),
        savingTargetAmount,
      } : {}),
    }, initialData ? initialData.id : undefined);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header with Title & Flow Type Selector */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {initialData ? 'Ubah Transaksi' : 'Catat Transaksi Keuangan'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Lengkap: Harian, Pernikahan, Umroh, Emas, Toko, hingga Kantor
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Flow Types Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-200/70 dark:bg-slate-950/80 rounded-2xl">
            {/* Pengeluaran */}
            <button
              type="button"
              onClick={() => setFlowType('expense')}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                flowType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </button>

            {/* Pemasukan */}
            <button
              type="button"
              onClick={() => setFlowType('income')}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                flowType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pemasukan</span>
            </button>

            {/* Utang & Piutang */}
            <button
              type="button"
              onClick={() => setFlowType('debt')}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                flowType === 'debt'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Utang/Piutang</span>
            </button>

            {/* Tabungan & Investasi */}
            <button
              type="button"
              onClick={() => setFlowType('saving')}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                flowType === 'saving'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-500'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Tabungan</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nominal Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Nominal {flowType === 'income' ? 'Pemasukan' : flowType === 'debt' ? 'Utang / Piutang' : flowType === 'saving' ? 'Tabungan / Investasi' : 'Pengeluaran'} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                Rp
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder="0"
                required
                className="w-full pl-12 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xl sm:text-2xl font-bold tracking-wide focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all"
                autoFocus={!initialData}
              />
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              <span className="text-[10px] text-slate-400 mr-0.5">Cepat:</span>
              {[
                { label: '+10rb', val: 10000 },
                { label: '+50rb', val: 50000 },
                { label: '+100rb', val: 100000 },
                { label: '+500rb', val: 500000 },
                { label: '+1jt', val: 1000000 },
                { label: '+5jt', val: 5000000 },
              ].map(btn => (
                <button
                  type="button"
                  key={btn.label}
                  onClick={() => addQuickAmount(btn.val)}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keterangan Transaksi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Keterangan Transaksi *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                flowType === 'income' 
                  ? 'Contoh: Amplop kondangan nikahan, Gaji, Omset toko...'
                  : flowType === 'debt'
                  ? 'Contoh: Sewa gedung nikah tempo, Kulakan beras toko...'
                  : flowType === 'saving'
                  ? 'Contoh: Tabungan paket Umroh, Beli emas Antam 5gr, Tabungan resepsi...'
                  : 'Contoh: Catering syukuran, Kulakan stok, Belanja harian...'
              }
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* CRITICAL REQUIREMENT: Kalangan / Jenis Section with EDIT, HAPUS & TAMBAH */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                Kalangan / Jenis (Bisa 2 atau Lebih) *
              </label>

              {/* Tombol Kelola Kalangan (Edit & Hapus) */}
              <button
                type="button"
                onClick={onOpenManageScopes}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                title="Buka panel kelola, edit nama dan hapus kalangan"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Edit / Hapus Kalangan</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pribadi, Pelajar, Toko, UMKM, Kantor, Pernikahan, Syukuran, dll.
            </p>

            {/* Scope Chips with Select, Inline Edit & Delete */}
            <div className="flex flex-wrap gap-1.5">
              {availableScopes.map(scopeName => {
                const isSelected = selectedTypes.includes(scopeName);
                const isEditingThis = editingScopeInline === scopeName;

                if (isEditingThis) {
                  return (
                    <div key={scopeName} className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-xl p-1">
                      <input
                        type="text"
                        value={inlineScopeName}
                        onChange={(e) => setInlineScopeName(e.target.value)}
                        className="px-2 py-0.5 text-xs text-slate-900 dark:text-white w-28 focus:outline-hidden"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveInlineScope(scopeName)}
                        className="p-1 bg-emerald-600 text-white rounded-md text-[10px]"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingScopeInline(null)}
                        className="p-1 text-slate-400 text-[10px]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={scopeName}
                    className={`group relative flex items-center rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleType(scopeName)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer"
                    >
                      <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border text-[9px] ${
                        isSelected ? 'bg-white text-emerald-600 border-transparent' : 'border-slate-400 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-3" />}
                      </div>
                      <span>{scopeName}</span>
                    </button>

                    {/* Quick Edit & Delete icons on hover/focus */}
                    <div className="pr-1 flex items-center opacity-70 hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingScopeInline(scopeName);
                          setInlineScopeName(scopeName);
                        }}
                        className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${isSelected ? 'text-white' : 'text-slate-400'}`}
                        title={`Ubah nama kalangan "${scopeName}"`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInlineScope(scopeName);
                        }}
                        className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${isSelected ? 'text-white' : 'text-slate-400 hover:text-rose-500'}`}
                        title={`Hapus kalangan "${scopeName}"`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Tambah Kalangan Baru inline */}
              {!showAddScopeInput ? (
                <button
                  type="button"
                  onClick={() => setShowAddScopeInput(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kalangan</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 w-full sm:w-auto mt-1">
                  <input
                    type="text"
                    value={newScopeInput}
                    onChange={(e) => setNewScopeInput(e.target.value)}
                    placeholder="Nama kalangan (e.g. Pernikahan/Umroh)"
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewScope}
                    className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddScopeInput(false); setNewScopeInput(''); }}
                    className="px-2 py-1 text-xs text-slate-400 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CRITICAL REQUIREMENT: Pilihan Kategori dengan Opsi Tambah Spesifik / Lainnya */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Kategori {flowType === 'saving' ? 'Tabungan / Investasi' : ''}
              </label>
              {!isAddingCustomCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(true)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Kategori Spesifik</span>
                </button>
              )}
            </div>

            {!isAddingCustomCategory ? (
              <select
                value={category}
                onChange={handleCategorySelectChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
              >
                {currentCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">Tambah Kategori Spesifik Lainnya...</option>
              </select>
            ) : (
              /* Custom Specific Category Input Field */
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                  Tulis Kategori Spesifik (Contoh: Tabungan Pernikahan, Paket Umroh, Emas Antam, Syukuran Aqiqah):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Ketik kategori spesifik Anda..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-emerald-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomCategory}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Gunakan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustomCategory(false);
                      setCustomCategoryInput('');
                    }}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {/* Popular Specific Presets */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 block w-full">Pilihan Cepat:</span>
                  {[
                    'Tabungan Umroh & Haji',
                    'Tabungan Pernikahan',
                    'Tabungan Beli Emas Antam',
                    'Syukuran & Qurban',
                    'Investasi Saham / Reksadana',
                    'Dana Darurat Keluarga',
                    'DP Rumah / Properti',
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        onAddCustomCategory?.(flowType, preset);
                        setCategory(preset);
                        setIsAddingCustomCategory(false);
                      }}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CRITICAL REQUIREMENT: Spesifikasi Khusus Tabungan & Investasi */}
          {flowType === 'saving' && (
            <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 space-y-2.5">
              <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-cyan-600" />
                Rincian Akun & Target Tabungan Spesifik
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Wadah / Akun Tabungan
                  </label>
                  <input
                    type="text"
                    value={savingAccount}
                    onChange={(e) => setSavingAccount(e.target.value)}
                    placeholder="Contoh: BSI Tabungan Haji, Brankas Emas, BCA..."
                    className="w-full px-3 py-1.5 rounded-lg border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-cyan-600" />
                    Target Impian (Opsional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-[11px] text-slate-400">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={savingTargetDisplay}
                      onChange={(e) => setSavingTargetDisplay(formatRupiahInput(e.target.value))}
                      placeholder="Contoh: 50.000.000"
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rincian Utang & Piutang */}
          {flowType === 'debt' && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2.5">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                Rincian Utang / Piutang
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDebtDirection('payable')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    debtDirection === 'payable'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  🔴 Utang (Kewajiban Saya)
                </button>
                <button
                  type="button"
                  onClick={() => setDebtDirection('receivable')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    debtDirection === 'receivable'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  🔵 Piutang (Tagihan Saya)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Nama Pihak / Kontak / Vendor
                  </label>
                  <input
                    type="text"
                    value={debtContact}
                    onChange={(e) => setDebtContact(e.target.value)}
                    placeholder="Contoh: Vendor Catering / Toko Grosir"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Jatuh Tempo (Opsional)
                  </label>
                  <input
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Status Pembayaran:</span>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="debtStatus"
                    value="unpaid"
                    checked={debtStatus === 'unpaid'}
                    onChange={() => setDebtStatus('unpaid')}
                  />
                  <span>Belum Lunas</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="debtStatus"
                    value="paid"
                    checked={debtStatus === 'paid'}
                    onChange={() => setDebtStatus('paid')}
                  />
                  <span>Sudah Lunas</span>
                </label>
              </div>
            </div>
          )}

          {/* Metode Pembayaran & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Tanggal & Jam
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-24 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Catatan / No. Bukti / Nota (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan, rincian barang, kuitansi, atau doa harapan tabungan..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Catat & Sinkronkan'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
