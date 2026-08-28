import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    sourcemap: true,
  },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
