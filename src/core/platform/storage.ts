/**
 * 安全的本地存储工具
 * 处理隐私模式和受限环境下的 localStorage 访问异常
 *
 * @module core/platform/storage
 */

import { logger } from './logger';

/**
 * 安全地从 localStorage 获取值
 *
 * @param key 存储键名
 * @returns 存储的值，如果不存在或访问失败返回 null
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logger.warn('[Storage] Failed to get item:', key, error);
    return null;
  }
}

/**
 * 安全地向 localStorage 存储值
 *
 * @param key 存储键名
 * @param value 要存储的值
 * @returns 是否存储成功
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    logger.warn('[Storage] Failed to set item:', key, error);
    return false;
  }
}

/**
 * 安全地从 localStorage 删除值
 *
 * @param key 存储键名
 * @returns 是否删除成功
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.warn('[Storage] Failed to remove item:', key, error);
    return false;
  }
}

/**
 * 创建一个类型安全的存储访问器
 *
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 存储访问器对象
 *
 * @example
 * ```ts
 * const themeStorage = createStorage<'light' | 'dark' | 'auto'>('app-theme-mode', 'auto');
 * themeStorage.get(); // 'auto'
 * themeStorage.set('dark');
 * ```
 */
export function createStorage<T extends string>(
  key: string,
  defaultValue: T,
): {
  get: () => T;
  set: (value: T) => boolean;
  remove: () => boolean;
} {
  return {
    get: (): T => {
      const value = safeGetItem(key);
      return (value as T) ?? defaultValue;
    },
    set: (value: T): boolean => {
      return safeSetItem(key, value);
    },
    remove: (): boolean => {
      return safeRemoveItem(key);
    },
  };
}
