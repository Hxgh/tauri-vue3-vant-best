/**
 * 地图导航类型定义
 *
 * @module core/map/types
 */

/**
 * 地图类型
 */
export type MapType = 'amap' | 'baidu' | 'tencent';

/**
 * 地图应用信息
 */
export interface MapApp {
  /** 显示名称 */
  label: string;
  /** 地图类型标识 */
  value: MapType;
  /** URL Scheme */
  scheme: string;
}

/**
 * 地图导航结果
 */
export interface MapResult {
  /** 是否成功打开原生地图 */
  success: boolean;
  /** 结果消息 */
  message: string;
}

/**
 * Android Map Bridge 类型定义
 */
declare global {
  interface Window {
    AndroidMap?: {
      isAppInstalled: (packageName: string) => boolean;
    };
  }
}
