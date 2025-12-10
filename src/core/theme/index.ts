/**
 * 主题系统模块
 * 提供浅色/深色/跟随系统三种模式，支持与原生系统栏同步
 *
 * @module core/theme
 *
 * ## 功能特性
 * - 三种主题模式：light（浅色）、dark（深色）、auto（跟随系统）
 * - 自动检测系统主题偏好
 * - 与 Android/iOS 原生系统栏双向同步
 * - 持久化用户主题偏好
 * - 支持 Vant 组件深色模式
 *
 * ## 使用方式
 *
 * ### 1. 初始化（main.ts）
 * ```ts
 * import { useThemeStore } from '@/core/theme';
 *
 * const app = createApp(App);
 * app.use(createPinia());
 *
 * // 初始化主题系统
 * const themeStore = useThemeStore();
 * themeStore.initTheme();
 * ```
 *
 * ### 2. 切换主题
 * ```ts
 * const themeStore = useThemeStore();
 *
 * // 设置指定模式
 * themeStore.setMode('dark');
 * themeStore.setMode('light');
 * themeStore.setMode('auto');
 *
 * // 在 light/dark 之间切换
 * themeStore.toggleTheme();
 * ```
 *
 * ### 3. 读取当前主题
 * ```ts
 * const themeStore = useThemeStore();
 *
 * // 用户设置的模式
 * console.log(themeStore.mode); // 'light' | 'dark' | 'auto'
 *
 * // 实际应用的主题
 * console.log(themeStore.resolvedTheme); // 'light' | 'dark'
 * ```
 *
 * ## 样式文件
 * 需要在入口文件引入样式：
 * ```ts
 * import '@/core/theme/styles/theme.css';
 * ```
 *
 * ## 原生同步
 * 需要在 Android/iOS 原生层实现对应的桥接接口：
 * - Android: `window.AndroidTheme.setTheme(theme, mode)`
 * - iOS: `window.webkit.messageHandlers.iOSTheme.postMessage({ action: 'setTheme', theme, mode })`
 */

export { useThemeStore } from './store';
export type { ResolvedTheme, ThemeMode } from './types';
