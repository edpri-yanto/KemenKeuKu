import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Expense } from '../types/expense';
import { formatDateIndo, formatRupiah } from './formatters';

interface ExportMetadata {
  title?: string;
  filterTypes?: string[];
  flowFilter?: string;
  dateRangeLabel?: string;
  startDate?: string;
  endDate?: string;
  categoryFilter?: string;
}

/**
 * Exports financial records to professional PDF report
 */
export function exportExpensesToPDF(expenses: Expense[], meta?: ExportMetadata): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  let totalIncome = 0;
  let totalExpense = 0;
  let totalPayableDebt = 0;
  let totalSavings = 0;

  expenses.forEach(e => {
    const flow = e.flowType || 'expense';
    if (flow === 'income') totalIncome += e.amount;
    else if (flow === 'expense') totalExpense += e.amount;
    else if (flow === 'debt' && e.debtStatus !== 'paid' && e.debtDirection === 'payable') totalPayableDebt += e.amount;
    else if (flow === 'saving') totalSavings += e.amount;
  });

  const netBalance = totalIncome - totalExpense;

  // Top header bar (Emerald green)
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageWidth, 18, 'F');

  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 18, pageWidth, 2, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text('KEMENKEUKU - LAPORAN KEUANGAN MULTI-SEGMEN', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Pencatatan Keuangan: Pribadi • Pelajar/Mahasiswa • Toko • UMKM • Kantor', 14, 15.5);

  // Meta Box
  let currentY = 26;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(8.5);

  const printDate = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const filterText = meta?.filterTypes && meta.filterTypes.length > 0 
    ? meta.filterTypes.join(', ') 
    : 'Semua Kalangan (Pribadi, Pelajar, Toko, UMKM, Kantor)';

  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI & PARAMETER LAPORAN', 14, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 4.5;

  doc.text(`Periode: ${meta?.dateRangeLabel || 'Semua Data Transaksi'}`, 14, currentY);
  doc.text(`Dicetak: ${printDate}`, pageWidth - 14, currentY, { align: 'right' });
  currentY += 4.5;
  doc.text(`Cakupan: ${filterText}`, 14, currentY);
  doc.text(`Total Transaksi: ${expenses.length} data`, pageWidth - 14, currentY, { align: 'right' });
  currentY += 6;

  // Executive summary card (4 metrics)
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');

  // Col 1: Pemasukan
  doc.text('TOTAL PEMASUKAN', 18, currentY + 6);
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(10.5);
  doc.text(`+${formatRupiah(totalIncome)}`, 18, currentY + 13);

  // Col 2: Pengeluaran
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('TOTAL PENGELUARAN', 68, currentY + 6);
  doc.setTextColor(225, 29, 72);
  doc.setFontSize(10.5);
  doc.text(`-${formatRupiah(totalExpense)}`, 68, currentY + 13);

  // Col 3: Saldo Bersih
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('SALDO BERSIH (KAS)', 118, currentY + 6);
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10.5);
  doc.text(formatRupiah(netBalance), 118, currentY + 13);

  // Col 4: Utang & Tabungan
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('UTANG / TABUNGAN', 160, currentY + 6);
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(8.5);
  doc.text(`Utang: ${formatRupiah(totalPayableDebt)}`, 160, currentY + 11);
  doc.text(`Tab: ${formatRupiah(totalSavings)}`, 160, currentY + 15.5);

  currentY += 27;

  // Table rows
  const tableRows = expenses.map((item, idx) => {
    const flow = item.flowType || 'expense';
    const flowLabel = flow === 'income' ? 'Pemasukan' : flow === 'debt' ? 'Utang/Piutang' : flow === 'saving' ? 'Tabungan' : 'Pengeluaran';
    return [
      (idx + 1).toString(),
      `${formatDateIndo(item.date)} ${item.time || ''}`,
      flowLabel,
      item.title + (item.debtContact ? ` (${item.debtContact})` : ''),
      item.category,
      item.types.join(', '),
      item.paymentMethod,
      (flow === 'income' ? '+' : flow === 'expense' ? '-' : '') + formatRupiah(item.amount),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Tanggal', 'Tipe', 'Keterangan', 'Kategori', 'Kalangan', 'Metode', 'Nominal']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [33, 37, 41],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 20 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 24 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 },
      7: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    didDrawPage: () => {
      const str = `Halaman ${doc.getNumberOfPages()} | KemenKeuKu Cloud Verified Report`;
      doc.setFontSize(7.5);
      doc.setTextColor(150);
      doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < doc.internal.pageSize.getHeight() - 30) {
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text('Dokumen ini dibuat otomatis oleh KemenKeuKu. Kompatibel untuk harian, pelajar, toko, UMKM, dan kantor.', 14, finalY);
  }

  const filename = `KemenKeuKu_Laporan_${meta?.startDate || new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Exports financial records to structured multi-sheet Excel file (.xlsx)
 */
export function exportExpensesToExcel(expenses: Expense[], meta?: ExportMetadata): void {
  const wb = XLSX.utils.book_new();

  // 1. Data Transaksi Sheet
  const rows = expenses.map((item, idx) => ({
    'No': idx + 1,
    'Tipe Transaksi': item.flowType === 'income' ? 'Pemasukan' : item.flowType === 'debt' ? 'Utang/Piutang' : item.flowType === 'saving' ? 'Tabungan' : 'Pengeluaran',
    'Tanggal': item.date,
    'Jam': item.time || '',
    'Keterangan Transaksi': item.title,
    'Nominal (Rp)': item.amount,
    'Kategori': item.category,
    'Kalangan (Scope)': item.types.join(', '),
    'Pihak Kontak (Utang)': item.debtContact || '',
    'Status Utang': item.flowType === 'debt' ? (item.debtStatus === 'paid' ? 'Lunas' : 'Belum Lunas') : '',
    'Jatuh Tempo': item.debtDueDate || '',
    'Akun Tabungan': item.savingAccount || '',
    'Metode Pembayaran': item.paymentMethod,
    'Catatan': item.notes || '',
    'ID Transaksi': item.id,
  }));

  const wsTransaksi = XLSX.utils.json_to_sheet(rows);
  wsTransaksi['!cols'] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 12 },
    { wch: 8 },
    { wch: 32 },
    { wch: 16 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 26 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTransaksi, 'Daftar Transaksi');

  // 2. Ringkasan Arus Kas Sheet
  let totalIncome = 0;
  let totalExpense = 0;
  let totalPayableDebt = 0;
  let totalReceivableDebt = 0;
  let totalSavings = 0;

  expenses.forEach(e => {
    const flow = e.flowType || 'expense';
    if (flow === 'income') totalIncome += e.amount;
    else if (flow === 'expense') totalExpense += e.amount;
    else if (flow === 'debt') {
      if (e.debtStatus !== 'paid') {
        if (e.debtDirection === 'payable') totalPayableDebt += e.amount;
        else totalReceivableDebt += e.amount;
      }
    } else if (flow === 'saving') totalSavings += e.amount;
  });

  const summaryRows = [
    { 'Metrik Arus Kas': 'Total Pemasukan', 'Nilai (Rp)': totalIncome },
    { 'Metrik Arus Kas': 'Total Pengeluaran', 'Nilai (Rp)': totalExpense },
    { 'Metrik Arus Kas': 'Saldo Bersih (Kas)', 'Nilai (Rp)': totalIncome - totalExpense },
    { 'Metrik Arus Kas': 'Utang yang Harus Dibayar (Belum Lunas)', 'Nilai (Rp)': totalPayableDebt },
    { 'Metrik Arus Kas': 'Piutang Tertagih (Belum Diterima)', 'Nilai (Rp)': totalReceivableDebt },
    { 'Metrik Arus Kas': 'Total Tabungan & Investasi', 'Nilai (Rp)': totalSavings },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 40 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Kas');

  // 3. Rekapitulasi per Kalangan / Jenis
  const typeMap: Record<string, { count: number; total: number }> = {};
  expenses.forEach(e => {
    e.types.forEach(t => {
      if (!typeMap[t]) typeMap[t] = { count: 0, total: 0 };
      typeMap[t].count += 1;
      typeMap[t].total += e.amount;
    });
  });

  const rekapKalangan = Object.entries(typeMap).map(([jenis, data], idx) => ({
    'No': idx + 1,
    'Kalangan / Jenis': jenis,
    'Jumlah Transaksi': data.count,
    'Total Perputaran (Rp)': data.total,
  }));

  const wsKalangan = XLSX.utils.json_to_sheet(rekapKalangan);
  wsKalangan['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 18 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, wsKalangan, 'Rekap per Kalangan');

  const filename = `KemenKeuKu_Laporan_${meta?.startDate || new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
