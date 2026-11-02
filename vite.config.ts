import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contentStudioPlugin } from './server/content-studio-plugin';

export default defineConfig({
  base: '/',
  plugins: [react(), contentStudioPlugin()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
  },
});
