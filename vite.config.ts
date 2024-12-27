import { defineConfig } from 'vite';
import { isDev, r, port } from './scripts/utils';
import Vue from '@vitejs/plugin-vue'


export const sharedConfig = {
  root: r("src"),
  plugins:[Vue()],
}

export default defineConfig(({command}) =>({
  ...sharedConfig,
  // base: isDev ? `http://localhost:${port}/` : '/dist/',
  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    port,
  },
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
}));
