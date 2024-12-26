import { defineConfig } from 'vite';
import { resolve } from 'path'
import { isDev } from './scripts/utils';

export default defineConfig({
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: resolve(__dirname, './dist/background'),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: resolve(__dirname, './src/background/index.ts'),
      name: "background",
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.mjs',
        extend: true,
      },
    },
  },
});
