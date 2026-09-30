import React from 'react';
import { 
  BarChart3, 
  Layers,
  TrendingUp,
  TrendingDown,
  PiggyBank
} from 'lucide-react';
import { Expense } from '../types/expense';
import { formatRupiah } from '../utils/formatters';

interface AnalyticsViewProps {
  expenses: Expense[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ expenses }) => {
  // Cash flow aggregates
  let totalIncome = 0;
  let totalExpense = 0;
  let totalSaving = 0;

  expenses.forEach(e => {
    const flow = e.flowType || 'expense';
    if (flow === 'income') totalIncome += e.amount;
    else if (flow === 'expense') totalExpense += e.amount;
    else if (flow === 'saving') totalSaving += e.amount;
  });

  const totalFlow = totalIncome + totalExpense + totalSaving;

  // Group by types (Scopes)
  const typeStats: Record<string, { total: number; count: number }> = {};
  expenses.forEach(e => {
    e.types.forEach(t => {
      if (!typeStats[t]) typeStats[t] = { total: 0, count: 0 };
      typeStats[t].total += e.amount;
      typeStats[t].count += 1;
    });
  });

  const sortedTypes = Object.entries(typeStats).sort((a, b) => b[1].total - a[1].total);

  // Group by top expense categories
  const categoryStats: Record<string, { total: number; count: number }> = {};
  expenses.forEach(e => {
    if (!categoryStats[e.category]) categoryStats[e.category] = { total: 0, count: 0 };
    categoryStats[e.category].total += e.amount;
    categoryStats[e.category].count += 1;
  });

  const sortedCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const totalCategoryAmount = Object.values(categoryStats).reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      
      {/* 1. Alokasi Arus Keuangan (Pemasukan, Pengeluaran, Tabungan) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Struktur Arus Keuangan</span>
          </h3>
          <span className="text-[10px] text-slate-400">
            Total Perputaran
          </span>
        </div>

        <div className="space-y-3">
          {/* Pemasukan */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Pemasukan
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                +{formatRupiah(totalIncome)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Pengeluaran
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                -{formatRupiah(totalExpense)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-rose-500 transition-all duration-500" 
                style={{ width: `${totalFlow > 0 ? (totalExpense / totalFlow) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Tabungan */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5" /> Tabungan & Investasi
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatRupiah(totalSaving)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-cyan-500 transition-all duration-500" 
                style={{ width: `${totalFlow > 0 ? (totalSaving / totalFlow) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Kategori Terbesar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-500" />
            <span>Kategori Terbanyak / Terbesar</span>
          </h3>
          <span className="text-[10px] text-slate-400">
            Top 5
          </span>
        </div>

        <div className="space-y-2.5">
          {sortedCategories.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Belum ada data kategori</p>
          ) : (
            sortedCategories.map(([category, stat], idx) => {
              const percentage = totalCategoryAmount > 0 ? ((stat.total / totalCategoryAmount) * 100).toFixed(0) : '0';
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                      <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-500 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{category}</span>
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white shrink-0 ml-2">
                      {formatRupiah(stat.total)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-teal-500"
                      style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
