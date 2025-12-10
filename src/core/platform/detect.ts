/**
 * 平台检测工具
 *
 * @module core/platform/detect
 */

/**
 * 检测是否在 Tauri 环境中运行
 */
export function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * 检测是否为 Android 平台
 */
export function isAndroid(): boolean {
  return (
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
  );
}

/**
 * 检测是否为 iOS 平台
 */
export function isIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent)
  );
}

/**
 * 检测是否为移动端（Android 或 iOS）
 */
export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

/**
 * 检测是否为 Tauri 移动端环境
 */
export function isTauriMobile(): boolean {
  return isTauriEnv() && isMobile();
}
