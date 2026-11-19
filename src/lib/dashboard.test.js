import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardMetrics, filterTransactions, getCategoryTotals, formatCurrency, getPeriodBounds, getTrendBuckets, exportTransactionsCsv } from './dashboard.js';

test('filters transactions by search, type, category, and inclusive date range', () => {
  const records = [
    { type: 'income', name: 'Client project', category: 'Services', date: '2025-03-04', amountMinor: 12000 },
    { type: 'expense', name: 'Office supplies', category: 'Supplies', date: '2025-03-05', amountMinor: 3500 },
    { type: 'expense', name: 'Cloud software', category: 'Software', date: '2025-03-10', amountMinor: 2100 },
  ];
  assert.deepEqual(filterTransactions(records, { query: 'office', type: 'expense' }), [records[1]]);
  assert.deepEqual(filterTransactions(records, { category: 'Software', from: '2025-03-06', to: '2025-03-10' }), [records[2]]);
  assert.deepEqual(filterTransactions(records, { from: '2025-03-05', to: '2025-03-05' }), [records[1]]);
});

test('calculates category totals from recorded expenses only', () => {
  const records = [
    { type: 'income', category: 'Services', amountMinor: 9000 },
    { type: 'expense', category: 'Supplies', amountMinor: 3000 },
    { type: 'expense', category: 'Supplies', amountMinor: 2000 },
    { type: 'expense', category: 'Rent', amountMinor: 7000 },
  ];
  assert.deepEqual(getCategoryTotals(records), [
    { category: 'Rent', amountMinor: 7000 },
    { category: 'Supplies', amountMinor: 5000 },
  ]);
});

test('formats INR using Indian digit grouping and never uses float storage', () => {
  assert.equal(formatCurrency(123456789, 'INR', 'en-IN'), '₹12,34,567.89');
});

test('period bounds support this month, last month and last 30 days', () => {
  assert.deepEqual(getPeriodBounds('this-month', new Date('2025-03-12T12:00:00Z')), { from: '2025-03-01', to: '2025-03-31' });
  assert.deepEqual(getPeriodBounds('last-month', new Date('2025-03-12T12:00:00Z')), { from: '2025-02-01', to: '2025-02-28' });
  assert.deepEqual(getPeriodBounds('last-30-days', new Date('2025-03-31T12:00:00Z')), { from: '2025-03-02', to: '2025-03-31' });
});

test('trend buckets include only recorded transactions for the selected period', () => {
  const records = [
    { type: 'income', amountMinor: 5000, date: '2025-03-01' },
    { type: 'expense', amountMinor: 1200, date: '2025-03-01' },
    { type: 'income', amountMinor: 7000, date: '2025-03-31' },
    { type: 'income', amountMinor: 9000, date: '2025-02-28' },
  ];
  assert.deepEqual(getTrendBuckets(records, { from: '2025-03-01', to: '2025-03-31' }, 2), [
    { from: '2025-03-01', to: '2025-03-15', incomeMinor: 5000, expenseMinor: 1200 },
    { from: '2025-03-16', to: '2025-03-31', incomeMinor: 7000, expenseMinor: 0 }
  ]);
  assert.deepEqual(getTrendBuckets([], { from: '2025-03-01', to: '2025-03-31' }, 2).map(({incomeMinor, expenseMinor})=>[incomeMinor,expenseMinor]), [[0,0],[0,0]]);
});

test('CSV export escapes delimiters, newlines and spreadsheet formulas', () => {
  const csv = exportTransactionsCsv([{date:'2025-03-01',type:'expense',name:'=2+2, supplies',category:'Office',amountMinor:1234,currency:'INR',note:'line 1\nline 2'}]);
  assert.equal(csv, `Date,Type,Description,Category,Amount,Currency,Note\r\n2025-03-01,expense,"'=2+2, supplies",Office,12.34,INR,"line 1\nline 2"`);
});

test('dashboard metrics are zero when there are no user transactions', () => {
  assert.deepEqual(getDashboardMetrics([]), { incomeMinor: 0, expenseMinor: 0, netMinor: 0 });
});

test('dashboard metrics recompute from manual transaction entries', () => {
  assert.deepEqual(getDashboardMetrics([
    { type: 'income', amountMinor: 10000 },
    { type: 'expense', amountMinor: 2500 },
  ]), { incomeMinor: 10000, expenseMinor: 2500, netMinor: 7500 });
});
