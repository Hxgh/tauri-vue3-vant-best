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

// Note: Window interface extensions are defined in src/env.d.ts
