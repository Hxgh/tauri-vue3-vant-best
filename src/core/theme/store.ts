/**
 * 主题管理 Store
 * 提供浅色/深色/跟随系统三种模式，支持与原生系统栏同步
 *
 * @module core/theme/store
 *
 * @example
 * ```ts
 * import { useThemeStore } from '@/core/theme';
 *
 * const themeStore = useThemeStore();
 *
 * // 初始化（应用启动时调用一次）
 * themeStore.initTheme();
 *
 * // 切换主题
 * themeStore.setMode('dark');
 * themeStore.toggleTheme();
 * ```
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { THEME } from '../constants';
import { logger } from '../platform/logger';
import { safeGetItem, safeSetItem } from '../platform/storage';
import type { ResolvedTheme, ThemeMode } from './types';

/**
 * 获取系统主题偏好
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';

  try {
    // 优先使用原生注入的系统主题（更可靠）
    if (window.__ANDROID_SYSTEM_THEME__) {
      logger.debug(
        '[Theme] Using Android injected theme:',
        window.__ANDROID_SYSTEM_THEME__,
      );
      return window.__ANDROID_SYSTEM_THEME__;
    }

    if (window.__IOS_SYSTEM_THEME__) {
      logger.debug(
        '[Theme] Using iOS injected theme:',
        window.__IOS_SYSTEM_THEME__,
      );
      return window.__IOS_SYSTEM_THEME__;
    }

    // 回退到 matchMedia 检测
    const detected = detectMediaTheme();
    logger.debug('[Theme] System theme detected via matchMedia:', detected);
    return detected;
  } catch (error) {
    logger.error('[Theme] Failed to detect system theme:', error);
    return 'light';
  }
}

/**
 * 使用 matchMedia 检测系统主题
 */
function detectMediaTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
}

/**
 * 从本地存储读取主题配置（安全版本）
 */
function getStoredTheme(): ThemeMode | null {
  const stored = safeGetItem(THEME.STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored;
  }
  return null;
}

/**
 * 保存主题配置到本地存储（安全版本）
 */
function saveTheme(mode: ThemeMode): void {
  safeSetItem(THEME.STORAGE_KEY, mode);
}

/**
 * 解析主题模式（处理 auto）
 */
function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'auto') {
    return getSystemTheme();
  }
  return mode;
}

/**
 * 应用主题到 DOM
 */
function applyTheme(theme: ResolvedTheme, mode: ThemeMode) {
  const root = document.documentElement;

  logger.debug('[Theme] Applying theme:', { theme, mode });

  // 根据解析后的主题添加或移除 Vant 深色模式类名
  if (theme === 'dark') {
    root.classList.add('van-theme-dark');
  } else {
    root.classList.remove('van-theme-dark');
  }

  // 设置或移除 data-theme 属性
  if (mode === 'auto') {
    // auto 模式：移除 data-theme，让 @media 查询处理 CSS 变量
    root.removeAttribute('data-theme');
  } else {
    // 手动模式：设置 data-theme，覆盖系统主题
    root.setAttribute('data-theme', theme);
  }

  // 同步到原生系统栏（Android/iOS）
  syncToNative(theme, mode);
}

/**
 * 同步主题到原生系统栏（Android/iOS）
 */
function syncToNative(theme: ResolvedTheme, mode: ThemeMode) {
  if (typeof window === 'undefined') return;

  // Android 桥接
  if (window.AndroidTheme) {
    try {
      window.AndroidTheme.setTheme(theme, mode);
      logger.debug('[Theme] Synced to Android:', { theme, mode });
    } catch (error) {
      logger.error('[Theme] Android sync failed:', error);
    }
  }

  // iOS 桥接
  if (window.webkit?.messageHandlers?.iOSTheme) {
    try {
      window.webkit.messageHandlers.iOSTheme.postMessage({
        action: 'setTheme',
        theme,
        mode,
      });
      logger.debug('[Theme] Synced to iOS:', { theme, mode });
    } catch (error) {
      logger.error('[Theme] iOS sync failed:', error);
    }
  }

  // 保存到 localStorage（作为备份，使用安全版本）
  safeSetItem(THEME.RESOLVED_STORAGE_KEY, theme);
}

export const useThemeStore = defineStore('theme', () => {
  // 状态：用户设置的主题模式
  const mode = ref<ThemeMode>(getStoredTheme() || 'auto');

  // 状态：实际应用的主题
  const resolvedTheme = ref<ResolvedTheme>(resolveTheme(mode.value));

  // 监听器清理函数
  let cleanupMediaListener: (() => void) | null = null;
  let cleanupAppResumeListener: (() => void) | null = null;

  /**
   * 设置主题模式
   */
  function setMode(newMode: ThemeMode) {
    mode.value = newMode;
    saveTheme(newMode);
    resolvedTheme.value = resolveTheme(newMode);
    applyTheme(resolvedTheme.value, newMode);
  }

  /**
   * 切换主题（在 light 和 dark 之间切换）
   */
  function toggleTheme() {
    if (mode.value === 'auto') {
      // 如果当前是 auto，切换到与系统相反的模式
      const systemTheme = getSystemTheme();
      setMode(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      // 否则在 light 和 dark 之间切换
      setMode(resolvedTheme.value === 'dark' ? 'light' : 'dark');
    }
  }

  /**
   * 监听系统主题变化
   * @returns 清理函数
   */
  function setupSystemThemeListener(): () => void {
    if (typeof window === 'undefined') return () => {};

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (mode.value === 'auto') {
        resolvedTheme.value = e.matches ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
          window.__IOS_SYSTEM_THEME__ = resolvedTheme.value;
        }
        document.documentElement.setAttribute(
          'data-theme',
          resolvedTheme.value,
        );
        syncToNative(resolvedTheme.value, mode.value);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }

  /**
   * 监听应用恢复（从后台返回前台）
   * @returns 清理函数
   */
  function setupAppResumeListener(): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleResume = () => {
      resolvedTheme.value = resolveTheme(mode.value);
      applyTheme(resolvedTheme.value, mode.value);
    };

    window.addEventListener('app-resume', handleResume);
    return () => window.removeEventListener('app-resume', handleResume);
  }

  /**
   * 强制重新检查系统主题（由原生层调用）
   */
  function forceThemeCheck() {
    logger.debug('[Theme] Force theme check triggered by native');
    if (mode.value === 'auto') {
      if (typeof window !== 'undefined') {
        window.__IOS_SYSTEM_THEME__ = detectMediaTheme();
      }
      resolvedTheme.value = resolveTheme('auto');
      applyTheme(resolvedTheme.value, mode.value);
    }
  }

  /**
   * 初始化主题（应用启动时调用一次）
   */
  function initTheme() {
    logger.debug('[Theme] Initializing theme system');

    // 暴露强制检查函数给原生层
    if (typeof window !== 'undefined') {
      window.__FORCE_THEME_CHECK__ = forceThemeCheck;
    }

    applyTheme(resolvedTheme.value, mode.value);

    // 设置监听器并保存清理函数
    cleanupMediaListener = setupSystemThemeListener();
    cleanupAppResumeListener = setupAppResumeListener();
  }

  /**
   * 销毁主题系统（清理监听器）
   */
  function destroy() {
    logger.debug('[Theme] Destroying theme system');

    if (cleanupMediaListener) {
      cleanupMediaListener();
      cleanupMediaListener = null;
    }

    if (cleanupAppResumeListener) {
      cleanupAppResumeListener();
      cleanupAppResumeListener = null;
    }

    // 移除全局函数
    if (typeof window !== 'undefined') {
      delete window.__FORCE_THEME_CHECK__;
    }
  }

  return {
    // 状态
    mode,
    resolvedTheme,

    // 方法
    setMode,
    toggleTheme,
    initTheme,
    destroy,
  };
});
