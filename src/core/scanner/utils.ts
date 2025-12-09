/**
 * 扫码系统工具函数
 *
 * @module core/scanner/utils
 */

import {
  BARCODE_FORMAT_MAP,
  BarcodeFormat,
  type BarcodeFormatInfo,
  type QRContentType,
} from './types';

/**
 * 标准化条码格式（统一不同扫描器返回的格式名称）
 * 支持的输入格式：
 * - Tauri: "QRCode", "Ean13", "Code128" 等
 * - html5-qrcode: "QR_CODE", "EAN_13", "CODE_128" 等
 */
export function normalizeFormat(rawFormat: string): BarcodeFormat {
  if (!rawFormat) return BarcodeFormat.UNKNOWN;

  // 统一处理：转大写，移除分隔符
  const formatUpper = rawFormat.toUpperCase().replace(/[-_\s]/g, '');

  // QR Code: "QRCode", "QR_CODE", "QRCODE"
  if (formatUpper.includes('QR') || formatUpper.includes('QRCODE')) {
    return BarcodeFormat.QR_CODE;
  }

  // EAN-13: "Ean13", "EAN_13", "EAN13"
  if (formatUpper.includes('EAN13') || formatUpper.match(/^EAN.*13$/)) {
    return BarcodeFormat.EAN_13;
  }

  // EAN-8: "Ean8", "EAN_8", "EAN8"
  if (formatUpper.includes('EAN8') || formatUpper.match(/^EAN.*8$/)) {
    return BarcodeFormat.EAN_8;
  }

  // UPC-A: "UpcA", "UPC_A", "UPCA"
  if (formatUpper.includes('UPCA') || formatUpper.match(/^UPC.*A$/)) {
    return BarcodeFormat.UPC_A;
  }

  // UPC-E: "UpcE", "UPC_E", "UPCE"
  if (formatUpper.includes('UPCE') || formatUpper.match(/^UPC.*E$/)) {
    return BarcodeFormat.UPC_E;
  }

  // Code 128: "Code128", "CODE_128", "CODE128"
  if (formatUpper.includes('CODE128') || formatUpper.includes('128')) {
    return BarcodeFormat.CODE_128;
  }

  // Code 39: "Code39", "CODE_39", "CODE39"
  if (formatUpper.includes('CODE39') || formatUpper.match(/CODE.*39/)) {
    return BarcodeFormat.CODE_39;
  }

  // Code 93: "Code93", "CODE_93", "CODE93"
  if (formatUpper.includes('CODE93') || formatUpper.match(/CODE.*93/)) {
    return BarcodeFormat.CODE_93;
  }

  // Data Matrix: "DataMatrix", "DATA_MATRIX", "DATAMATRIX"
  if (formatUpper.includes('DATAMATRIX') || formatUpper.includes('DATA')) {
    return BarcodeFormat.DATA_MATRIX;
  }

  // Aztec: "Aztec", "AZTEC"
  if (formatUpper.includes('AZTEC')) {
    return BarcodeFormat.AZTEC;
  }

  // PDF417: "Pdf417", "PDF_417", "PDF417"
  if (formatUpper.includes('PDF417') || formatUpper.includes('PDF')) {
    return BarcodeFormat.PDF_417;
  }

  // Codabar: "Codabar", "CODABAR"
  if (formatUpper.includes('CODABAR')) {
    return BarcodeFormat.CODABAR;
  }

  // ITF: "Itf", "ITF"
  if (formatUpper.includes('ITF') || formatUpper.includes('INTERLEAVED')) {
    return BarcodeFormat.ITF;
  }

  return BarcodeFormat.UNKNOWN;
}

/**
 * 获取条码格式信息
 */
export function getFormatInfo(
  format: BarcodeFormat | string,
): BarcodeFormatInfo {
  const normalizedFormat =
    typeof format === 'string' ? normalizeFormat(format) : format;
  return (
    BARCODE_FORMAT_MAP[normalizedFormat] ||
    BARCODE_FORMAT_MAP[BarcodeFormat.UNKNOWN]
  );
}

/**
 * 根据内容推断可能的条码格式
 * 当扫描器无法返回格式信息时使用
 */
export function inferFormatFromContent(content: string): BarcodeFormat {
  if (!content) return BarcodeFormat.UNKNOWN;

  // EAN-13: 13位纯数字
  if (/^\d{13}$/.test(content)) {
    return BarcodeFormat.EAN_13;
  }

  // EAN-8: 8位纯数字
  if (/^\d{8}$/.test(content)) {
    return BarcodeFormat.EAN_8;
  }

  // UPC-A: 12位纯数字
  if (/^\d{12}$/.test(content)) {
    return BarcodeFormat.UPC_A;
  }

  // UPC-E: 6-8位纯数字（压缩格式）
  if (/^\d{6,8}$/.test(content)) {
    return BarcodeFormat.UPC_E;
  }

  // URL 或包含特殊字符的通常是 QR Code
  if (
    content.startsWith('http://') ||
    content.startsWith('https://') ||
    content.includes('://') ||
    content.includes('\n')
  ) {
    return BarcodeFormat.QR_CODE;
  }

  // 较长的文本通常是 QR Code
  if (content.length > 50) {
    return BarcodeFormat.QR_CODE;
  }

  return BarcodeFormat.UNKNOWN;
}

/**
 * 判断内容是否可能是商品条码
 */
export function isLikelyProductBarcode(content: string): boolean {
  // 商品条码通常是 8-14 位纯数字
  return /^\d{8,14}$/.test(content);
}

/**
 * 判断内容是否为 URL
 */
export function isUrl(content: string): boolean {
  if (!content) return false;
  return /^(https?|ftp|file):\/\//i.test(content.trim());
}

/**
 * 判断内容是否为有效的网页链接
 */
export function isWebUrl(content: string): boolean {
  if (!content) return false;
  return /^https?:\/\//i.test(content.trim());
}

/**
 * 解析二维码内容类型
 */
export function parseContentType(content: string): QRContentType {
  if (!content) return 'text';

  const trimmed = content.trim();

  // URL
  if (/^https?:\/\//i.test(trimmed)) return 'url';

  // 邮箱
  if (/^mailto:/i.test(trimmed) || /^[\w.-]+@[\w.-]+\.\w+$/.test(trimmed))
    return 'email';

  // 电话
  if (/^tel:/i.test(trimmed) || /^\+?\d{10,13}$/.test(trimmed)) return 'phone';

  // 短信
  if (/^sms:/i.test(trimmed) || /^smsto:/i.test(trimmed)) return 'sms';

  // WiFi
  if (/^WIFI:/i.test(trimmed)) return 'wifi';

  // vCard
  if (/^BEGIN:VCARD/i.test(trimmed)) return 'vcard';

  // 地理位置
  if (/^geo:/i.test(trimmed)) return 'geo';

  // 商品条码
  if (isLikelyProductBarcode(trimmed)) return 'product';

  return 'text';
}

/**
 * 获取内容类型的中文描述
 */
export function getContentTypeLabel(type: QRContentType): string {
  const labels: Record<QRContentType, string> = {
    url: '网页链接',
    email: '邮箱地址',
    phone: '电话号码',
    sms: '短信',
    wifi: 'WiFi配置',
    vcard: '名片',
    geo: '地理位置',
    product: '商品条码',
    text: '文本',
  };
  return labels[type] || '文本';
}

/**
 * 判断是否为有效的条形码（用于商品查询）
 */
export function isValidBarcode(code: string): boolean {
  return /^\d{8,14}$/.test(code);
}
