export function getDashboardMetrics(transactions) {
  const incomeMinor = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amountMinor, 0);
  const expenseMinor = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amountMinor, 0);
  return { incomeMinor, expenseMinor, netMinor: incomeMinor - expenseMinor };
}


export function filterTransactions(transactions, filters = {}) {
  const query = (filters.query || '').trim().toLocaleLowerCase();
  return transactions.filter((item) => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.from && item.date < filters.from) return false;
    if (filters.to && item.date > filters.to) return false;
    if (query && !`${item.name || ''} ${item.category || ''} ${item.note || ''}`.toLocaleLowerCase().includes(query)) return false;
    return true;
  });
}

export function getCategoryTotals(transactions) {
  const totals = new Map();
  for (const item of transactions) {
    if (item.type !== 'expense') continue;
    const category = item.category || 'Other';
    totals.set(category, (totals.get(category) || 0) + item.amountMinor);
  }
  return [...totals.entries()]
    .map(([category, amountMinor]) => ({ category, amountMinor }))
    .sort((a, b) => b.amountMinor - a.amountMinor || a.category.localeCompare(b.category));
}

export function formatCurrency(amountMinor, currency = 'INR', locale = 'en-IN') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(amountMinor / 100);
}

export function getPeriodBounds(period, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  if (period === 'last-month') return { from: iso(new Date(year, month - 1, 1)), to: iso(new Date(year, month, 0)) };
  if (period === 'last-30-days') {
    const to = new Date(year, month, now.getDate());
    const from = new Date(year, month, now.getDate() - 29);
    return { from: iso(from), to: iso(to) };
  }
  if (period === 'this-month') return { from: iso(new Date(year, month, 1)), to: iso(new Date(year, month + 1, 0)) };
  throw new RangeError(`Unsupported period: ${period}`);
}

export function getTrendBuckets(transactions, range, bucketCount = 12) {
  if (!Number.isInteger(bucketCount) || bucketCount < 1 || bucketCount > 60) throw new RangeError('bucketCount must be between 1 and 60');
  const start = new Date(`${range.from}T00:00:00Z`);
  const end = new Date(`${range.to}T00:00:00Z`);
  const dayMs = 86400000;
  const span = Math.floor((end - start) / dayMs) + 1;
  if (span < 1) throw new RangeError('range.to must be on or after range.from');
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const fromDay = Math.floor(index * span / bucketCount);
    const toDay = Math.floor((index + 1) * span / bucketCount) - 1;
    return {
      from: new Date(start.getTime() + fromDay * dayMs).toISOString().slice(0, 10),
      to: new Date(start.getTime() + Math.max(fromDay, toDay) * dayMs).toISOString().slice(0, 10),
      incomeMinor: 0,
      expenseMinor: 0,
    };
  });
  for (const item of transactions) {
    if (item.date < range.from || item.date > range.to) continue;
    const day = Math.floor((new Date(`${item.date}T00:00:00Z`) - start) / dayMs);
    const index = Math.min(bucketCount - 1, Math.floor(day * bucketCount / span));
    if (item.type === 'income') buckets[index].incomeMinor += item.amountMinor;
    if (item.type === 'expense') buckets[index].expenseMinor += item.amountMinor;
  }
  return buckets;
}

function csvCell(value) {
  let string = String(value ?? '');
  if (/^[\s]*[=+@\-]/.test(string)) string = `'${string}`;
  return /[",\r\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

export function exportTransactionsCsv(transactions) {
  const rows = [['Date', 'Type', 'Description', 'Category', 'Amount', 'Currency', 'Note']];
  for (const item of transactions) {
    rows.push([item.date, item.type, item.name, item.category, (item.amountMinor / 100).toFixed(2), item.currency, item.note]);
  }
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
