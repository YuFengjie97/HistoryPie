import { defineConfig } from 'vite';
import { isDev, r } from './scripts/utils';
import { sharedConfig } from './vite.config';

export default defineConfig({
  ...sharedConfig,
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: r('extension/dist/content'),
    cssCodeSplit: false,
    emptyOutDir: false,
    minify: isDev ? false: true,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src/content/index.ts'),
      name: "content",
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.global.js',
        extend: true,
      },
    },
  },
});
