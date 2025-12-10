/**
 * 原生桥接工具
 * 提供与 Android/iOS 原生层通信的能力
 *
 * @module core/platform/bridge
 */

import { logger } from './logger';

/**
 * 桥接调用结果
 */
export interface BridgeResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 调用原生桥接方法
 *
 * @param bridgeName 桥接对象名称（如 "AndroidMap"）
 * @param method 方法名
 * @param args 参数
 * @returns 调用结果
 *
 * @example
 * ```ts
 * const result = await callBridge<boolean>('AndroidMap', 'isAppInstalled', 'com.xxx');
 * if (result.success) {
 *   console.log('已安装:', result.data);
 * }
 * ```
 */
export async function callBridge<T>(
  bridgeName: string,
  method: string,
  ...args: unknown[]
): Promise<BridgeResult<T>> {
  try {
    const bridge = (window as unknown as Record<string, unknown>)[bridgeName];
    if (!bridge || typeof bridge !== 'object') {
      return { success: false, error: `Bridge "${bridgeName}" not available` };
    }

    const fn = (bridge as Record<string, unknown>)[method];
    if (typeof fn !== 'function') {
      return {
        success: false,
        error: `Method "${method}" not found on ${bridgeName}`,
      };
    }

    const result = await fn.apply(bridge, args);
    return { success: true, data: result as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[Bridge] ${bridgeName}.${method} failed:`, message);
    return { success: false, error: message };
  }
}

/**
 * 异步操作降级方案
 * 当主操作失败时，自动执行备用操作
 *
 * @param primary 主操作
 * @param fallback 备用操作
 * @param logTag 日志标签
 * @returns 操作结果
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  logTag = 'withFallback',
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    logger.debug(`[${logTag}] Primary failed, using fallback:`, error);
    return fallback();
  }
}
