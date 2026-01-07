/**
 * 地图导航模块
 * 支持高德、百度、腾讯地图的原生导航
 *
 * @module core/map
 *
 * ## 功能特性
 * - 支持三种地图：高德、百度、腾讯
 * - 优先打开原生地图 App
 * - 自动降级到网页版地图
 * - 检测地图应用是否已安装
 *
 * ## 使用方式
 *
 * ### 1. 直接调用
 * ```ts
 * import { openMapNavigation, checkMapInstalled } from '@/core/map';
 *
 * // 检查高德地图是否安装
 * const installed = await checkMapInstalled('amap');
 *
 * // 打开地图导航（经纬度+地址）
 * await openMapNavigation({ lat: 39.9042, lng: 116.4074, name: '北京天安门' }, 'amap');
 *
 * // 直接开始导航（跳过路径规划确认，仅高德支持）
 * await openMapNavigation({ lat: 39.9042, lng: 116.4074, name: '北京天安门', directNav: true }, 'amap');
 * ```
 *
 * ### 2. 使用 Hook
 * ```ts
 * import { useMapNavigation } from '@/core/map';
 *
 * const { loading, mapApps, handleMapSelect } = useMapNavigation({
 *   lat: 39.9042,
 *   lng: 116.4074,
 *   name: '北京天安门'
 * });
 *
 * // 用户选择地图后
 * await handleMapSelect('baidu');
 * ```
 *
 * ## Rust 后端命令
 * 需要在 `src-tauri/src/lib.rs` 中实现以下命令：
 * - `open_map_navigation`: 打开地图导航
 * - `check_map_installed`: 检查地图是否安装（仅 Android）
 *
 * 参考实现见本项目的 `src-tauri/src/lib.rs`
 */

export { default as MapNavigationButton } from './components/MapNavigationButton.vue';
export type { MapApp, MapResult, MapType, NavigationTarget } from './types';
export {
  checkMapInstalled,
  getMapApps,
  openMapNavigation,
  useMapNavigation,
} from './useMapNavigation';
