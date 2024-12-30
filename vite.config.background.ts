import { defineConfig } from 'vite';
import { isDev, r } from './scripts/utils';
import { sharedConfig } from './vite.config';

export default defineConfig({
  ...sharedConfig,
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: r('extension/dist/background'),
    cssCodeSplit: false,
    emptyOutDir: false,
    minify: isDev ? false: true,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src/background/index.ts'),
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
