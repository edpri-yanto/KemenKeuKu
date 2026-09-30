export type TransactionFlow = 'expense' | 'income' | 'debt' | 'saving';

export type DebtDirection = 'payable' | 'receivable'; // payable = Utang saya, receivable = Piutang orang lain
export type DebtStatus = 'unpaid' | 'paid';

export interface Expense {
  id: string;
  flowType?: TransactionFlow; // 'expense' (default), 'income', 'debt', 'saving'
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: string;
  types: string[]; // Scope/Kalangan: 'Pribadi', 'Pelajar / Mahasiswa', 'Pedagang / Toko', 'UMKM / Bisnis', 'Kantor', etc.
  paymentMethod: string;
  notes?: string;
  
  // Utang / Piutang specific fields
  debtDirection?: DebtDirection;
  debtContact?: string; // Nama pihak / kontak
  debtDueDate?: string; // Tanggal jatuh tempo
  debtStatus?: DebtStatus; // 'unpaid' | 'paid'
  
  // Tabungan & Investasi specific fields (Pernikahan, Umroh, Emas, dll.)
  savingAccount?: string; // e.g., 'BSI Tabungan Haji', 'Emas Antam', 'Bibit Reksadana', 'BCA Pernikahan'
  savingTargetAmount?: number; // Target nominal impian (e.g. 50.000.000)

  createdAt: string;
  updatedAt: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface ReminderNotification {
  id: string;
  timestamp: string;
  expenseId: string;
  flowType?: TransactionFlow;
  title: string;
  amount: number;
  types: string[];
  message: string;
  category: string;
  read: boolean;
}

export interface BudgetLimit {
  dailyLimit: number;
  monthlyLimit: number;
  typeLimits: Record<string, number>;
  enabled: boolean;
}

export interface CloudSyncInfo {
  status: SyncStatus;
  lastSyncedAt: string | null;
  serverUrl: string;
  totalSynced: number;
  error?: string;
}

// Kalangan / Cakupan Pengguna Awal
export const INITIAL_DEFAULT_SCOPES: { id: string; label: string; description: string; color: string; bgLight: string; bgDark: string; border: string }[] = [
  { 
    id: 'Pribadi', 
    label: 'Pribadi', 
    description: 'Harian pribadi, rumah tangga & keluarga',
    color: 'text-emerald-700 dark:text-emerald-300', 
    bgLight: 'bg-emerald-100', 
    bgDark: 'dark:bg-emerald-950/60', 
    border: 'border-emerald-300 dark:border-emerald-800' 
  },
  { 
    id: 'Pelajar / Mahasiswa', 
    label: 'Pelajar / Mahasiswa', 
    description: 'Uang saku, kos, SPP, buku, kuliah/sekolah',
    color: 'text-cyan-700 dark:text-cyan-300', 
    bgLight: 'bg-cyan-100', 
    bgDark: 'dark:bg-cyan-950/60', 
    border: 'border-cyan-300 dark:border-cyan-800' 
  },
  { 
    id: 'Pedagang / Toko', 
    label: 'Pedagang / Toko', 
    description: 'Kulakan, kasir, toko kelontong, retail & warung',
    color: 'text-purple-700 dark:text-purple-300', 
    bgLight: 'bg-purple-100', 
    bgDark: 'dark:bg-purple-950/60', 
    border: 'border-purple-300 dark:border-purple-800' 
  },
  { 
    id: 'UMKM / Bisnis', 
    label: 'UMKM / Bisnis', 
    description: 'Usaha mikro, freelance, produksi & proyek',
    color: 'text-blue-700 dark:text-blue-300', 
    bgLight: 'bg-blue-100', 
    bgDark: 'dark:bg-blue-950/60', 
    border: 'border-blue-300 dark:border-blue-800' 
  },
  { 
    id: 'Kantor', 
    label: 'Kantor', 
    description: 'Operasional kantor, inventaris, ATK, dinas',
    color: 'text-amber-700 dark:text-amber-300', 
    bgLight: 'bg-amber-100', 
    bgDark: 'dark:bg-amber-950/60', 
    border: 'border-amber-300 dark:border-amber-800' 
  },
];

export const DEFAULT_TYPES = INITIAL_DEFAULT_SCOPES;

// Comprehensive categories for all life occasions (Pernikahan, Syukuran, Umroh/Haji, Emas, Usaha, dll.)
export const BASE_CATEGORIES_BY_FLOW: Record<TransactionFlow, string[]> = {
  expense: [
    'Makanan & Minuman',
    'Transportasi & Bensin',
    'Biaya Pernikahan & Lamaran',
    'Biaya Syukuran, Aqiqah & Qurban',
    'Operasional & Usaha',
    'Kulakan & Stok Toko',
    'Tagihan & Utilitas (Listrik/Air/Wifi)',
    'Belanja Kebutuhan & ATK',
    'Gaji, Upah & Honor Karyawan',
    'Sewa Tempat, Rumah & Pemeliharaan',
    'Pendidikan & Kursus (Kuliah/Sekolah)',
    'Kesehatan, Dokter & Obat',
    'Hiburan, Wisata & Liburan',
    'Sedekah, Zakat & Donasi',
    'Pajak & Administrasi',
    'Lain-lain',
  ],
  income: [
    'Gaji & Upah Tetap',
    'Omset Penjualan / Dagang Toko',
    'Uang Saku / Kiriman Orang Tua',
    'Amplop / Sumbangan Acara (Nikahan/Syukuran)',
    'Pendapatan Freelance & Jasa Proyek',
    'Keuntungan Usaha / Bagi Hasil',
    'Hasil Investasi, Dividen & Jual Emas',
    'Bonus, THR & Tunjangan',
    'Beasiswa & Hibah Belajar',
    'Pemasukan Lainnya',
  ],
  debt: [
    'Utang Kulakan / Supplier Toko',
    'Piutang Penjualan (Tempo Konsumen)',
    'Pinjaman Teman / Rekan Kerja',
    'Pinjaman Keluarga / Saudara',
    'Pinjaman Bank / Koperasi / Modal Usaha',
    'Cicilan Kendaraan / Gadai Emas',
    'Utang Acara / Perlengkapan',
    'Utang / Piutang Lainnya',
  ],
  saving: [
    'Tabungan Umroh & Haji',
    'Tabungan Pernikahan & Resepsi',
    'Tabungan Emas / Logam Mulia',
    'Tabungan Syukuran / Qurban / Aqiqah',
    'Investasi Reksadana & Saham',
    'Tabungan Dana Darurat',
    'Tabungan DP Rumah / Properti',
    'Tabungan Pendidikan Anak',
    'Celengan Target & Impian',
    'Deposito Perbankan',
    'Modal Cadangan Usaha Toko',
    'Tabungan Lainnya',
  ],
};

export const CATEGORIES_BY_FLOW = BASE_CATEGORIES_BY_FLOW;

export const PAYMENT_METHODS = [
  'Tunai',
  'Transfer Bank / VA',
  'QRIS / E-Wallet (GoPay/OVO/Dana/ShopeePay)',
  'Kartu Debit',
  'Kartu Kredit',
  'Tabungan / Emas',
  'Tempo / Bertahap',
];
