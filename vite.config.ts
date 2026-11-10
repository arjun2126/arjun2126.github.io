import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contentStudioPlugin } from './server/content-studio-plugin';

export default defineConfig({
  base: '/',
  plugins: [react(), contentStudioPlugin()],
  server: {
    fs: {
      // Vite replaces (rather than extends) this array. Retain every Vite 6
      // default; the regression test compares it with Vite's resolved defaults.
      // Local documents are served only through Studio's loopback-only route.
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/*.key', '**/content-studio/**'],
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
  },
});
