/**
 * 主题类型定义
 *
 * @module core/theme/types
 */

/**
 * 主题模式
 * - 'light': 浅色模式
 * - 'dark': 深色模式
 * - 'auto': 跟随系统
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 实际应用的主题（解析后）
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * iOS Theme Bridge 接口定义
 */
export interface iOSThemeBridge {
  postMessage(data: { action: string; theme: string; mode: string }): void;
}

/**
 * Android Theme Bridge 接口定义
 */
export interface AndroidThemeBridge {
  setTheme(theme: ResolvedTheme, mode: ThemeMode): void;
}

/**
 * 扩展 Window 接口以包含原生注入的主题
 */
declare global {
  interface Window {
    /** Android 注入的系统主题 */
    __ANDROID_SYSTEM_THEME__?: ResolvedTheme;
    /** iOS 注入的系统主题 */
    __IOS_SYSTEM_THEME__?: ResolvedTheme;
    /** 强制主题检查回调（由原生调用） */
    __FORCE_THEME_CHECK__?: () => void;
    /** Android 主题桥接 */
    AndroidTheme?: AndroidThemeBridge;
    /** iOS WebKit 桥接 */
    webkit?: {
      messageHandlers?: {
        iOSTheme?: iOSThemeBridge;
      };
    };
  }
}
