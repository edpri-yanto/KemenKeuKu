import { Expense, SyncStatus } from '../types/expense';

const LOCAL_STORAGE_KEY = 'kemenkeuku_expenses_cache';
const LAST_SYNC_KEY = 'kemenkeuku_last_sync_time';

export class CloudSyncService {
  private static instance: CloudSyncService;
  private syncStatus: SyncStatus = 'synced';
  private lastSyncedAt: string | null = null;
  private statusListeners: ((status: SyncStatus, lastSyncedAt: string | null) => void)[] = [];

  private constructor() {
    this.lastSyncedAt = localStorage.getItem(LAST_SYNC_KEY);
  }

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  public subscribe(listener: (status: SyncStatus, lastSyncedAt: string | null) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.syncStatus, this.lastSyncedAt);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.statusListeners.forEach(listener => listener(this.syncStatus, this.lastSyncedAt));
  }

  private setStatus(status: SyncStatus, syncedAt?: string): void {
    this.syncStatus = status;
    if (syncedAt) {
      this.lastSyncedAt = syncedAt;
      localStorage.setItem(LAST_SYNC_KEY, syncedAt);
    }
    this.notify();
  }

  public getStatus(): { status: SyncStatus; lastSyncedAt: string | null } {
    return { status: this.syncStatus, lastSyncedAt: this.lastSyncedAt };
  }

  /**
   * Load local cached expenses
   */
  public getLocalExpenses(): Expense[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Save expenses directly to local storage cache
   */
  public saveLocalExpenses(expenses: Expense[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  }

  /**
   * Initial fetch from Cloud, falls back to local cache if offline
   */
  public async fetchInitialExpenses(): Promise<Expense[]> {
    this.setStatus('syncing');
    try {
      const res = await fetch('/api/expenses', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.expenses)) {
        this.saveLocalExpenses(data.expenses);
        this.setStatus('synced', data.lastSyncedAt || new Date().toISOString());
        return data.expenses;
      }
      throw new Error('Format data cloud tidak valid');
    } catch (err) {
      console.warn('Gagal memuat data dari cloud server, menggunakan cache lokal:', err);
      this.setStatus('offline');
      return this.getLocalExpenses();
    }
  }

  /**
   * Syncs local dataset with cloud backend via /api/sync
   */
  public async syncWithCloud(localExpenses: Expense[]): Promise<Expense[]> {
    this.setStatus('syncing');
    this.saveLocalExpenses(localExpenses);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses: localExpenses,
          lastClientSync: this.lastSyncedAt,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.expenses)) {
        this.saveLocalExpenses(data.expenses);
        this.setStatus('synced', data.lastSyncedAt);
        return data.expenses;
      }
      throw new Error('Data sync response invalid');
    } catch (err) {
      console.warn('Sync gagal atau offline:', err);
      this.setStatus('offline');
      return localExpenses;
    }
  }

  /**
   * Quick single expense create sync
   */
  public async addExpense(expense: Expense, currentList: Expense[]): Promise<Expense[]> {
    const updated = [expense, ...currentList];
    this.saveLocalExpenses(updated);
    this.setStatus('syncing');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });

      if (res.ok) {
        const data = await res.json();
        this.setStatus('synced', data.lastSyncedAt || new Date().toISOString());
      } else {
        this.setStatus('offline');
      }
    } catch {
      this.setStatus('offline');
    }

    return updated;
  }

  /**
   * Quick single expense update sync
   */
  public async updateExpense(expense: Expense, currentList: Expense[]): Promise<Expense[]> {
    const updated = currentList.map(e => (e.id === expense.id ? expense : e));
    this.saveLocalExpenses(updated);
    this.setStatus('syncing');

    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });

      if (res.ok) {
        const data = await res.json();
        this.setStatus('synced', data.lastSyncedAt || new Date().toISOString());
      } else {
        this.setStatus('offline');
      }
    } catch {
      this.setStatus('offline');
    }

    return updated;
  }

  /**
   * Quick single expense delete sync
   */
  public async deleteExpense(id: string, currentList: Expense[]): Promise<Expense[]> {
    const updated = currentList.filter(e => e.id !== id);
    this.saveLocalExpenses(updated);
    this.setStatus('syncing');

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        this.setStatus('synced', data.lastSyncedAt || new Date().toISOString());
      } else {
        this.setStatus('offline');
      }
    } catch {
      this.setStatus('offline');
    }

    return updated;
  }

  /**
   * Restores data from JSON file snapshot
   */
  public async restoreFromBackup(expenses: Expense[]): Promise<Expense[]> {
    this.saveLocalExpenses(expenses);
    return this.syncWithCloud(expenses);
  }
}

export const cloudSync = CloudSyncService.getInstance();
