import { defineStore } from 'pinia';
import { ref } from 'vue';

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
 * 扩展 Window 接口以包含 Android 注入的主题
 */
declare global {
  interface Window {
    __ANDROID_SYSTEM_THEME__?: 'light' | 'dark';
    __FORCE_THEME_CHECK__?: () => void;
  }
}

/**
 * 获取系统主题偏好
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  
  try {
    // 优先使用 Android 注入的系统主题（更可靠）
    if (window.__ANDROID_SYSTEM_THEME__) {
      console.log('[Theme] Using Android injected theme:', window.__ANDROID_SYSTEM_THEME__);
      return window.__ANDROID_SYSTEM_THEME__;
    }
    
    // 回退到 matchMedia 检测
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('[Theme] System theme detected via matchMedia:', isDark ? 'dark' : 'light');
    return isDark ? 'dark' : 'light';
  } catch (error) {
    console.error('[Theme] Failed to detect system theme:', error);
    return 'light';
  }
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

  console.log('[Theme] Applying theme:', { theme, mode, hasClass: root.classList.contains('van-theme-dark') });

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

  console.log('[Theme] Applied theme:', { theme, mode, hasClass: root.classList.contains('van-theme-dark'), dataTheme: root.getAttribute('data-theme') || 'auto' });

  // 同步到 Android 系统栏（如果在 Android 环境中）
  syncToAndroid(theme, mode);
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
 * 同步主题到 Android 系统栏
 * @param theme 解析后的主题
 * @param mode 用户选择的主题模式
 */
function syncToAndroid(theme: ResolvedTheme, mode: ThemeMode) {
  // 调用 Android JavaScript Bridge
  if (typeof window !== 'undefined' && window.AndroidTheme) {
    try {
      window.AndroidTheme.setTheme(theme, mode);
    } catch (error) {
      console.error('[Theme] Android sync failed:', error);
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
        // auto 模式下，只更新 resolvedTheme 和 data-theme 属性
        // CSS 媒体查询会自动应用样式
        document.documentElement.setAttribute('data-theme', resolvedTheme.value);
        syncToAndroid(resolvedTheme.value, mode.value);
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
   * 强制重新检查系统主题（由 Android 调用）
   */
  function forceThemeCheck() {
    console.log('[Theme] Force theme check triggered by Android');
    if (mode.value === 'auto') {
      resolvedTheme.value = resolveTheme('auto');
      applyTheme(resolvedTheme.value, mode.value);
    }
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    console.log('[Theme] Initializing theme system');
    
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
