/**
 * 平台工具模块
 * 提供平台检测、原生桥接、日志等基础能力
 *
 * @module core/platform
 *
 * @example
 * ```ts
 * import { isTauriEnv, isAndroid, callBridge, logger } from '@/core/platform';
 *
 * if (isTauriEnv()) {
 *   const result = await callBridge<boolean>('AndroidMap', 'isAppInstalled', 'com.xxx');
 *   logger.debug('检查结果:', result);
 * }
 * ```
 */

export type { BridgeResult } from './bridge';
export { callBridge, withFallback } from './bridge';
export {
  isAndroid,
  isIOS,
  isMobile,
  isTauriEnv,
  isTauriMobile,
} from './detect';
export { logger } from './logger';
export {
  createStorage,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
} from './storage';
