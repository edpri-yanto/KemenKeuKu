import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  PiggyBank, 
  User, 
  GraduationCap, 
  Store, 
  Briefcase, 
  Building2,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Expense } from '../types/expense';
import { formatRupiah, getTodayDateString } from '../utils/formatters';

interface SummaryCardsProps {
  expenses: Expense[];
  availableScopes?: string[];
  onSelectTypeFilter?: (type: string) => void;
  activeTypeFilter?: string[];
  activeFlowTab?: string;
  onSelectFlowTab?: (flow: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  expenses,
  availableScopes = ['Pribadi', 'Pelajar / Mahasiswa', 'Pedagang / Toko', 'UMKM / Bisnis', 'Kantor'],
  onSelectTypeFilter,
  activeTypeFilter = [],
  activeFlowTab = 'all',
  onSelectFlowTab,
}) => {
  const todayStr = getTodayDateString();

  // Financial aggregates
  let totalIncome = 0;
  let totalExpense = 0;
  let totalPayableDebt = 0; // Utang saya yang belum lunas
  let totalReceivableDebt = 0; // Piutang orang lain yang belum tertagih
  let totalSavings = 0;

  // Today aggregates
  let todayExpense = 0;
  let todayIncome = 0;

  // Segment totals
  const scopeTotals: Record<string, { total: number; count: number }> = {
    'Pribadi': { total: 0, count: 0 },
    'Pelajar / Mahasiswa': { total: 0, count: 0 },
    'Pedagang / Toko': { total: 0, count: 0 },
    'UMKM / Bisnis': { total: 0, count: 0 },
    'Kantor': { total: 0, count: 0 },
  };

  expenses.forEach(e => {
    const flow = e.flowType || 'expense';

    if (flow === 'income') {
      totalIncome += e.amount;
      if (e.date === todayStr) todayIncome += e.amount;
    } else if (flow === 'expense') {
      totalExpense += e.amount;
      if (e.date === todayStr) todayExpense += e.amount;
    } else if (flow === 'debt') {
      if (e.debtStatus !== 'paid') {
        if (e.debtDirection === 'payable') {
          totalPayableDebt += e.amount;
        } else {
          totalReceivableDebt += e.amount;
        }
      }
    } else if (flow === 'saving') {
      totalSavings += e.amount;
    }

    // Tally scopes
    e.types.forEach(t => {
      if (!scopeTotals[t]) {
        scopeTotals[t] = { total: 0, count: 0 };
      }
      scopeTotals[t].total += e.amount;
      scopeTotals[t].count += 1;
    });
  });

  const netBalance = totalIncome - totalExpense;

  const getScopeIcon = (type: string) => {
    switch (type) {
      case 'Pribadi':
        return <User className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Pelajar / Mahasiswa':
        return <GraduationCap className="w-3.5 h-3.5 text-cyan-500" />;
      case 'Pedagang / Toko':
        return <Store className="w-3.5 h-3.5 text-purple-500" />;
      case 'UMKM / Bisnis':
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case 'Kantor':
        return <Building2 className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-3.5">
      
      {/* Primary Financial Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* 1. Saldo Bersih (Net Cash Flow) */}
        <div 
          onClick={() => onSelectFlowTab?.('all')}
          className={`p-3.5 sm:p-4 rounded-3xl border transition-all cursor-pointer ${
            activeFlowTab === 'all'
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/15 border-transparent'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
              activeFlowTab === 'all' ? 'text-emerald-100' : 'text-slate-400'
            }`}>
              <Wallet className="w-3.5 h-3.5" />
              Saldo Bersih
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              activeFlowTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              Kas
            </span>
          </div>

          <div className="mt-2.5">
            <h3 className="text-base sm:text-xl font-black tracking-tight truncate">
              {formatRupiah(netBalance)}
            </h3>
            <p className={`text-[10px] sm:text-[11px] mt-0.5 truncate ${
              activeFlowTab === 'all' ? 'text-emerald-100/90' : 'text-slate-400'
            }`}>
              Pemasukan - Pengeluaran
            </p>
          </div>
        </div>

        {/* 2. Total Pemasukan */}
        <div 
          onClick={() => onSelectFlowTab?.('income')}
          className={`p-3.5 sm:p-4 rounded-3xl border transition-all cursor-pointer ${
            activeFlowTab === 'income'
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Total Pemasukan
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          </div>

          <div className="mt-2.5">
            <h3 className="text-base sm:text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
              +{formatRupiah(totalIncome)}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              Hari ini: +{formatRupiah(todayIncome)}
            </p>
          </div>
        </div>

        {/* 3. Total Pengeluaran */}
        <div 
          onClick={() => onSelectFlowTab?.('expense')}
          className={`p-3.5 sm:p-4 rounded-3xl border transition-all cursor-pointer ${
            activeFlowTab === 'expense'
              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Total Pengeluaran
            </span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          </div>

          <div className="mt-2.5">
            <h3 className="text-base sm:text-xl font-black tracking-tight text-rose-600 dark:text-rose-400 truncate">
              -{formatRupiah(totalExpense)}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              Hari ini: -{formatRupiah(todayExpense)}
            </p>
          </div>
        </div>

        {/* 4. Utang & Tabungan */}
        <div 
          onClick={() => onSelectFlowTab?.('debt')}
          className={`p-3.5 sm:p-4 rounded-3xl border transition-all cursor-pointer ${
            activeFlowTab === 'debt' || activeFlowTab === 'saving'
              ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" />
              Utang & Tabungan
            </span>
            <PiggyBank className="w-3.5 h-3.5 text-cyan-500" />
          </div>

          <div className="mt-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
              <span className="text-amber-600 dark:text-amber-400 truncate text-[11px] sm:text-xs">
                Utang: {formatRupiah(totalPayableDebt)}
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 truncate text-[11px] sm:text-xs">
                Tab: {formatRupiah(totalSavings)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              Piutang Tertagih: {formatRupiah(totalReceivableDebt)}
            </p>
          </div>
        </div>

      </div>

      {/* Scope Segment Breakdown for All Walks of Life */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            Cakupan Kalangan Pengguna (Klik untuk memfilter)
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Multi-Pilihan didukung
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {availableScopes.map((type) => {
            const data = scopeTotals[type] || { total: 0, count: 0 };
            const isFiltered = activeTypeFilter.includes(type);

            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectTypeFilter?.(type)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isFiltered
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getScopeIcon(type)}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {type}
                    </span>
                  </div>
                  {isFiltered && (
                    <span className="text-[10px] font-black text-emerald-600">✓</span>
                  )}
                </div>

                <div className="mt-1.5">
                  <span className="block text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {formatRupiah(data.total)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {data.count} trx
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
