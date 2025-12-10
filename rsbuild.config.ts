import path from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { VantResolver } from '@vant/auto-import-resolver';
import Components from 'unplugin-vue-components/rspack';

export default defineConfig({
  plugins: [pluginVue()],
  server: {
    port: 1234,
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
          dts: 'src/components.d.ts', // 生成到 src 目录
        }),
      ],
    },
  },
});
