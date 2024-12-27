import { defineConfig } from 'vite';
import { isDev, r } from './scripts/utils';

export default defineConfig({
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: r('extension/dist'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    rollupOptions: {
      input: {
        popup: r('src/popup/index.html'),
        chart: r('src/chart/index.html')
      },
    },
  }
});
