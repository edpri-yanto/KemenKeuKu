import React from 'react';
import { 
  Search, 
  Calendar, 
  X, 
  Tag, 
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Receipt,
  PiggyBank,
  Layers
} from 'lucide-react';
import { TransactionFlow, CATEGORIES_BY_FLOW } from '../types/expense';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  onClearTypes: () => void;
  availableTypes: string[];
  onOpenManageScopes?: () => void;
  flowFilter: 'all' | TransactionFlow;
  onFlowFilterChange: (flow: 'all' | TransactionFlow) => void;
  datePreset: 'today' | 'last7' | 'thisMonth' | 'all' | 'custom';
  onDatePresetChange: (preset: 'today' | 'last7' | 'thisMonth' | 'all' | 'custom') => void;
  customStartDate: string;
  onCustomStartDateChange: (d: string) => void;
  customEndDate: string;
  onCustomEndDateChange: (d: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTypes,
  onToggleType,
  onClearTypes,
  availableTypes,
  onOpenManageScopes,
  flowFilter,
  onFlowFilterChange,
  datePreset,
  onDatePresetChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  selectedCategory,
  onCategoryChange,
  totalFilteredCount,
}) => {
  const isTypeFilterActive = selectedTypes.length > 0;
  const isAnyFilterActive = isTypeFilterActive || searchQuery || selectedCategory || datePreset !== 'all' || flowFilter !== 'all';

  const resetAllFilters = () => {
    onClearTypes();
    onSearchChange('');
    onCategoryChange('');
    onFlowFilterChange('all');
    onDatePresetChange('all');
  };

  // Get categories relevant to flow
  const currentCategories: string[] = flowFilter !== 'all' 
    ? (CATEGORIES_BY_FLOW[flowFilter] || [])
    : Array.from(new Set(Object.values(CATEGORIES_BY_FLOW).flat()));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-5 shadow-xs space-y-3.5">
      
      {/* 1. Transaction Flow Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Semua Transaksi', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'expense', label: 'Pengeluaran', icon: <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> },
          { id: 'income', label: 'Pemasukan', icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
          { id: 'debt', label: 'Utang / Piutang', icon: <Receipt className="w-3.5 h-3.5 text-amber-500" /> },
          { id: 'saving', label: 'Tabungan & Investasi', icon: <PiggyBank className="w-3.5 h-3.5 text-cyan-500" /> },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onFlowFilterChange(item.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              flowFilter === item.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 2. Search & Date Presets */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari transaksi, toko, nota, kontak, atau catatan..."
            className="w-full pl-10 pr-9 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date presets */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:inline ml-1" />
          {[
            { id: 'all', label: 'Semua' },
            { id: 'today', label: 'Hari Ini' },
            { id: 'last7', label: '7 Hari' },
            { id: 'thisMonth', label: 'Bulan Ini' },
            { id: 'custom', label: 'Kustom' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => onDatePresetChange(p.id as any)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                datePreset === p.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Category selector */}
        <div className="shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">Semua Kategori</option>
            {currentCategories.map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {datePreset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Rentang Tanggal:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs"
            />
          </div>
        </div>
      )}

      {/* 3. Multi-Scope Kalangan Filter */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 mr-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-500" />
              Kalangan:
            </span>
            {onOpenManageScopes && (
              <button
                type="button"
                onClick={onOpenManageScopes}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                title="Kelola, Ubah Nama & Hapus Kalangan"
              >
                (Kelola)
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClearTypes}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedTypes.length === 0
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>

          {availableTypes.map(t => {
            const isSelected = selectedTypes.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => onToggleType(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {t}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 text-xs ml-auto">
          <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
            Total: <strong className="text-slate-900 dark:text-white">{totalFilteredCount}</strong> data
          </span>

          {isAnyFilterActive && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
