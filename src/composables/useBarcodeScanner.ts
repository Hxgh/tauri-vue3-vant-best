import { ref, computed, onUnmounted } from 'vue';
import { useQRScanner } from './useQRScanner';
import { useProductQuery } from './useProductQuery';
import type { ScanResult, ScanError, ScanOptions } from '@/types/scanner';
import { isLikelyProductBarcode } from '@/types/scanner';
import type { ProductInfo, ProductQueryResult } from './useProductQuery';

/**
 * 扫描完成后的完整结果
 */
export interface BarcodeScanResult {
  /** 扫描结果 */
  scan: ScanResult;
  /** 商品信息（如果是商品条码且查询成功） */
  product: ProductInfo | null;
  /** 是否为商品条码 */
  isProductBarcode: boolean;
  /** 商品查询是否完成 */
  productQueryDone: boolean;
}

/**
 * 扫描器配置选项
 */
export interface BarcodeScannerOptions extends ScanOptions {
  /**
   * 是否自动查询商品信息
   * @default true
   */
  autoQueryProduct?: boolean;

  /**
   * 完整结果回调（扫描+商品查询完成后）
   */
  onComplete?: (result: BarcodeScanResult) => void;
}

/**
 * 条码扫描器 Composable（框架级封装）
 *
 * 整合了扫描功能和商品查询功能，提供一站式解决方案：
 * - 自动检测条码类型
 * - 自动查询商品信息（可选）
 * - 统一的结果回调
 *
 * @param options 扫描器配置
 * @param elementId 扫描器容器元素ID（Web端使用）
 */
export function useBarcodeScanner(options: BarcodeScannerOptions = {}, elementId?: string) {
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
      onSuccess: async (scanResult) => {
        // 判断是否为商品条码：优先使用格式信息，备用内容判断
        const isProductCode = scanResult.formatInfo.isProductCode ||
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
    elementId
  );

  // 扫描历史
  const scanHistory = ref<BarcodeScanResult[]>([]);
  const maxHistoryLength = 20;

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
    const scanResult = await scanner.startScan();

    // 等待商品查询完成
    return new Promise((resolve) => {
      const checkComplete = () => {
        if (lastResult.value?.productQueryDone) {
          addToHistory(lastResult.value);
          resolve(lastResult.value);
        } else {
          setTimeout(checkComplete, 50);
        }
      };
      checkComplete();
    });
  };

  /**
   * 从图片扫描
   */
  const scanFromImage = async (file: File): Promise<BarcodeScanResult> => {
    clearProduct();
    const scanResult = await scanner.scanFromImage(file);

    // 等待商品查询完成
    return new Promise((resolve) => {
      const checkComplete = () => {
        if (lastResult.value?.productQueryDone) {
          addToHistory(lastResult.value);
          resolve(lastResult.value);
        } else {
          setTimeout(checkComplete, 50);
        }
      };
      checkComplete();
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

// 导出类型和工具
export type { ProductInfo, ProductQueryResult, ScanResult, ScanError };
export {
  BarcodeFormat,
  BarcodeCategory,
  normalizeFormat,
  getFormatInfo,
  inferFormatFromContent,
  isLikelyProductBarcode,
  isUrl,
  isWebUrl,
  parseContentType,
  getContentTypeLabel,
  BARCODE_FORMAT_MAP,
} from '@/types/scanner';
export type { BarcodeFormatInfo, QRContentType } from '@/types/scanner';
