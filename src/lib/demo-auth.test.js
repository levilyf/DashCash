import test from 'node:test';
import assert from 'node:assert/strict';
import { startGoogleDemo } from './demo-auth.js';

test('demo sign-in identifies itself as a simulation and returns a sample account', () => {
  const account = startGoogleDemo();
  assert.equal(account.name, 'Demo Owner');
  assert.equal(account.email, 'demo@example.test');
  assert.equal(account.mode, 'demo');
});
