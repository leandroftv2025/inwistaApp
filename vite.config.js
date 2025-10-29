import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index-modular.html'),
      },
    },
  },
  server: {
    port: 5000,
    host: '0.0.0.0', // Permite acesso externo (VM → MacBook)
    open: '/index-modular.html',
  },
  preview: {
    port: 5000,
    host: '0.0.0.0', // Permite acesso externo (VM → MacBook)
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@store': resolve(__dirname, 'src/store'),
      '@data': resolve(__dirname, 'src/data'),
    },
  },
});
