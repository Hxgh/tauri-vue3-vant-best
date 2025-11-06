import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

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
 * 获取系统主题偏好
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
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

  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // 设置 CSS 变量供其他组件使用
  root.setAttribute('data-theme', theme);

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

  // 立即应用主题（在 store 创建时）
  applyTheme(resolvedTheme.value, mode.value);

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
        applyTheme(resolvedTheme.value, mode.value);
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
   * 初始化主题
   */
  function initTheme() {
    applyTheme(resolvedTheme.value, mode.value);
    setupSystemThemeListener();
  }

  // 监听 mode 变化
  watch(mode, (newMode) => {
    resolvedTheme.value = resolveTheme(newMode);
    applyTheme(resolvedTheme.value, newMode);
  });

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
