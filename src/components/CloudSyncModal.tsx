import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  Download, 
  Upload, 
  HardDrive, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { Expense, SyncStatus } from '../types/expense';
import { formatDateTimeIndo } from '../utils/formatters';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  onManualSync: () => Promise<void>;
  expenses: Expense[];
  onRestoreBackup: (expenses: Expense[]) => Promise<void>;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  lastSyncedAt,
  onManualSync,
  expenses,
  onRestoreBackup,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await onManualSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      app: 'KemenKeuKu',
      version: 1,
      exportedAt: new Date().toISOString(),
      totalExpenses: expenses.length,
      expenses,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KemenKeuKu_CloudBackup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.expenses)) {
          await onRestoreBackup(parsed.expenses);
          setUploadMessage(`Berhasil memulihkan ${parsed.expenses.length} data transaksi ke cloud!`);
        } else if (Array.isArray(parsed)) {
          await onRestoreBackup(parsed);
          setUploadMessage(`Berhasil memulihkan ${parsed.length} data transaksi ke cloud!`);
        } else {
          setUploadMessage('Format file cadangan tidak valid');
        }
      } catch (err) {
        setUploadMessage('Gagal membaca file JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Sinkronisasi Cloud
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyimpanan aman & sinkronisasi data antar perangkat
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
        <div className="p-6 space-y-4">
          
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Status Koneksi Cloud
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                syncStatus === 'synced'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
              }`}>
                {syncStatus === 'synced' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {syncStatus === 'syncing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {syncStatus === 'offline' && <HardDrive className="w-3.5 h-3.5" />}
                <span>
                  {syncStatus === 'synced' ? 'Tersinkronisasi' : syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Mode Lokal'}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                Server Backend:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                KemenKeuKu Cloud Run
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Sinkronisasi Terakhir:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {lastSyncedAt ? formatDateTimeIndo(lastSyncedAt) : 'Belum pernah'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Total Data Tersimpan:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {expenses.length} Transaksi
              </span>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang ke Cloud'}</span>
          </button>

          {/* Backup & Restore section */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cadangan & Pemulihan Snapshot Cloud
            </h4>

            {uploadMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                {uploadMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Cadangan</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Pulihkan Cadangan</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
            Data pengeluaran Anda disimpan di cloud server dan juga disimpan di penyimpanan lokal peramban (offline-first) sehingga tetap dapat diakses tanpa koneksi internet.
          </p>

        </div>

      </div>
    </div>
  );
};
