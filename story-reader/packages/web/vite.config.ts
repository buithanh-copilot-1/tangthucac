/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // VITE_BASE_PATH is set by GitHub Actions for GitHub Pages project sites (e.g. /repo-name/)
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 4444,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@story-reader/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
