import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        demo: new URL('./demo/index.html', import.meta.url).pathname,
        privacy: new URL('./privacy/index.html', import.meta.url).pathname,
        terms: new URL('./terms/index.html', import.meta.url).pathname,
        notFound: new URL('./404.html', import.meta.url).pathname,
      }
    }
  },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
