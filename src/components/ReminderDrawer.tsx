import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  X, 
  Trash2, 
  CheckCheck, 
  AlertTriangle, 
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ReminderNotification } from '../types/expense';
import { formatDateTimeIndo, formatRupiah, parseRupiahInput } from '../utils/formatters';
import { sendBrowserNotification } from '../utils/audioNotification';

interface ReminderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ReminderNotification[];
  onClearAll: () => void;
  onMarkAllAsRead: () => void;
  dailyBudgetLimit: number;
  onUpdateDailyLimit: (limit: number) => void;
  todayTotal: number;
}

export const ReminderDrawer: React.FC<ReminderDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkAllAsRead,
  dailyBudgetLimit,
  onUpdateDailyLimit,
  todayTotal,
}) => {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('kemenkeuku_sound_muted') === 'true';
  });
  const [browserNotifStatus, setBrowserNotifStatus] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimitInput, setTempLimitInput] = useState(dailyBudgetLimit > 0 ? dailyBudgetLimit.toString() : '');

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('kemenkeuku_sound_muted', String(next));
  };

  const requestBrowserPermission = async () => {
    const granted = await sendBrowserNotification('Pengingat KemenKeuKu Aktif', {
      body: 'Notifikasi otomatis aktif setiap ada pengeluaran harian baru.',
    });
    if (granted) {
      setBrowserNotifStatus('granted');
    } else {
      setBrowserNotifStatus('denied');
    }
  };

  const handleSaveLimit = () => {
    const parsed = parseRupiahInput(tempLimitInput);
    onUpdateDailyLimit(parsed);
    setIsEditingLimit(false);
  };

  const isOverBudget = dailyBudgetLimit > 0 && todayTotal > dailyBudgetLimit;
  const budgetPercentage = dailyBudgetLimit > 0 ? Math.min(Math.round((todayTotal / dailyBudgetLimit) * 100), 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Pusat Pengingat Transaksi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Notifikasi otomatis setiap pengeluaran baru
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Settings Bar */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              title="Atur suara lonceng transaksi"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-500" />
                  <span>Suara: Senyap</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Suara: Berbunyi</span>
                </>
              )}
            </button>

            {browserNotifStatus !== 'granted' && browserNotifStatus !== 'unsupported' && (
              <button
                onClick={requestBrowserPermission}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aktifkan Notif Web</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tandai Dibaca</span>
              </button>
            )}
          </div>

          {/* Budget Limit Reminder Alert */}
          <div className="p-4 mx-4 mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Target Pengingat Batas Harian
              </span>
              <button
                onClick={() => setIsEditingLimit(!isEditingLimit)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                {isEditingLimit ? 'Batal' : dailyBudgetLimit > 0 ? 'Ubah Batas' : 'Pasang Batas'}
              </button>
            </div>

            {isEditingLimit ? (
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={tempLimitInput}
                    onChange={(e) => setTempLimitInput(e.target.value)}
                    placeholder="Contoh: 500000"
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={handleSaveLimit}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Simpan
                </button>
              </div>
            ) : dailyBudgetLimit > 0 ? (
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Hari ini: <strong>{formatRupiah(todayTotal)}</strong></span>
                  <span>Batas: {formatRupiah(dailyBudgetLimit)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  />
                </div>
                {isOverBudget && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Peringatan: Pengeluaran hari ini telah melampaui batas harian!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur batas pengeluaran harian agar KemenKeuKu memberi peringatan otomatis saat batas terlampaui.
              </p>
            )}
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <Bell className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
                <p className="text-sm font-medium">Belum Ada Pengingat Transaksi</p>
                <p className="text-xs mt-1 max-w-xs mx-auto">
                  Setiap kali Anda mencatat pengeluaran harian baru (pribadi, bisnis, kantor, atau toko), pengingat otomatis akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    notif.read
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatRupiah(notif.amount)}
                    </span>
                  </div>

                  <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
                    {notif.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {notif.types.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        {type}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTimeIndo(notif.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {notifications.length} pengingat tersimpan
              </span>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Semua</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
