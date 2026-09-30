import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Plus, 
  Check, 
  RotateCcw, 
  Layers, 
  Tag, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Expense } from '../types/expense';

interface ManageScopesModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableScopes: string[];
  expenses: Expense[];
  onAddScope: (newScope: string) => void;
  onEditScope: (oldScope: string, newScope: string) => void;
  onDeleteScope: (scopeToDelete: string) => void;
  onResetScopes: () => void;
}

export const ManageScopesModal: React.FC<ManageScopesModalProps> = ({
  isOpen,
  onClose,
  availableScopes,
  expenses,
  onAddScope,
  onEditScope,
  onDeleteScope,
  onResetScopes,
}) => {
  const [newScopeInput, setNewScopeInput] = useState('');
  const [editingScope, setEditingScope] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [deleteConfirmScope, setDeleteConfirmScope] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Calculate usage count for each scope
  const scopeUsageCount: Record<string, number> = {};
  availableScopes.forEach(s => {
    scopeUsageCount[s] = 0;
  });
  expenses.forEach(e => {
    e.types.forEach(t => {
      scopeUsageCount[t] = (scopeUsageCount[t] || 0) + 1;
    });
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newScopeInput.trim().replace(/^\++\s*/, '');
    if (!clean) return;
    if (availableScopes.some(s => s.toLowerCase() === clean.toLowerCase())) {
      setErrorMsg(`Kalangan "${clean}" sudah ada.`);
      return;
    }
    onAddScope(clean);
    setNewScopeInput('');
    setErrorMsg('');
  };

  const handleStartEdit = (scope: string) => {
    setEditingScope(scope);
    setEditNameInput(scope);
    setErrorMsg('');
  };

  const handleSaveEdit = (oldScope: string) => {
    const clean = editNameInput.trim().replace(/^\++\s*/, '');
    if (!clean || clean === oldScope) {
      setEditingScope(null);
      return;
    }
    if (availableScopes.some(s => s.toLowerCase() === clean.toLowerCase() && s !== oldScope)) {
      setErrorMsg(`Nama kalangan "${clean}" sudah digunakan.`);
      return;
    }
    onEditScope(oldScope, clean);
    setEditingScope(null);
    setErrorMsg('');
  };

  const handleDelete = (scope: string) => {
    if (availableScopes.length <= 1) {
      setErrorMsg('Minimal harus ada satu kalangan / jenis.');
      return;
    }
    if (deleteConfirmScope === scope) {
      onDeleteScope(scope);
      setDeleteConfirmScope(null);
    } else {
      setDeleteConfirmScope(scope);
      setTimeout(() => {
        setDeleteConfirmScope(prev => (prev === scope ? null : prev));
      }, 5000);
    }
  };

  const POPULAR_SUGGESTIONS = [
    'Pernikahan & Resepsi',
    'Tabungan Haji & Umroh',
    'Syukuran & Acara',
    'Investasi & Emas',
    'Keluarga Besar',
    'Proyek & Freelance',
    'Toko Cabang',
    'Anak & Pendidikan',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Kelola Kalangan & Jenis
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tambah, ubah nama (edit), atau hapus jenis pengeluaran & pemasukan
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
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Tambah Kalangan Baru */}
          <form onSubmit={handleCreate} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Tambah Kalangan Baru
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={newScopeInput}
                  onChange={(e) => setNewScopeInput(e.target.value)}
                  placeholder="Contoh: Pernikahan, Tabungan Umroh, Toko Cabang..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Rekomendasi Cepat */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 block mb-1">Rekomendasi Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SUGGESTIONS.filter(s => !availableScopes.includes(s)).map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      onAddScope(sug);
                      setErrorMsg('');
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* List Kalangan dengan Tombol Edit & Hapus */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Daftar Kalangan Aktif ({availableScopes.length})
              </label>
              <button
                type="button"
                onClick={onResetScopes}
                className="text-[11px] font-semibold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                title="Kembalikan ke kalangan default awal"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Awal</span>
              </button>
            </div>

            <div className="space-y-2">
              {availableScopes.map((scope) => {
                const count = scopeUsageCount[scope] || 0;
                const isEditing = editingScope === scope;

                return (
                  <div
                    key={scope}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between gap-2"
                  >
                    {isEditing ? (
                      /* Inline Edit View */
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(scope)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                          title="Simpan nama"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingScope(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="Batal"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Normal Display View */
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                            {scope}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                            {count} transaksi
                          </span>
                        </div>

                        {/* Action buttons: Edit & Hapus */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(scope)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title={`Ubah nama kalangan "${scope}"`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(scope)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              deleteConfirmScope === scope
                                ? 'bg-rose-500 text-white font-bold text-[10px] px-2'
                                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            title={deleteConfirmScope === scope ? 'Klik sekali lagi untuk menghapus kalangan ini' : `Hapus kalangan "${scope}"`}
                          >
                            {deleteConfirmScope === scope ? (
                              'Yakin Hapus?'
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
