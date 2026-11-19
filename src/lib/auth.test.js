import test from 'node:test';
import assert from 'node:assert/strict';
import { signInWithGoogleDemo } from './auth.js';

test('demo sign-in returns sample profile without contacting an OAuth provider', () => {
  const account = signInWithGoogleDemo();
  assert.equal(account.mode, 'demo');
  assert.equal(account.email, 'demo@example.test');
});
