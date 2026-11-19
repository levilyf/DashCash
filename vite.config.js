import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Lightning CSS does not currently ship a binary for Termux/Android ARM.
  build: { cssMinify: false },
});
