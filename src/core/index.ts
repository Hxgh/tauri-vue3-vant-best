/**
 * Core 核心能力模块
 *
 * 本模块提供 Tauri + Vue 3 + Vant 应用的基础能力，可直接复制到其他项目使用。
 *
 * @module core
 * @version 1.0.0
 *
 * ## 包含的能力
 *
 * ### 1. 平台工具 (platform)
 * - 平台检测：isTauriEnv, isAndroid, isIOS, isMobile
 * - 原生桥接：callBridge, withFallback
 * - 日志工具：logger
 *
 * ### 2. 主题系统 (theme)
 * - 三种模式：light, dark, auto
 * - 与原生系统栏同步
 * - Vant 组件深色模式适配
 *
 * ### 3. 布局系统 (layout)
 * - 三维布局配置：HeaderMode, ContentStart, TabbarMode
 * - 安全区域自动处理
 * - 键盘弹出适配
 *
 * ### 4. 扫码系统 (scanner)
 * - 跨平台扫码（原生 + Web）
 * - 商品条码识别和查询
 * - 支持多种码制
 *
 * ### 5. 地图导航 (map)
 * - 支持高德、百度、腾讯地图
 * - 原生 App 优先，网页版降级
 *
 * ### 6. 通知系统 (notification)
 * - 系统通知权限管理
 * - Android 通知渠道
 * - 前台弹出通知
 *
 * ## 快速开始
 *
 * ```ts
 * // main.ts
 * import { createApp } from 'vue';
 * import { createPinia } from 'pinia';
 * import App from './App.vue';
 *
 * // 引入核心样式
 * import '@/core/layout/styles/safe-area.css';
 * import '@/core/theme/styles/theme.css';
 *
 * // 初始化
 * import { useThemeStore } from '@/core/theme';
 *
 * const app = createApp(App);
 * app.use(createPinia());
 *
 * // 初始化主题系统
 * const themeStore = useThemeStore();
 * themeStore.initTheme();
 *
 * app.mount('#app');
 * ```
 */

export type { LayoutConfig } from './layout';
// ============ Layout 布局系统 ============
export {
  AppTabbar,
  ContentStart,
  FixedBottom,
  HeaderMode,
  ImmersiveBottomBar,
  ImmersiveNavbar,
  LayoutPresets,
  MainLayout,
  TabbarMode,
} from './layout';
export type { MapApp, MapResult, MapType } from './map';
// ============ Map 地图导航 ============
export {
  checkMapInstalled,
  getMapApps,
  MapNavigationButton,
  openMapNavigation,
  useMapNavigation,
} from './map';
export type {
  ChannelImportance,
  NotificationChannel,
  NotificationOptions,
} from './notification';
// ============ Notification 通知系统 ============
export { useNotification } from './notification';
export type { BridgeResult } from './platform';
// ============ Platform 平台工具 ============
export {
  callBridge,
  isAndroid,
  isIOS,
  isMobile,
  isTauriEnv,
  isTauriMobile,
  logger,
  withFallback,
} from './platform';
export type {
  BarcodeFormatInfo,
  BarcodeScannerOptions,
  BarcodeScanResult,
  NutritionInfo,
  ProductInfo,
  ProductQueryResult,
  QRContentType,
  ScanError,
  ScanErrorCode,
  ScanOptions,
  ScanResult,
} from './scanner';
// ============ Scanner 扫码系统 ============
export {
  BARCODE_FORMAT_MAP,
  BarcodeCategory,
  BarcodeFormat,
  getContentTypeLabel,
  getFormatInfo,
  inferFormatFromContent,
  isLikelyProductBarcode,
  isUrl,
  isValidBarcode,
  isWebUrl,
  normalizeFormat,
  parseContentType,
  queryProduct,
  quickScan,
  useBarcodeScanner,
  useProductQuery,
  useQRScanner,
} from './scanner';
export type { ResolvedTheme, ThemeMode } from './theme';
// ============ Theme 主题系统 ============
export { useThemeStore } from './theme';

// ============ 版本信息 ============
/** Core 模块版本号 */
export const CORE_VERSION = '1.0.0';
