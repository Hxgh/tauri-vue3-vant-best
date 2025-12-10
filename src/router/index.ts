/**
 * 路由配置
 *
 * 业务项目使用时：
 * 1. 删除 demoRoutes 导入
 * 2. 替换为自己的业务路由
 */
import { createRouter, createWebHistory } from 'vue-router';
import { demoRoutes } from '../demo/routes';

// 路由元数据类型（可扩展）
declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string;
    /** Tab索引，用于Tabbar切换 */
    tabIndex?: number;
    /** 是否需要登录 */
    requiresAuth?: boolean;
  }
}

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Demo 示例路由（业务项目替换为自己的路由）
    ...demoRoutes,
  ],
  strict: true,
  sensitive: true,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 更新文档标题
  document.title = (to.meta.title as string) || 'App';
  next();
});

export default router;
