import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SummaryCards } from './components/SummaryCards';
import { FilterBar } from './components/FilterBar';
import { ExpenseList } from './components/ExpenseList';
import { AnalyticsView } from './components/AnalyticsView';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { ManageScopesModal } from './components/ManageScopesModal';
import { ExportModal } from './components/ExportModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { ReminderDrawer } from './components/ReminderDrawer';
import { ReminderToast } from './components/ReminderToast';
import { ThemeProvider } from './context/ThemeContext';
import { Expense, ReminderNotification, SyncStatus, TransactionFlow } from './types/expense';
import { cloudSync } from './services/cloudSyncService';
import { playTransactionChime, sendBrowserNotification } from './utils/audioNotification';
import { formatRupiah, getTodayDateString, getCurrentTimeString } from './utils/formatters';

const DEFAULT_INITIAL_SCOPES = [
  'Pribadi',
  'Pelajar / Mahasiswa',
  'Pedagang / Toko',
  'UMKM / Bisnis',
  'Kantor'
];

export function KemenKeuKuApp() {
  // Main Data States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Dynamic Scopes/Kalangan (Editable, Deletable, Addable)
  const [availableScopes, setAvailableScopes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kemenkeuku_available_scopes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const customSaved = localStorage.getItem('kemenkeuku_custom_types');
      if (customSaved) {
        const parsedCustom = JSON.parse(customSaved);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          return Array.from(new Set([...DEFAULT_INITIAL_SCOPES, ...parsedCustom]));
        }
      }
      return DEFAULT_INITIAL_SCOPES;
    } catch {
      return DEFAULT_INITIAL_SCOPES;
    }
  });

  // Custom Categories by Flow (Pernikahan, Umroh, Emas, dll.)
  const [customCategoriesByFlow, setCustomCategoriesByFlow] = useState<Record<TransactionFlow, string[]>>(() => {
    try {
      const saved = localStorage.getItem('kemenkeuku_custom_categories');
      return saved ? JSON.parse(saved) : { expense: [], income: [], debt: [], saving: [] };
    } catch {
      return { expense: [], income: [], debt: [], saving: [] };
    }
  });

  // Reminders and Notifications
  const [notifications, setNotifications] = useState<ReminderNotification[]>(() => {
    try {
      const saved = localStorage.getItem('kemenkeuku_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeToastNotification, setActiveToastNotification] = useState<ReminderNotification | null>(null);

  // Daily budget limit for automatic warnings
  const [dailyBudgetLimit, setDailyBudgetLimit] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kemenkeuku_daily_budget_limit');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Modals Visibility
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isManageScopesOpen, setIsManageScopesOpen] = useState(false);
  const [defaultModalFlow, setDefaultModalFlow] = useState<TransactionFlow>('expense');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isReminderDrawerOpen, setIsReminderDrawerOpen] = useState(false);

  // Filter States
  const [flowFilter, setFlowFilter] = useState<'all' | TransactionFlow>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // Multi-scope selection
  const [selectedCategory, setSelectedCategory] = useState('');
  const [datePreset, setDatePreset] = useState<'today' | 'last7' | 'thisMonth' | 'all' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState(getTodayDateString());
  const [customEndDate, setCustomEndDate] = useState(getTodayDateString());

  // Subscribe to Cloud Sync status changes
  useEffect(() => {
    const unsubscribe = cloudSync.subscribe((status, syncedTime) => {
      setSyncStatus(status);
      setLastSyncedAt(syncedTime);
    });

    // Initial load from cloud backend or local cache
    cloudSync.fetchInitialExpenses().then((initialExpenses) => {
      setExpenses(initialExpenses);
    });

    return () => unsubscribe();
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('kemenkeuku_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save available scopes to localStorage
  useEffect(() => {
    localStorage.setItem('kemenkeuku_available_scopes', JSON.stringify(availableScopes));
  }, [availableScopes]);

  // Save custom categories to localStorage
  useEffect(() => {
    localStorage.setItem('kemenkeuku_custom_categories', JSON.stringify(customCategoriesByFlow));
  }, [customCategoriesByFlow]);

  // Calculate today's total spending for budget alert
  const todayStr = getTodayDateString();
  const todayTotal = useMemo(() => {
    return expenses
      .filter(e => e.date === todayStr && (e.flowType === 'expense' || !e.flowType))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  // Unread reminders count
  const unreadRemindersCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Kalangan Management Handlers (Add, Edit, Delete, Reset)
  const handleAddScope = (newScope: string) => {
    const clean = newScope.trim();
    if (!clean) return;
    if (!availableScopes.includes(clean)) {
      setAvailableScopes(prev => [...prev, clean]);
    }
  };

  const handleEditScope = async (oldScope: string, newScope: string) => {
    const clean = newScope.trim();
    if (!clean || clean === oldScope) return;

    // 1. Update available scopes list
    setAvailableScopes(prev => prev.map(s => (s === oldScope ? clean : s)));

    // 2. Update existing transactions
    let hasChanges = false;
    const updatedExpenses = expenses.map(e => {
      if (e.types.includes(oldScope)) {
        hasChanges = true;
        return {
          ...e,
          types: e.types.map(t => (t === oldScope ? clean : t)),
          updatedAt: new Date().toISOString(),
        };
      }
      return e;
    });

    if (hasChanges) {
      setExpenses(updatedExpenses);
      await cloudSync.syncWithCloud(updatedExpenses);
    }

    // 3. Update active filter selection
    setSelectedTypes(prev => prev.map(t => (t === oldScope ? clean : t)));
  };

  const handleDeleteScope = async (scopeToDelete: string) => {
    if (availableScopes.length <= 1) return;

    // 1. Remove from scopes
    const remainingScopes = availableScopes.filter(s => s !== scopeToDelete);
    setAvailableScopes(remainingScopes);

    // 2. Remove from transactions (fallback to first remaining scope)
    const fallbackScope = remainingScopes[0] || 'Pribadi';
    let hasChanges = false;
    const updatedExpenses = expenses.map(e => {
      if (e.types.includes(scopeToDelete)) {
        hasChanges = true;
        const remainingTypes = e.types.filter(t => t !== scopeToDelete);
        return {
          ...e,
          types: remainingTypes.length > 0 ? remainingTypes : [fallbackScope],
          updatedAt: new Date().toISOString(),
        };
      }
      return e;
    });

    if (hasChanges) {
      setExpenses(updatedExpenses);
      await cloudSync.syncWithCloud(updatedExpenses);
    }

    // 3. Remove from filter
    setSelectedTypes(prev => prev.filter(t => t !== scopeToDelete));
  };

  const handleResetScopes = () => {
    setAvailableScopes(DEFAULT_INITIAL_SCOPES);
  };

  // Custom Category Handler
  const handleAddCustomCategory = (flow: TransactionFlow, newCat: string) => {
    const clean = newCat.trim();
    if (!clean) return;
    setCustomCategoriesByFlow(prev => {
      const existing = prev[flow] || [];
      if (existing.includes(clean)) return prev;
      return {
        ...prev,
        [flow]: [...existing, clean],
      };
    });
  };

  // Automatic Reminder Trigger when new transaction enters
  const triggerNewTransactionReminder = useCallback((newExpense: Expense, prevTodayTotal: number) => {
    playTransactionChime();

    const formattedTypes = newExpense.types.join(' & ');
    const flow = newExpense.flowType || 'expense';

    let flowName = 'Pengeluaran';
    if (flow === 'income') flowName = 'Pemasukan';
    else if (flow === 'debt') flowName = 'Utang / Piutang';
    else if (flow === 'saving') flowName = 'Tabungan / Investasi';

    const reminderMsg = `${flowName} sebesar ${formatRupiah(newExpense.amount)} dicatat untuk "${newExpense.title}" pada kalangan [${formattedTypes}].`;

    const newNotif: ReminderNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      expenseId: newExpense.id,
      flowType: flow,
      title: newExpense.title,
      amount: newExpense.amount,
      types: newExpense.types,
      category: newExpense.category,
      message: reminderMsg,
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
    setActiveToastNotification(newNotif);

    setTimeout(() => {
      setActiveToastNotification(current => (current?.id === newNotif.id ? null : current));
    }, 6000);

    sendBrowserNotification(`Pengingat KemenKeuKu: ${newExpense.title}`, {
      body: `${formatRupiah(newExpense.amount)} - [${formattedTypes}]`,
    });

    // Check daily budget threshold (for expenses)
    if (flow === 'expense' && dailyBudgetLimit > 0) {
      const newTotal = prevTodayTotal + newExpense.amount;
      if (newTotal > dailyBudgetLimit && prevTodayTotal <= dailyBudgetLimit) {
        const budgetNotif: ReminderNotification = {
          id: `budget-${Date.now()}`,
          timestamp: new Date().toISOString(),
          expenseId: newExpense.id,
          flowType: 'expense',
          title: 'Peringatan: Melebihi Batas Pengeluaran Harian!',
          amount: newTotal,
          types: newExpense.types,
          category: 'Peringatan Anggaran',
          message: `Total belanja hari ini (${formatRupiah(newTotal)}) telah melampaui batas harian (${formatRupiah(dailyBudgetLimit)}).`,
          read: false,
        };
        setTimeout(() => {
          setNotifications(prev => [budgetNotif, ...prev]);
        }, 500);
      }
    }
  }, [dailyBudgetLimit]);

  // Handle Save (Create / Update)
  const handleSaveExpense = async (
    expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      const existing = expenses.find(e => e.id === existingId);
      if (!existing) return;
      const updatedItem: Expense = {
        ...existing,
        ...expenseData,
        updatedAt: new Date().toISOString(),
      };
      const updatedList = await cloudSync.updateExpense(updatedItem, expenses);
      setExpenses(updatedList);
    } else {
      const newItem: Expense = {
        ...expenseData,
        id: `trx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const prevToday = todayTotal;
      const updatedList = await cloudSync.addExpense(newItem, expenses);
      setExpenses(updatedList);

      triggerNewTransactionReminder(newItem, prevToday);
    }
  };

  // Handle Delete
  const handleDeleteExpense = async (id: string) => {
    const updatedList = await cloudSync.deleteExpense(id, expenses);
    setExpenses(updatedList);
  };

  // Handle Duplicate
  const handleDuplicateExpense = async (expense: Expense) => {
    const duplicated: Expense = {
      ...expense,
      id: `trx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: `${expense.title} (Salinan)`,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const prevToday = todayTotal;
    const updatedList = await cloudSync.addExpense(duplicated, expenses);
    setExpenses(updatedList);
    triggerNewTransactionReminder(duplicated, prevToday);
  };

  // Toggle Debt Status (Lunas / Belum Lunas)
  const handleToggleDebtStatus = async (expense: Expense) => {
    const nextStatus = expense.debtStatus === 'paid' ? 'unpaid' : 'paid';
    const updatedItem: Expense = {
      ...expense,
      debtStatus: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    const updatedList = await cloudSync.updateExpense(updatedItem, expenses);
    setExpenses(updatedList);
  };

  // Manual Cloud Sync
  const handleManualSync = async () => {
    const synced = await cloudSync.syncWithCloud(expenses);
    setExpenses(synced);
  };

  // Restore Backup
  const handleRestoreBackup = async (restoredExpenses: Expense[]) => {
    const synced = await cloudSync.restoreFromBackup(restoredExpenses);
    setExpenses(synced);
  };

  // Multi-Scope Filtering
  const handleToggleTypeFilter = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleClearTypeFilter = () => {
    setSelectedTypes([]);
  };

  const handleSelectTypeFilterFromSummary = (type: string) => {
    if (selectedTypes.includes(type) && selectedTypes.length === 1) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes([type]);
    }
  };

  // Flow tab filter click from Summary Cards
  const handleSelectFlowTabFromSummary = (flow: string) => {
    setFlowFilter(flow as any);
  };

  // Notification Drawer Actions
  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleUpdateDailyLimit = (limit: number) => {
    setDailyBudgetLimit(limit);
    localStorage.setItem('kemenkeuku_daily_budget_limit', limit.toString());
  };

  // Open modal with specific flow
  const handleOpenAddWithFlow = (flow: TransactionFlow = 'expense') => {
    setDefaultModalFlow(flow);
    setEditingExpense(null);
    setIsAddExpenseOpen(true);
  };

  // Filtered Expenses Computation
  const filteredExpenses = useMemo(() => {
    const today = getTodayDateString();

    return expenses.filter(expense => {
      const expFlow = expense.flowType || 'expense';

      // 1. Flow Filter
      if (flowFilter !== 'all' && expFlow !== flowFilter) {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = expense.title.toLowerCase().includes(q);
        const matchesNotes = expense.notes?.toLowerCase().includes(q) || false;
        const matchesCat = expense.category.toLowerCase().includes(q);
        const matchesContact = expense.debtContact?.toLowerCase().includes(q) || false;
        const matchesSaving = expense.savingAccount?.toLowerCase().includes(q) || false;
        const matchesType = expense.types.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesNotes && !matchesCat && !matchesContact && !matchesSaving && !matchesType) {
          return false;
        }
      }

      // 3. Category Filter
      if (selectedCategory && expense.category !== selectedCategory) {
        return false;
      }

      // 4. Multi-Scope Filter
      if (selectedTypes.length > 0) {
        const hasMatchingType = expense.types.some(t => selectedTypes.includes(t));
        if (!hasMatchingType) return false;
      }

      // 5. Date Preset Filter
      if (datePreset === 'today') {
        if (expense.date !== today) return false;
      } else if (datePreset === 'last7') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (expense.date < sevenDaysAgo || expense.date > today) return false;
      } else if (datePreset === 'thisMonth') {
        const currentMonthPrefix = today.substring(0, 7);
        if (!expense.date.startsWith(currentMonthPrefix)) return false;
      } else if (datePreset === 'custom') {
        if (expense.date < customStartDate || expense.date > customEndDate) return false;
      }

      return true;
    });
  }, [expenses, flowFilter, searchQuery, selectedCategory, selectedTypes, datePreset, customStartDate, customEndDate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden pb-20 sm:pb-8">
      
      {/* Top Navbar with Dark/Light toggle and Cloud status */}
      <Navbar
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        unreadRemindersCount={unreadRemindersCount}
        onOpenSyncModal={() => setIsSyncOpen(true)}
        onOpenReminderDrawer={() => setIsReminderDrawerOpen(true)}
        onOpenAddExpense={() => handleOpenAddWithFlow('expense')}
        onOpenExportModal={() => setIsExportOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Financial Summary & Cash Flow Overview */}
        <SummaryCards
          expenses={expenses}
          availableScopes={availableScopes}
          onSelectTypeFilter={handleSelectTypeFilterFromSummary}
          activeTypeFilter={selectedTypes}
          activeFlowTab={flowFilter}
          onSelectFlowTab={handleSelectFlowTabFromSummary}
        />

        {/* Analytics Breakdown */}
        <AnalyticsView expenses={expenses} />

        {/* Filter Bar with Flow Tabs, Search, Multi-Type Toggles, and Presets */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypes={selectedTypes}
          onToggleType={handleToggleTypeFilter}
          onClearTypes={handleClearTypeFilter}
          availableTypes={availableScopes}
          onOpenManageScopes={() => setIsManageScopesOpen(true)}
          flowFilter={flowFilter}
          onFlowFilterChange={setFlowFilter}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          customStartDate={customStartDate}
          onCustomStartDateChange={setCustomStartDate}
          customEndDate={customEndDate}
          onCustomEndDateChange={setCustomEndDate}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalFilteredCount={filteredExpenses.length}
        />

        {/* Expense List (Table & Card Views) */}
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={(exp) => {
            setEditingExpense(exp);
            setIsAddExpenseOpen(true);
          }}
          onDelete={handleDeleteExpense}
          onDuplicate={handleDuplicateExpense}
          onToggleDebtStatus={handleToggleDebtStatus}
          onOpenAddExpense={() => handleOpenAddWithFlow('expense')}
        />

      </main>

      {/* Mobile Bottom Navigation Bar (No Geser! Floating Thumb Action) */}
      <MobileBottomNav
        unreadRemindersCount={unreadRemindersCount}
        syncStatus={syncStatus}
        onOpenAddExpense={() => handleOpenAddWithFlow('expense')}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenReminderDrawer={() => setIsReminderDrawerOpen(true)}
        onOpenSyncModal={() => setIsSyncOpen(true)}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Modals & Slide-overs */}

      {/* 1. Add / Edit Expense & Income & Debt & Savings Modal */}
      <ExpenseFormModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
        availableScopes={availableScopes}
        onAddScope={handleAddScope}
        onEditScope={handleEditScope}
        onDeleteScope={handleDeleteScope}
        onOpenManageScopes={() => setIsManageScopesOpen(true)}
        customCategoriesByFlow={customCategoriesByFlow}
        onAddCustomCategory={handleAddCustomCategory}
        defaultFlowType={defaultModalFlow}
      />

      {/* 2. Manage Scopes Modal (Edit & Delete Kalangan) */}
      <ManageScopesModal
        isOpen={isManageScopesOpen}
        onClose={() => setIsManageScopesOpen(false)}
        availableScopes={availableScopes}
        expenses={expenses}
        onAddScope={handleAddScope}
        onEditScope={handleEditScope}
        onDeleteScope={handleDeleteScope}
        onResetScopes={handleResetScopes}
      />

      {/* 3. Export Modal (PDF & Excel) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        expenses={expenses}
        availableTypes={availableScopes}
      />

      {/* 4. Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onManualSync={handleManualSync}
        expenses={expenses}
        onRestoreBackup={handleRestoreBackup}
      />

      {/* 5. Reminder History Drawer */}
      <ReminderDrawer
        isOpen={isReminderDrawerOpen}
        onClose={() => setIsReminderDrawerOpen(false)}
        notifications={notifications}
        onClearAll={handleClearAllNotifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        dailyBudgetLimit={dailyBudgetLimit}
        onUpdateDailyLimit={handleUpdateDailyLimit}
        todayTotal={todayTotal}
      />

      {/* 6. Real-time Toast Reminder for Newly Entered Transactions */}
      <ReminderToast
        notification={activeToastNotification}
        onClose={() => setActiveToastNotification(null)}
        onOpenDrawer={() => {
          setActiveToastNotification(null);
          setIsReminderDrawerOpen(true);
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <KemenKeuKuApp />
    </ThemeProvider>
  );
}
