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
 * 同时兼容 Vant ActionSheetAction 的 name 属性
 */
export interface MapApp {
  /** 显示名称（兼容 Vant ActionSheetAction） */
  name: string;
  /** 显示名称（别名，保持向后兼容） */
  label: string;
  /** 地图类型标识 */
  value: MapType;
  /** URL Scheme */
  scheme: string;
}

/**
 * 导航目标位置
 * 支持三种模式：
 * 1. 经纬度+地址模式：提供 lat + lng + name（最精确，显示地址名称）
 * 2. 纯经纬度模式：仅提供 lat + lng（精确定位，无地址名称）
 * 3. 纯地址模式：仅提供 name（地图应用自动搜索）
 *
 * 注意：lat 和 lng 必须同时提供或同时不提供
 */
export interface NavigationTarget {
  /** 纬度（可选，与 lng 配合使用） */
  lat?: number;
  /** 经度（可选，与 lat 配合使用） */
  lng?: number;
  /** 地点名称/地址（可选，纯经纬度模式时可不填） */
  name?: string;
  /**
   * 是否直接开始导航（仅高德地图支持）
   * - true: 直接开始语音导航（需要有经纬度）
   * - false: 显示路径规划，用户确认后再导航
   * - undefined: 自动判断（有经纬度时直接导航，纯地址时路径规划）
   */
  directNav?: boolean;
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
