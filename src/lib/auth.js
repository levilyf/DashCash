// Demo-only sign-in. This intentionally does not authenticate with Google.
import { startGoogleDemo } from './demo-auth.js';

export function signInWithGoogleDemo() {
  return startGoogleDemo();
}
