import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  CreditCard, 
  Clock, 
  FileText, 
  LayoutList, 
  LayoutGrid, 
  Copy,
  Receipt,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  CheckCircle2,
  Clock3,
  User,
  Plus
} from 'lucide-react';
import { Expense, DEFAULT_TYPES } from '../types/expense';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onDuplicate: (expense: Expense) => void;
  onToggleDebtStatus?: (expense: Expense) => void;
  onOpenAddExpense: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleDebtStatus,
  onOpenAddExpense,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards'); // Default to cards for best mobile auto-adaptive experience
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getTypeBadgeStyle = (typeName: string) => {
    const found = DEFAULT_TYPES.find((d: { id: string; bgLight: string; bgDark: string; color: string; border: string }) => d.id === typeName);
    if (found) {
      return `${found.bgLight} ${found.bgDark} ${found.color} ${found.border}`;
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => {
        setDeleteConfirmId(prev => (prev === id ? null : prev));
      }, 4000);
    }
  };

  const getFlowBadge = (expense: Expense) => {
    const flow = expense.flowType || 'expense';
    if (flow === 'income') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
          <TrendingUp className="w-3 h-3" />
          Pemasukan
        </span>
      );
    }
    if (flow === 'debt') {
      const isPayable = expense.debtDirection === 'payable';
      const isPaid = expense.debtStatus === 'paid';
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
          isPaid 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
            : isPayable
            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
            : 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
        }`}>
          <Receipt className="w-3 h-3" />
          {isPaid ? 'Lunas' : isPayable ? 'Utang' : 'Piutang'}
        </span>
      );
    }
    if (flow === 'saving') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-300/60 dark:border-cyan-800">
          <PiggyBank className="w-3 h-3" />
          Tabungan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800">
        <TrendingDown className="w-3 h-3" />
        Pengeluaran
      </span>
    );
  };

  const getAmountColor = (flow: string | undefined) => {
    if (flow === 'income') return 'text-emerald-600 dark:text-emerald-400';
    if (flow === 'saving') return 'text-cyan-600 dark:text-cyan-400';
    if (flow === 'debt') return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getAmountPrefix = (flow: string | undefined) => {
    if (flow === 'income') return '+';
    if (flow === 'saving') return '';
    if (flow === 'debt') return '';
    return '-';
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3.5 border border-emerald-200 dark:border-emerald-800">
          <Receipt className="w-7 h-7 stroke-1.5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Belum Ada Data Transaksi
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
          Catat pengeluaran, pemasukan, utang/piutang, maupun tabungan Anda untuk semua keperluan pribadi, pelajar, toko, hingga kantor.
        </p>
        <button
          onClick={onOpenAddExpense}
          className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Transaksi Baru</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
      
      {/* Header View Switcher */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Daftar Transaksi</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {expenses.length} data
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Tampilan Kartu Ringkas"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`hidden sm:inline-flex p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Tampilan Tabel Rinci"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CARDS VIEW (Fully responsive, mobile-first, no horizontal scrolling!) */}
      {viewMode === 'cards' ? (
        <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {expenses.map((expense) => {
            const flow = expense.flowType || 'expense';
            return (
              <div
                key={expense.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top tags & date */}
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getFlowBadge(expense)}
                      {expense.types.slice(0, 2).map(t => (
                        <span
                          key={t}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md border ${getTypeBadgeStyle(t)}`}
                        >
                          {t}
                        </span>
                      ))}
                      {expense.types.length > 2 && (
                        <span className="text-[9px] text-slate-400">+{expense.types.length - 2}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {formatDateIndo(expense.date)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                    {expense.title}
                  </h4>

                  {/* Utang/Piutang extra details */}
                  {flow === 'debt' && (
                    <div className="mt-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] space-y-1">
                      {expense.debtContact && (
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <User className="w-3 h-3" /> Pihak:
                          </span>
                          <strong className="font-bold">{expense.debtContact}</strong>
                        </div>
                      )}
                      {expense.debtDueDate && (
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock3 className="w-3 h-3" /> Jatuh Tempo:
                          </span>
                          <span>{formatDateIndo(expense.debtDueDate)}</span>
                        </div>
                      )}
                      {onToggleDebtStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleDebtStatus(expense)}
                          className="w-full mt-1 py-1 text-center font-bold text-[10px] rounded-lg bg-amber-600/20 text-amber-800 dark:text-amber-200 hover:bg-amber-600/30 transition-colors"
                        >
                          {expense.debtStatus === 'paid' ? '✓ Sudah Lunas (Klik ubah)' : '⏳ Belum Lunas (Klik tandai Lunas)'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tabungan extra details */}
                  {flow === 'saving' && expense.savingAccount && (
                    <p className="mt-1 text-[11px] text-cyan-700 dark:text-cyan-300 font-medium">
                      🏦 Akun: {expense.savingAccount}
                    </p>
                  )}

                  {/* Notes */}
                  {expense.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {expense.notes}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{expense.category}</span>
                    <span>{expense.paymentMethod}</span>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className={`text-sm sm:text-base font-black ${getAmountColor(flow)}`}>
                    {getAmountPrefix(flow)}{formatRupiah(expense.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicate(expense)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Duplikat"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      title="Ubah"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(expense.id)}
                      className={`p-1 rounded-md transition-colors ${
                        deleteConfirmId === expense.id ? 'text-rose-500 font-bold text-xs' : 'text-slate-400 hover:text-rose-500'
                      }`}
                      title="Hapus"
                    >
                      {deleteConfirmId === expense.id ? 'Yakin?' : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Desktop friendly) */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tipe & Waktu</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Kalangan (Scope)</th>
                <th className="py-3 px-4">Kategori & Metode</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {expenses.map((expense) => {
                const flow = expense.flowType || 'expense';
                return (
                  <tr 
                    key={expense.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="mb-1">{getFlowBadge(expense)}</div>
                      <span className="font-semibold text-slate-900 dark:text-white block text-[11px]">
                        {formatDateIndo(expense.date)}
                      </span>
                    </td>

                    <td className="py-3 px-4 min-w-[180px]">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {expense.title}
                      </span>
                      {expense.debtContact && (
                        <span className="text-[10px] text-amber-600 block">Pihak: {expense.debtContact}</span>
                      )}
                      {expense.notes && (
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {expense.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {expense.types.map(t => (
                          <span
                            key={t}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${getTypeBadgeStyle(t)}`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300 block">
                        {expense.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {expense.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className={`font-black text-sm ${getAmountColor(flow)}`}>
                        {getAmountPrefix(flow)}{formatRupiah(expense.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onDuplicate(expense)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(expense)}
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500"
                        >
                          {deleteConfirmId === expense.id ? 'Yakin?' : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
