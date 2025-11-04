import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './index.css';
import './styles/safe-area.css';
import './styles/theme.css';

// 引入 Vant 全局样式
import 'vant/lib/index.css';

// 引入主题 store
import { useThemeStore } from './stores/theme';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);

// 在挂载前初始化主题（确保首屏无闪烁）
const themeStore = useThemeStore();
themeStore.initTheme();

app.mount('#root');
