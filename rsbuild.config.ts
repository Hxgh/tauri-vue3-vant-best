import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import Components from 'unplugin-vue-components/rspack';
import { VantResolver } from '@vant/auto-import-resolver';

export default defineConfig({
  plugins: [pluginVue()],
  server: {
    port: 1420,
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
