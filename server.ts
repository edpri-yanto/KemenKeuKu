import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'cloud-expenses.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    version: 1,
    lastSyncedAt: new Date().toISOString(),
    expenses: [
      {
        id: "trx-demo-1",
        title: "Makan Siang & Rapat Proyek",
        amount: 85000,
        date: new Date().toISOString().split('T')[0],
        time: "12:30",
        category: "Makanan & Minuman",
        types: ["Pribadi", "Bisnis"],
        paymentMethod: "QRIS / E-Wallet",
        notes: "Makan siang sekalian diskusi brief proyek baru",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "trx-demo-2",
        title: "Kertas & Tinta Printer Kantor",
        amount: 240000,
        date: new Date().toISOString().split('T')[0],
        time: "10:15",
        category: "Operasional",
        types: ["Kantor"],
        paymentMethod: "Transfer Bank",
        notes: "Restock kertas A4 3 rim dan tinta hitam",
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: "trx-demo-3",
        title: "Restock Barang Dagangan Toko",
        amount: 1250000,
        date: new Date().toISOString().split('T')[0],
        time: "09:00",
        category: "Modal & Stok Toko",
        types: ["Bisnis", "Toko"],
        paymentMethod: "Transfer Bank",
        notes: "Kulakan dari distributor utama",
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: "trx-demo-4",
        title: "Bensin Motor Operasional",
        amount: 45000,
        date: new Date().toISOString().split('T')[0],
        time: "08:10",
        category: "Transportasi",
        types: ["Pribadi", "Kantor"],
        paymentMethod: "Tunai",
        notes: "Isi Pertamax untuk mobilitas harian",
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ]
  }, null, 2));
}

app.use(express.json({ limit: '10mb' }));

// Helper to read cloud data
function getCloudData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { version: 1, lastSyncedAt: new Date().toISOString(), expenses: [] };
  }
}

// Helper to write cloud data
function saveCloudData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Cloud API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'KemenKeuKu Cloud Backend', timestamp: new Date().toISOString() });
});

// GET /api/expenses
app.get('/api/expenses', (_req, res) => {
  const data = getCloudData();
  res.json({
    success: true,
    lastSyncedAt: data.lastSyncedAt,
    count: data.expenses.length,
    expenses: data.expenses,
  });
});

// POST /api/expenses
app.post('/api/expenses', (req, res) => {
  const expense = req.body;
  if (!expense || !expense.title || expense.amount === undefined) {
    res.status(400).json({ success: false, error: 'Judul dan nominal wajib diisi' });
    return;
  }
  const data = getCloudData();
  const newExpense = {
    ...expense,
    id: expense.id || `trx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    createdAt: expense.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.expenses.unshift(newExpense);
  data.lastSyncedAt = new Date().toISOString();
  saveCloudData(data);
  res.json({ success: true, expense: newExpense, lastSyncedAt: data.lastSyncedAt });
});

// PUT /api/expenses/:id
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const updatedExpense = req.body;
  const data = getCloudData();
  const index = data.expenses.findIndex((item: any) => item.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
    return;
  }
  data.expenses[index] = {
    ...data.expenses[index],
    ...updatedExpense,
    updatedAt: new Date().toISOString(),
  };
  data.lastSyncedAt = new Date().toISOString();
  saveCloudData(data);
  res.json({ success: true, expense: data.expenses[index], lastSyncedAt: data.lastSyncedAt });
});

// DELETE /api/expenses/:id
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const data = getCloudData();
  data.expenses = data.expenses.filter((item: any) => item.id !== id);
  data.lastSyncedAt = new Date().toISOString();
  saveCloudData(data);
  res.json({ success: true, lastSyncedAt: data.lastSyncedAt });
});

// POST /api/sync - Bidirectional synchronization with conflict resolution
app.post('/api/sync', (req, res) => {
  const clientData = req.body; // { clientExpenses: Expense[], lastClientSync: string }
  const cloudData = getCloudData();
  const clientExpenses = Array.isArray(clientData.expenses) ? clientData.expenses : [];
  
  // Merge logic: index by id
  const mergedMap = new Map<string, any>();

  // Add all cloud expenses
  for (const exp of cloudData.expenses) {
    mergedMap.set(exp.id, exp);
  }

  // Merge client expenses (client changes take precedence if newer updatedAt)
  for (const clientExp of clientExpenses) {
    const existing = mergedMap.get(clientExp.id);
    if (!existing) {
      mergedMap.set(clientExp.id, clientExp);
    } else {
      const clientTime = new Date(clientExp.updatedAt || clientExp.createdAt || 0).getTime();
      const cloudTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      if (clientTime >= cloudTime) {
        mergedMap.set(clientExp.id, clientExp);
      }
    }
  }

  const mergedList = Array.from(mergedMap.values()).sort((a, b) => {
    return new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime();
  });

  const now = new Date().toISOString();
  cloudData.expenses = mergedList;
  cloudData.lastSyncedAt = now;
  saveCloudData(cloudData);

  res.json({
    success: true,
    lastSyncedAt: now,
    totalRecords: mergedList.length,
    expenses: mergedList,
  });
});

// POST /api/cloud-backup - Replace or restore
app.post('/api/cloud-backup/restore', (req, res) => {
  const { expenses } = req.body;
  if (!Array.isArray(expenses)) {
    res.status(400).json({ success: false, error: 'Data backup tidak valid' });
    return;
  }
  const now = new Date().toISOString();
  const cloudData = {
    version: 1,
    lastSyncedAt: now,
    expenses,
  };
  saveCloudData(cloudData);
  res.json({ success: true, count: expenses.length, lastSyncedAt: now });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server KemenKeuKu berjalan pada port ${PORT}`);
  });
}

startServer();
