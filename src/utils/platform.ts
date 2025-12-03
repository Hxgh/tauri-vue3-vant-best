import { logger } from './logger';

export interface BridgeResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

export function isAndroid(): boolean {
  return (
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
  );
}

export function isIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent)
  );
}

export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

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
