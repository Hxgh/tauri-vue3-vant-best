import { createPinia } from 'pinia';
import { createApp, nextTick } from 'vue';
import App from './App.vue';
import router from './router/index';

// 引入 Vant 全局样式（先加载，避免覆盖主题）
import 'vant/lib/index.css';

// 引入应用样式（按顺序加载）
import './index.css';
import '@/core/layout/styles/safe-area.css';
import '@/core/theme/styles/theme.css';

// 引入主题 store
import { useThemeStore } from '@/core/theme';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

// 先挂载应用，确保 DOM 准备好
app.mount('#root');

// DOM 挂载后初始化主题（确保 matchMedia 正确工作）
// 使用 nextTick 确保 Vue 渲染完成
nextTick(() => {
  const themeStore = useThemeStore();
  themeStore.initTheme();
});
