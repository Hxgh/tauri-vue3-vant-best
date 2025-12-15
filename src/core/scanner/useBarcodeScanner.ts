/**
 * 条码扫描器 Composable（框架级封装）
 *
 * 整合了扫描功能和商品查询功能，提供一站式解决方案：
 * - 自动检测条码类型
 * - 自动查询商品信息（可选）
 * - 统一的结果回调
 *
 * @module core/scanner/useBarcodeScanner
 */

import { ref, watch } from 'vue';
import { SCANNER } from '../constants';
import type {
  BarcodeScannerOptions,
  BarcodeScanResult,
  ScanResult,
} from './types';
import { useProductQuery } from './useProductQuery';
import { useQRScanner } from './useQRScanner';
import { isLikelyProductBarcode } from './utils';

/**
 * 条码扫描器 Composable
 *
 * @param options 扫描器配置
 * @param elementId 扫描器容器元素ID（Web端使用）
 *
 * @example
 * ```ts
 * const {
 *   scanning,
 *   lastResult,
 *   startScan,
 * } = useBarcodeScanner({
 *   autoQueryProduct: true,
 *   onComplete: (result) => {
 *     console.log('扫描结果:', result.scan.content);
 *     if (result.product) {
 *       console.log('商品名称:', result.product.name);
 *     }
 *   },
 * });
 *
 * // 开始扫描
 * const result = await startScan();
 * ```
 */
export function useBarcodeScanner(
  options: BarcodeScannerOptions = {},
  elementId?: string,
) {
  const {
    autoQueryProduct = true,
    onComplete,
    onSuccess,
    onError,
    ...scanOptions
  } = options;

  // 完整结果
  const lastResult = ref<BarcodeScanResult | null>(null);

  // 商品查询
  const {
    loading: productLoading,
    result: productResult,
    query: queryProduct,
    clear: clearProduct,
  } = useProductQuery();

  // 扫描器
  const scanner = useQRScanner(
    {
      ...scanOptions,
      onSuccess: async (scanResult: ScanResult) => {
        // 判断是否为商品条码：优先使用格式信息，备用内容判断
        const isProductCode =
          scanResult.formatInfo.isProductCode ||
          isLikelyProductBarcode(scanResult.content);

        const result: BarcodeScanResult = {
          scan: scanResult,
          product: null,
          isProductBarcode: isProductCode,
          productQueryDone: false,
        };

        lastResult.value = result;

        // 调用原始回调
        onSuccess?.(scanResult);

        // 自动查询商品
        if (autoQueryProduct && result.isProductBarcode) {
          const queryResult = await queryProduct(scanResult.content);
          result.product = queryResult.product;
          result.productQueryDone = true;
          lastResult.value = { ...result };

          // 调用完整结果回调
          onComplete?.(result);
        } else {
          result.productQueryDone = true;
          lastResult.value = { ...result };
          onComplete?.(result);
        }
      },
      onError: (error) => {
        onError?.(error);
      },
    },
    elementId,
  );

  // 扫描历史
  const scanHistory = ref<BarcodeScanResult[]>([]);
  const maxHistoryLength = SCANNER.MAX_HISTORY_LENGTH;

  /**
   * 添加到历史
   */
  const addToHistory = (result: BarcodeScanResult) => {
    scanHistory.value.unshift(result);
    if (scanHistory.value.length > maxHistoryLength) {
      scanHistory.value = scanHistory.value.slice(0, maxHistoryLength);
    }
  };

  /**
   * 清除历史
   */
  const clearHistory = () => {
    scanHistory.value = [];
  };

  /**
   * 启动扫描
   */
  const startScan = async (): Promise<BarcodeScanResult> => {
    clearProduct();
    await scanner.startScan();

    // 使用 watch 等待商品查询完成，替代轮询
    return new Promise((resolve) => {
      // 如果已经完成，直接返回
      if (lastResult.value?.productQueryDone) {
        addToHistory(lastResult.value);
        resolve(lastResult.value);
        return;
      }

      // 监听 productQueryDone 变化
      const unwatch = watch(
        () => lastResult.value?.productQueryDone,
        (done) => {
          if (done && lastResult.value) {
            unwatch();
            addToHistory(lastResult.value);
            resolve(lastResult.value);
          }
        },
        { immediate: true },
      );
    });
  };

  /**
   * 从图片扫描
   */
  const scanFromImage = async (file?: File): Promise<BarcodeScanResult> => {
    clearProduct();
    await scanner.scanFromImage(file);

    // 使用 watch 等待商品查询完成，替代轮询
    return new Promise((resolve) => {
      // 如果已经完成，直接返回
      if (lastResult.value?.productQueryDone) {
        addToHistory(lastResult.value);
        resolve(lastResult.value);
        return;
      }

      // 监听 productQueryDone 变化
      const unwatch = watch(
        () => lastResult.value?.productQueryDone,
        (done) => {
          if (done && lastResult.value) {
            unwatch();
            addToHistory(lastResult.value);
            resolve(lastResult.value);
          }
        },
        { immediate: true },
      );
    });
  };

  /**
   * 清除所有状态
   */
  const clear = () => {
    lastResult.value = null;
    clearProduct();
  };

  return {
    // 扫描相关状态
    scanning: scanner.scanning,

    // 商品查询状态
    productLoading,
    productResult,

    // 完整结果
    lastResult,
    scanHistory,

    // 方法
    startScan,
    stopScan: scanner.stopScan,
    scanFromImage,
    clear,
    clearHistory,

    // 工具
    isTauriMobile: scanner.isTauriMobile,
  };
}
