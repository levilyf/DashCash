import test from 'node:test';
import assert from 'node:assert/strict';
import { getPeriodBounds, getTrendBuckets } from './dashboard.js';

test('period bounds and buckets use honest date-only ranges', () => {
  const range = getPeriodBounds('this-month', new Date(2025, 2, 12));
  assert.deepEqual(range, { from: '2025-03-01', to: '2025-03-31' });
  assert.equal(getTrendBuckets([], range, 4).length, 4);
});
