import React from 'react';
import { 
  Plus, 
  Download, 
  Bell, 
  Cloud, 
  Home
} from 'lucide-react';
import { SyncStatus } from '../types/expense';

interface MobileBottomNavProps {
  unreadRemindersCount: number;
  syncStatus: SyncStatus;
  onOpenAddExpense: () => void;
  onOpenExportModal: () => void;
  onOpenReminderDrawer: () => void;
  onOpenSyncModal: () => void;
  onScrollToTop?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  unreadRemindersCount,
  syncStatus,
  onOpenAddExpense,
  onOpenExportModal,
  onOpenReminderDrawer,
  onOpenSyncModal,
  onScrollToTop,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-3 py-2 pb-safe shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Beranda */}
        <button
          onClick={onScrollToTop}
          className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 py-1 px-2 cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Beranda</span>
        </button>

        {/* Ekspor Laporan */}
        <button
          onClick={onOpenExportModal}
          className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 py-1 px-2 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Ekspor</span>
        </button>

        {/* Center Prominent "Catat" Floating Button */}
        {/* Always visible, highly thumb-friendly, no geser needed! */}
        <button
          onClick={onOpenAddExpense}
          className="flex flex-col items-center justify-center -mt-6 group cursor-pointer"
          title="Catat Transaksi Baru"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/40 ring-4 ring-white dark:ring-slate-950 transform group-active:scale-95 transition-all">
            <Plus className="w-7 h-7 stroke-3" />
          </div>
          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            Catat
          </span>
        </button>

        {/* Pengingat */}
        <button
          onClick={onOpenReminderDrawer}
          className="relative flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 py-1 px-2 cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {unreadRemindersCount > 0 && (
            <span className="absolute top-0.5 right-2 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px] font-black">
              {unreadRemindersCount}
            </span>
          )}
          <span className="text-[10px] font-semibold">Pengingat</span>
        </button>

        {/* Cloud Sync */}
        <button
          onClick={onOpenSyncModal}
          className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 py-1 px-2 cursor-pointer"
        >
          <div className="relative">
            <Cloud className="w-5 h-5" />
            <div className={`w-2 h-2 rounded-full absolute -top-0.5 -right-0.5 ${
              syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : 'bg-slate-400'
            }`} />
          </div>
          <span className="text-[10px] font-semibold">Cloud</span>
        </button>

      </div>
    </nav>
  );
};
