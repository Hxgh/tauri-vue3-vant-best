/**
 * 扫码系统模块
 * 提供跨平台扫码能力（移动端原生 + Web 降级）
 *
 * @module core/scanner
 *
 * ## 功能特性
 * - 跨平台支持：移动端使用 Tauri 原生插件，Web/桌面端使用 html5-qrcode
 * - 支持多种码制：QR Code、EAN-13、EAN-8、Code 128 等
 * - 商品查询集成：自动识别商品条码并查询商品信息
 * - 扫描反馈：震动、声音
 * - 图片识别：支持从相册选择图片识别
 *
 * ## 使用方式
 *
 * ### 1. 基础扫码（useQRScanner）
 * ```ts
 * import { useQRScanner } from '@/core/scanner';
 *
 * const { scanning, startScan, stopScan } = useQRScanner({
 *   onSuccess: (result) => {
 *     console.log('扫描内容:', result.content);
 *     console.log('码制类型:', result.formatInfo.label);
 *   },
 * });
 *
 * // 开始扫描
 * await startScan();
 * ```
 *
 * ### 2. 商品扫码（useBarcodeScanner）
 * ```ts
 * import { useBarcodeScanner } from '@/core/scanner';
 *
 * const { scanning, lastResult, startScan } = useBarcodeScanner({
 *   autoQueryProduct: true,
 *   onComplete: (result) => {
 *     console.log('扫描内容:', result.scan.content);
 *     if (result.product) {
 *       console.log('商品名称:', result.product.name);
 *     }
 *   },
 * });
 *
 * // 开始扫描
 * const result = await startScan();
 * ```
 *
 * ### 3. 工具函数
 * ```ts
 * import { isLikelyProductBarcode, parseContentType } from '@/core/scanner';
 *
 * // 判断是否为商品条码
 * if (isLikelyProductBarcode('6901234567890')) {
 *   console.log('这是商品条码');
 * }
 *
 * // 解析二维码内容类型
 * const type = parseContentType('https://example.com');
 * console.log(type); // 'url'
 * ```
 *
 * ## 依赖
 * - @tauri-apps/plugin-barcode-scanner（移动端）
 * - @tauri-apps/plugin-dialog（图片选择）
 * - @tauri-apps/plugin-fs（文件读取）
 * - @tauri-apps/plugin-http（商品查询）
 * - html5-qrcode（Web 端）
 */

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
} from './types';
// Types
export {
  BARCODE_FORMAT_MAP,
  BarcodeCategory,
  BarcodeFormat,
} from './types';
// Composables
export { useBarcodeScanner } from './useBarcodeScanner';
export { queryProduct, useProductQuery } from './useProductQuery';
export { quickScan, useQRScanner } from './useQRScanner';

// Utils
export {
  getContentTypeLabel,
  getFormatInfo,
  inferFormatFromContent,
  isLikelyProductBarcode,
  isUrl,
  isValidBarcode,
  isWebUrl,
  normalizeFormat,
  parseContentType,
} from './utils';
