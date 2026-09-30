import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  Calendar, 
  Download, 
  Clock, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Expense } from '../types/expense';
import { exportExpensesToPDF, exportExpensesToExcel } from '../utils/exportUtils';
import { formatRupiah, getTodayDateString } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  availableTypes: string[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  availableTypes,
}) => {
  const [dateRangeOption, setDateRangeOption] = useState<'today' | 'last7' | 'thisMonth' | 'all' | 'custom'>('thisMonth');
  const [customStartDate, setCustomStartDate] = useState(getTodayDateString());
  const [customEndDate, setCustomEndDate] = useState(getTodayDateString());
  const [selectedExportTypes, setSelectedExportTypes] = useState<string[]>(availableTypes);
  const [autoExportDaily, setAutoExportDaily] = useState(() => {
    return localStorage.getItem('kemenkeuku_auto_export_daily') === 'true';
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Filter expenses according to selection
  const now = new Date();
  const todayStr = getTodayDateString();

  const filteredExpenses = expenses.filter(e => {
    // Filter by type
    const matchesType = selectedExportTypes.length === 0 || e.types.some(t => selectedExportTypes.includes(t));
    if (!matchesType) return false;

    // Filter by date
    if (dateRangeOption === 'today') {
      return e.date === todayStr;
    } else if (dateRangeOption === 'last7') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return e.date >= sevenDaysAgo && e.date <= todayStr;
    } else if (dateRangeOption === 'thisMonth') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return e.date.startsWith(monthPrefix);
    } else if (dateRangeOption === 'custom') {
      return e.date >= customStartDate && e.date <= customEndDate;
    }
    return true; // 'all'
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const toggleType = (t: string) => {
    if (selectedExportTypes.includes(t)) {
      if (selectedExportTypes.length > 1) {
        setSelectedExportTypes(selectedExportTypes.filter(item => item !== t));
      }
    } else {
      setSelectedExportTypes([...selectedExportTypes, t]);
    }
  };

  const selectAllTypes = () => {
    setSelectedExportTypes(availableTypes);
  };

  const handleToggleAutoExport = () => {
    const next = !autoExportDaily;
    setAutoExportDaily(next);
    localStorage.setItem('kemenkeuku_auto_export_daily', String(next));
  };

  const getDateLabel = () => {
    switch (dateRangeOption) {
      case 'today': return 'Hari Ini';
      case 'last7': return '7 Hari Terakhir';
      case 'thisMonth': return `Bulan Ini (${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })})`;
      case 'custom': return `${customStartDate} s/d ${customEndDate}`;
      default: return 'Semua Riwayat Transaksi';
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      exportExpensesToPDF(filteredExpenses, {
        filterTypes: selectedExportTypes,
        dateRangeLabel: getDateLabel(),
        startDate: customStartDate,
        endDate: customEndDate,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportExpensesToExcel(filteredExpenses, {
        filterTypes: selectedExportTypes,
        dateRangeLabel: getDateLabel(),
        startDate: customStartDate,
        endDate: customEndDate,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ekspor Laporan Keuangan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format resmi PDF & Excel (.xlsx) dengan pembukuan multi-jenis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Summary Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                Total Realisasi yang Diekspor
              </span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(totalFilteredAmount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {filteredExpenses.length} Transaksi
              </span>
              <span className="text-[11px] text-slate-400 block">
                {selectedExportTypes.length} Jenis Pengeluaran
              </span>
            </div>
          </div>

          {/* Periode Waktu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Pilih Periode Waktu
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'today', label: 'Hari Ini' },
                { id: 'last7', label: '7 Hari' },
                { id: 'thisMonth', label: 'Bulan Ini' },
                { id: 'all', label: 'Semua' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDateRangeOption(opt.id as any)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    dateRangeOption === opt.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => setDateRangeOption('custom')}
                className={`w-full py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  dateRangeOption === 'custom'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Pilih Rentang Tanggal Kustom
              </button>
            </div>

            {dateRangeOption === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400">Mulai:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Sampai:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filter Jenis Pengeluaran */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Cakupan Jenis Pengeluaran
              </label>
              <button
                type="button"
                onClick={selectAllTypes}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Pilih Semua
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTypes.map(t => {
                const isSelected = selectedExportTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fitur Ekspor Otomatis */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Pengingat Ekspor Otomatis
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Otomatis ingatkan unduh rekapan pembukuan harian setiap sore
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleAutoExport}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoExportDaily ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    autoExportDaily ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={filteredExpenses.length === 0 || isExporting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ekspor Format PDF Resmi (Laporan KemenKeuKu)</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={filteredExpenses.length === 0 || isExporting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Format Excel (.xlsx Multi-Sheet)</span>
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
            Laporan menyertakan tabel detail pengeluaran, rekapitulasi per jenis, dan rekapitulasi per kategori.
          </p>
        </div>

      </div>
    </div>
  );
};
