import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import Components from 'unplugin-vue-components/rspack';
import { VantResolver } from '@vant/auto-import-resolver';
import path from 'node:path';

export default defineConfig({
  plugins: [pluginVue()],
  server: {
    port: 1420,
    open: false,
  },
  source: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  tools: {
    rspack: {
      plugins: [
        Components({
          resolvers: [VantResolver()],
        }),
      ],
    },
  },
});
