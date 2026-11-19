import { exportTransactionsCsv } from './dashboard.js';

export function downloadTransactionsCsv(transactions, date = new Date()) {
  const blob = new Blob([`\uFEFF${exportTransactionsCsv(transactions)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dashcash-transactions-${date.toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
