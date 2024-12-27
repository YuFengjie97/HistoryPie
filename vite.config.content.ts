import { defineConfig } from 'vite';
import { isDev, r } from './scripts/utils';

export default defineConfig({
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: r('extension/dist/content'),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src/content/index.ts'),
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
