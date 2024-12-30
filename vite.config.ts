import { defineConfig } from 'vite';
import { isDev, r, port } from './scripts/utils';
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export const sharedConfig = {
  root: r("src"),
  plugins: [Vue(),
  AutoImport({
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  }),],
}

export default defineConfig(({ command }) => ({
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
