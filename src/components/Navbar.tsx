import React from 'react';
import { 
  Sun, 
  Moon, 
  Cloud, 
  Bell, 
  Plus, 
  Download, 
  RefreshCw, 
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SyncStatus } from '../types/expense';

interface NavbarProps {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  unreadRemindersCount: number;
  onOpenSyncModal: () => void;
  onOpenReminderDrawer: () => void;
  onOpenAddExpense: () => void;
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  syncStatus,
  lastSyncedAt,
  unreadRemindersCount,
  onOpenSyncModal,
  onOpenReminderDrawer,
  onOpenAddExpense,
  onOpenExportModal,
}) => {
  const { theme, toggleTheme } = useTheme();

  const getSyncBadge = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />,
          text: 'Cloud Aktif',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />,
          text: 'Sync...',
          bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300',
        };
      default:
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />,
          text: 'Lokal',
          bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
        };
    }
  };

  const syncBadge = getSyncBadge();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Brand / Logo */}
        {/* Requirement: Kombinasi warna nama app nya untuk "KemenKeu" hijau, lalu "Ku" putih */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0 ring-1 sm:ring-2 ring-emerald-500/20">
            <Wallet className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl tracking-tight leading-none flex items-center">
              {/* KemenKeu (Hijau) */}
              <span className="text-emerald-500 dark:text-emerald-400 font-black">
                KemenKeu
              </span>
              {/* Ku (Putih di tema gelap, kontras di tema terang) */}
              <span className="text-slate-900 dark:text-white font-black">
                Ku
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 hidden md:block truncate mt-0.5">
              Pribadi • Pelajar • Toko • UMKM • Kantor
            </p>
          </div>
        </div>

        {/* Right Tools Bar (Optimized for Mobile so NO horizontal scrolling occurs!) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Cloud Sync Status Indicator */}
          <button
            onClick={onOpenSyncModal}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${syncBadge.bg}`}
            title={`Status Cloud: ${syncBadge.text}`}
          >
            <Cloud className="w-3.5 h-3.5 opacity-80 shrink-0" />
            <span className="hidden md:inline text-[11px]">{syncBadge.text}</span>
            {syncBadge.icon}
          </button>

          {/* Pengingat / Notification Bell with unread badge */}
          <button
            onClick={onOpenReminderDrawer}
            className="relative p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
            title="Pusat Pengingat Transaksi"
            aria-label="Notifikasi & Pengingat"
          >
            <Bell className="w-4 h-4" />
            {unreadRemindersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-black animate-pulse">
                {unreadRemindersCount > 9 ? '9+' : unreadRemindersCount}
              </span>
            )}
          </button>

          {/* Theme Toggle (Dark & Light) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-amber-300 transition-all cursor-pointer shrink-0"
            title={theme === 'dark' ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)'}
            aria-label="Toggle Dark and Light theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Ekspor Laporan Button (hidden on small phone, accessible in bottom bar/action) */}
          <button
            onClick={onOpenExportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ekspor</span>
          </button>

          {/* Desktop/Tablet Header "+ Catat" button */}
          {/* On mobile screens, it's also compact and fits nicely, plus we provide the Mobile FAB */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-3" />
            <span className="text-xs">Catat</span>
          </button>

        </div>

      </div>
    </header>
  );
};
