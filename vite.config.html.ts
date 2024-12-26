import { defineConfig } from 'vite';
import {resolve} from 'path'
import { isDev } from './scripts/utils';

export default defineConfig({
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: resolve(__dirname, './dist'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, './src/popup/index.html'),
        chart: resolve(__dirname, 'html/chart/index.html')
      },
    },
  }
});
