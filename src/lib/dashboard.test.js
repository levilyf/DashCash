import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardMetrics } from './dashboard.js';

test('dashboard metrics are zero when there are no user transactions', () => {
  assert.deepEqual(getDashboardMetrics([]), { incomeMinor: 0, expenseMinor: 0, netMinor: 0 });
});

test('dashboard metrics recompute from manual transaction entries', () => {
  assert.deepEqual(getDashboardMetrics([
    { type: 'income', amountMinor: 10000 },
    { type: 'expense', amountMinor: 2500 },
  ]), { incomeMinor: 10000, expenseMinor: 2500, netMinor: 7500 });
});
