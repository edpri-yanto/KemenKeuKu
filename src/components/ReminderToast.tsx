import React from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';
import { ReminderNotification } from '../types/expense';
import { formatRupiah } from '../utils/formatters';

interface ReminderToastProps {
  notification: ReminderNotification | null;
  onClose: () => void;
  onOpenDrawer: () => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  notification,
  onClose,
  onOpenDrawer,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/50 rounded-2xl shadow-2xl p-4 flex items-start gap-3.5 text-slate-800 dark:text-slate-100">
        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 mt-0.5">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pengingat Transaksi Baru</span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
            {notification.title}
          </h4>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Tercatat sebesar <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatRupiah(notification.amount)}</strong>
          </p>

          {/* Types tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Jenis:</span>
            {notification.types.map(t => (
              <span
                key={t}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <button
              onClick={onOpenDrawer}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Lihat Riwayat Pengingat →
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Sinkron ke Cloud
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
