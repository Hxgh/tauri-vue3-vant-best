import { defineStore } from 'pinia';
import { ref } from 'vue';
import { logger } from '@/utils/logger';

/**
 * 主题类型
 * - 'light': 浅色模式
 * - 'dark': 深色模式
 * - 'auto': 跟随系统
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 实际应用的主题（解析后）
 */
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme-mode';

/**
 * iOS Theme Bridge 接口定义
 */
interface iOSThemeBridge {
  postMessage(data: { action: string; theme: string; mode: string }): void;
}

/**
 * 扩展 Window 接口以包含原生注入的主题
 */
declare global {
  interface Window {
    /** Android 注入的系统主题 */
    __ANDROID_SYSTEM_THEME__?: 'light' | 'dark';
    /** iOS 注入的系统主题 */
    __IOS_SYSTEM_THEME__?: 'light' | 'dark';
    /** 强制主题检查回调（由原生调用） */
    __FORCE_THEME_CHECK__?: () => void;
    /** iOS WebKit 桥接 */
    webkit?: {
      messageHandlers?: {
        iOSTheme?: iOSThemeBridge;
      };
    };
  }
}

/**
 * 获取系统主题偏好
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';

  try {
    // 优先使用原生注入的系统主题（更可靠）
    // Android
    if (window.__ANDROID_SYSTEM_THEME__) {
      logger.debug(
        '[Theme] Using Android injected theme:',
        window.__ANDROID_SYSTEM_THEME__,
      );
      return window.__ANDROID_SYSTEM_THEME__;
    }

    // iOS
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
 * 从本地存储读取主题配置
 */
function getStoredTheme(): ThemeMode | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored;
  }
  return null;
}

/**
 * 保存主题配置到本地存储
 */
function saveTheme(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, mode);
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
 * @param theme 解析后的主题
 * @param mode 用户选择的主题模式
 */
function applyTheme(theme: ResolvedTheme, mode: ThemeMode) {
  const root = document.documentElement;

  logger.debug('[Theme] Applying theme:', { theme, mode });

  // 根据解析后的主题添加或移除 Vant 深色模式类名
  // 注意：auto 模式下也需要类名，Vant 组件依赖它来显示深色样式
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
 * Android Theme Bridge 接口定义
 */
interface AndroidThemeBridge {
  setTheme(theme: ResolvedTheme, mode: ThemeMode): void;
}

/**
 * Window 接口扩展
 */
declare global {
  interface Window {
    AndroidTheme?: AndroidThemeBridge;
  }
}

/**
 * 同步主题到原生系统栏（Android/iOS）
 * @param theme 解析后的主题
 * @param mode 用户选择的主题模式
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

  // 保存到 localStorage（作为备份）
  try {
    localStorage.setItem('app-theme-resolved', theme);
  } catch (_error) {
    // 静默失败
  }
}

export const useThemeStore = defineStore('theme', () => {
  // 状态：用户设置的主题模式（优先级最高）
  const mode = ref<ThemeMode>(getStoredTheme() || 'auto');

  // 状态：实际应用的主题
  const resolvedTheme = ref<ResolvedTheme>(resolveTheme(mode.value));

  // 注意：不在这里立即应用主题，等待 initTheme() 调用
  // 这样可以确保 DOM 和 WebView 完全准备好

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
   */
  function setupSystemThemeListener() {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (mode.value === 'auto') {
        resolvedTheme.value = e.matches ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
          window.__IOS_SYSTEM_THEME__ = resolvedTheme.value;
        }
        // auto 模式下，只更新 resolvedTheme 和 data-theme 属性
        // CSS 媒体查询会自动应用样式
        document.documentElement.setAttribute(
          'data-theme',
          resolvedTheme.value,
        );
        syncToNative(resolvedTheme.value, mode.value);
      }
    };

    // 现代浏览器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 旧版浏览器回退
      mediaQuery.addListener(handleChange);
    }
  }

  /**
   * 监听应用恢复（从后台返回前台）
   */
  function setupAppResumeListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('app-resume', () => {
      // 重新检查并应用主题
      resolvedTheme.value = resolveTheme(mode.value);
      applyTheme(resolvedTheme.value, mode.value);
    });
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
   * 初始化主题
   */
  function initTheme() {
    logger.debug('[Theme] Initializing theme system');

    // 暴露强制检查函数给 Android
    if (typeof window !== 'undefined') {
      window.__FORCE_THEME_CHECK__ = forceThemeCheck;
    }

    applyTheme(resolvedTheme.value, mode.value);
    setupSystemThemeListener();
    setupAppResumeListener();
  }

  return {
    // 状态
    mode,
    resolvedTheme,

    // 方法
    setMode,
    toggleTheme,
    initTheme,
  };
});
