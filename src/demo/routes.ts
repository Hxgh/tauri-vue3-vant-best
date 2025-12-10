/**
 * Demo 示例页面路由
 * 业务项目可删除此文件
 */
import type { RouteRecordRaw } from 'vue-router';

export const demoRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('./Page1.vue'),
    meta: {
      tabIndex: 0,
      title: '首页',
    },
  },
  {
    path: '/discover',
    name: 'Discover',
    component: () => import('./Page2.vue'),
    meta: {
      tabIndex: 1,
      title: '发现',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./Page3.vue'),
    meta: {
      tabIndex: 2,
      title: '设置',
    },
  },
  // 功能测试页面
  {
    path: '/test/detail',
    name: 'TestDetail',
    component: () => import('./test/DetailPage.vue'),
    meta: { title: '详情页示例' },
  },
  {
    path: '/test/login',
    name: 'TestLogin',
    component: () => import('./test/LoginPage.vue'),
    meta: { title: '登录页示例' },
  },
  {
    path: '/test/video',
    name: 'TestVideo',
    component: () => import('./test/VideoPage.vue'),
    meta: { title: '视频全屏' },
  },
  {
    path: '/test/theme',
    name: 'TestTheme',
    component: () => import('./test/ThemeTestPage.vue'),
    meta: { title: '主题测试' },
  },
  {
    path: '/test/keyboard',
    name: 'TestKeyboard',
    component: () => import('./test/KeyboardTestPage.vue'),
    meta: { title: '键盘抬起测试' },
  },
  {
    path: '/test/map',
    name: 'TestMap',
    component: () => import('./test/MapTestPage.vue'),
    meta: { title: '地图跳转测试' },
  },
  {
    path: '/test/qr-scanner',
    name: 'TestQRScanner',
    component: () => import('./test/QRScannerTestPage.vue'),
    meta: { title: '扫码测试' },
  },
  {
    path: '/test/notification',
    name: 'TestNotification',
    component: () => import('./test/NotificationTestPage.vue'),
    meta: { title: '通知测试' },
  },
];
