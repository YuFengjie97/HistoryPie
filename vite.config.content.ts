import { defineConfig } from 'vite';
import { resolve } from 'path'
import { isDev } from './scripts/utils';

export default defineConfig({
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: resolve(__dirname, './dist/content'),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: resolve(__dirname, './src/content/index.ts'),
      name: "content",
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
