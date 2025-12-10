/**
 * 扫码系统类型定义
 *
 * @module core/scanner/types
 */

/**
 * 条码格式枚举
 */
export enum BarcodeFormat {
  // 二维码
  QR_CODE = 'QR_CODE',
  DATA_MATRIX = 'DATA_MATRIX',
  AZTEC = 'AZTEC',
  PDF_417 = 'PDF_417',

  // 商品条码（EAN/UPC）
  EAN_13 = 'EAN_13',
  EAN_8 = 'EAN_8',
  UPC_A = 'UPC_A',
  UPC_E = 'UPC_E',

  // 工业条码
  CODE_128 = 'CODE_128',
  CODE_39 = 'CODE_39',
  CODE_93 = 'CODE_93',
  CODABAR = 'CODABAR',
  ITF = 'ITF',

  // 未知
  UNKNOWN = 'UNKNOWN',
}

/**
 * 条码类别
 */
export enum BarcodeCategory {
  /** 二维码 */
  QR_2D = 'QR_2D',
  /** 商品条码 */
  PRODUCT = 'PRODUCT',
  /** 工业条码 */
  INDUSTRIAL = 'INDUSTRIAL',
  /** 未知 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 条码格式信息
 */
export interface BarcodeFormatInfo {
  /** 格式枚举值 */
  format: BarcodeFormat;
  /** 中文名称 */
  label: string;
  /** 类别 */
  category: BarcodeCategory;
  /** 类别中文名称 */
  categoryLabel: string;
  /** 是否为商品条码（可查询商品信息） */
  isProductCode: boolean;
}

/**
 * 条码格式映射表
 */
export const BARCODE_FORMAT_MAP: Record<BarcodeFormat, BarcodeFormatInfo> = {
  // 二维码
  [BarcodeFormat.QR_CODE]: {
    format: BarcodeFormat.QR_CODE,
    label: '二维码',
    category: BarcodeCategory.QR_2D,
    categoryLabel: '二维码',
    isProductCode: false,
  },
  [BarcodeFormat.DATA_MATRIX]: {
    format: BarcodeFormat.DATA_MATRIX,
    label: 'Data Matrix',
    category: BarcodeCategory.QR_2D,
    categoryLabel: '二维码',
    isProductCode: false,
  },
  [BarcodeFormat.AZTEC]: {
    format: BarcodeFormat.AZTEC,
    label: 'Aztec',
    category: BarcodeCategory.QR_2D,
    categoryLabel: '二维码',
    isProductCode: false,
  },
  [BarcodeFormat.PDF_417]: {
    format: BarcodeFormat.PDF_417,
    label: 'PDF417',
    category: BarcodeCategory.QR_2D,
    categoryLabel: '二维码',
    isProductCode: false,
  },

  // 商品条码
  [BarcodeFormat.EAN_13]: {
    format: BarcodeFormat.EAN_13,
    label: 'EAN-13',
    category: BarcodeCategory.PRODUCT,
    categoryLabel: '商品条码',
    isProductCode: true,
  },
  [BarcodeFormat.EAN_8]: {
    format: BarcodeFormat.EAN_8,
    label: 'EAN-8',
    category: BarcodeCategory.PRODUCT,
    categoryLabel: '商品条码',
    isProductCode: true,
  },
  [BarcodeFormat.UPC_A]: {
    format: BarcodeFormat.UPC_A,
    label: 'UPC-A',
    category: BarcodeCategory.PRODUCT,
    categoryLabel: '商品条码',
    isProductCode: true,
  },
  [BarcodeFormat.UPC_E]: {
    format: BarcodeFormat.UPC_E,
    label: 'UPC-E',
    category: BarcodeCategory.PRODUCT,
    categoryLabel: '商品条码',
    isProductCode: true,
  },

  // 工业条码
  [BarcodeFormat.CODE_128]: {
    format: BarcodeFormat.CODE_128,
    label: 'Code 128',
    category: BarcodeCategory.INDUSTRIAL,
    categoryLabel: '工业条码',
    isProductCode: false,
  },
  [BarcodeFormat.CODE_39]: {
    format: BarcodeFormat.CODE_39,
    label: 'Code 39',
    category: BarcodeCategory.INDUSTRIAL,
    categoryLabel: '工业条码',
    isProductCode: false,
  },
  [BarcodeFormat.CODE_93]: {
    format: BarcodeFormat.CODE_93,
    label: 'Code 93',
    category: BarcodeCategory.INDUSTRIAL,
    categoryLabel: '工业条码',
    isProductCode: false,
  },
  [BarcodeFormat.CODABAR]: {
    format: BarcodeFormat.CODABAR,
    label: 'Codabar',
    category: BarcodeCategory.INDUSTRIAL,
    categoryLabel: '工业条码',
    isProductCode: false,
  },
  [BarcodeFormat.ITF]: {
    format: BarcodeFormat.ITF,
    label: 'ITF',
    category: BarcodeCategory.INDUSTRIAL,
    categoryLabel: '工业条码',
    isProductCode: false,
  },

  // 未知
  [BarcodeFormat.UNKNOWN]: {
    format: BarcodeFormat.UNKNOWN,
    label: '未知格式',
    category: BarcodeCategory.UNKNOWN,
    categoryLabel: '未知',
    isProductCode: false,
  },
};

/**
 * 扫描选项配置
 */
export interface ScanOptions {
  /**
   * 扫描成功后是否震动反馈
   * @default true
   */
  vibrate?: boolean;

  /**
   * 扫描成功后是否播放提示音
   * @default false
   */
  sound?: boolean;

  /**
   * 扫描成功回调
   */
  onSuccess?: (result: ScanResult) => void;

  /**
   * 扫描失败回调
   */
  onError?: (error: ScanError) => void;
}

/**
 * 扫描结果
 */
export interface ScanResult {
  /** 扫描到的内容 */
  content: string;
  /** 码制格式（原始值） */
  format: string;
  /** 标准化的码制格式 */
  formatType: BarcodeFormat;
  /** 码制格式信息 */
  formatInfo: BarcodeFormatInfo;
  /** 扫描时间戳 */
  timestamp: number;
}

/**
 * 扫描错误代码
 */
export type ScanErrorCode =
  | 'PERMISSION_DENIED' // 相机权限被拒绝
  | 'SCAN_ERROR' // 扫描失败
  | 'CANCELLED' // 用户取消
  | 'IMAGE_SCAN_ERROR' // 图片识别失败
  | 'UNKNOWN'; // 未知错误

/**
 * 扫描错误
 */
export interface ScanError extends Error {
  name: 'ScanError';
  message: string;
  code: ScanErrorCode;
}

/**
 * 二维码内容类型
 */
export type QRContentType =
  | 'url' // 网页链接
  | 'email' // 邮箱
  | 'phone' // 电话
  | 'sms' // 短信
  | 'wifi' // WiFi 配置
  | 'vcard' // 名片
  | 'geo' // 地理位置
  | 'product' // 商品条码
  | 'text'; // 普通文本

/**
 * 商品信息接口
 */
export interface ProductInfo {
  /** 商品名称 */
  name: string;
  /** 品牌 */
  brand: string;
  /** 商品图片 */
  image: string;
  /** 分类 */
  categories: string;
  /** 成分/配料 */
  ingredients: string;
  /** 营养成分 */
  nutrition: NutritionInfo | null;
  /** 原始数据 */
  raw?: unknown;
}

/**
 * 营养成分信息
 */
export interface NutritionInfo {
  /** 热量 */
  energy: string;
  /** 蛋白质 */
  proteins: string;
  /** 碳水化合物 */
  carbohydrates: string;
  /** 脂肪 */
  fat: string;
  /** 糖 */
  sugars?: string;
  /** 钠 */
  sodium?: string;
  /** 纤维 */
  fiber?: string;
}

/**
 * 商品查询结果
 */
export interface ProductQueryResult {
  /** 是否找到商品 */
  found: boolean;
  /** 商品信息 */
  product: ProductInfo | null;
  /** 数据来源 */
  source: 'openfoodfacts' | 'unknown';
  /** 错误信息 */
  error?: string;
}

/**
 * 条码扫描完整结果
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
 * 条码扫描器配置选项
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
