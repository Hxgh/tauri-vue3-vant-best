import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// 路由元数据类型定义
export interface RouteMeta {
  /** 是否显示Header */
  showHeader?: boolean;
  /** Header标题 */
  headerTitle?: string;
  /** 内容是否延伸到屏幕顶部（沉浸式） */
  extendToTop?: boolean;
  /** Tab索引，用于Tabbar切换 */
  tabIndex?: number;
  /** 页面标题 */
  title?: string;
}

// 路由定义
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../pages/Page1.vue'),
    meta: {
      showHeader: false,
      headerTitle: '',
      extendToTop: true, // Page1: 内容延伸至屏幕顶部
      tabIndex: 0,
      title: '首页',
    },
  },
  {
    path: '/discover',
    name: 'Discover',
    component: () => import('../pages/Page2.vue'),
    meta: {
      showHeader: true,
      headerTitle: '发现',
      extendToTop: false, // Page2: 标准布局
      tabIndex: 1,
      title: '发现',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/Page3.vue'),
    meta: {
      showHeader: false,
      headerTitle: '',
      extendToTop: false, // Page3: 不延伸，无Header，内容从安全区域开始
      tabIndex: 2,
      title: '设置',
    },
  },
  // 测试页面路由
  {
    path: '/test/detail',
    name: 'TestDetail',
    component: () => import('../pages/test/DetailPage.vue'),
    meta: {
      title: '详情页示例',
    },
  },
  {
    path: '/test/login',
    name: 'TestLogin',
    component: () => import('../pages/test/LoginPage.vue'),
    meta: {
      title: '登录页示例',
    },
  },
  {
    path: '/test/video',
    name: 'TestVideo',
    component: () => import('../pages/test/VideoPage.vue'),
    meta: {
      title: '视频全屏',
    },
  },
  {
    path: '/test/theme',
    name: 'TestTheme',
    component: () => import('../pages/test/ThemeTestPage.vue'),
    meta: {
      title: '主题测试',
    },
  },
  {
    path: '/test/map',
    name: 'TestMap',
    component: () => import('../pages/test/MapTestPage.vue'),
    meta: {
      title: '地图跳转测试',
    },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true,
  sensitive: true,
});

// 路由守卫（可选）
router.beforeEach((to, from, next) => {
  // 更新文档标题
  document.title = (to.meta.title as string) || 'Express App';
  next();
});

export default router;

