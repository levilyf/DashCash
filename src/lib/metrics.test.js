import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePeriodTotals, parseAmountToMinorUnits } from './metrics.js';

test('parses decimal amounts into integer minor units', () => {
  assert.equal(parseAmountToMinorUnits('12.34', 2), 1234);
  assert.equal(parseAmountToMinorUnits('7', 2), 700);
});

test('rejects invalid, negative, zero, or over-precise amounts', () => {
  for (const amount of ['', '0', '-1.00', '1.001', 'abc']) {
    assert.throws(() => parseAmountToMinorUnits(amount, 2));
  }
});

test('calculates inclusive date-range totals and net cash flow in minor units', () => {
  const transactions = [
    { type: 'income', amountMinor: 10000, date: '2026-06-01' },
    { type: 'expense', amountMinor: 2500, date: '2026-06-30' },
    { type: 'income', amountMinor: 9000, date: '2026-07-01' },
  ];
  assert.deepEqual(calculatePeriodTotals(transactions, '2026-06-01', '2026-06-30'), {
    incomeMinor: 10000,
    expenseMinor: 2500,
    netMinor: 7500,
  });
});

test('returns zero totals for an empty period', () => {
  assert.deepEqual(calculatePeriodTotals([], '2026-06-01', '2026-06-30'), {
    incomeMinor: 0,
    expenseMinor: 0,
    netMinor: 0,
  });
});
