/**
 * Scanner 工具函数测试
 */

import { describe, expect, it } from 'vitest';
import { BarcodeFormat } from '@/core/scanner/types';
import {
  getContentTypeLabel,
  inferFormatFromContent,
  isLikelyProductBarcode,
  isUrl,
  isValidBarcode,
  isWebUrl,
  normalizeFormat,
  parseContentType,
} from '@/core/scanner/utils';

describe('Scanner Utils', () => {
  describe('isUrl', () => {
    it('should return true for http URLs', () => {
      expect(isUrl('http://example.com')).toBe(true);
    });

    it('should return true for https URLs', () => {
      expect(isUrl('https://example.com')).toBe(true);
    });

    it('should return false for custom scheme URLs (only http/https/ftp/file supported)', () => {
      expect(isUrl('weixin://dl/business')).toBe(false);
      expect(isUrl('alipay://platformapi')).toBe(false);
    });

    it('should return false for plain text', () => {
      expect(isUrl('hello world')).toBe(false);
      expect(isUrl('12345')).toBe(false);
    });
  });

  describe('isWebUrl', () => {
    it('should return true for http URLs', () => {
      expect(isWebUrl('http://example.com')).toBe(true);
    });

    it('should return true for https URLs', () => {
      expect(isWebUrl('https://example.com')).toBe(true);
    });

    it('should return false for custom scheme URLs', () => {
      expect(isWebUrl('weixin://dl/business')).toBe(false);
    });

    it('should return false for plain text', () => {
      expect(isWebUrl('hello world')).toBe(false);
    });
  });

  describe('isValidBarcode', () => {
    it('should validate EAN-13 barcodes', () => {
      expect(isValidBarcode('6901234567892')).toBe(true); // Valid EAN-13
      expect(isValidBarcode('1234567890123')).toBe(true); // 13 digits
      // 12 digits is also valid (UPC-A format)
      expect(isValidBarcode('123456789012')).toBe(true);
    });

    it('should validate EAN-8 barcodes', () => {
      expect(isValidBarcode('12345678')).toBe(true);
    });

    it('should reject invalid barcodes', () => {
      expect(isValidBarcode('abc')).toBe(false);
      expect(isValidBarcode('')).toBe(false);
      expect(isValidBarcode('12345')).toBe(false); // Too short (less than 8)
      expect(isValidBarcode('1234567')).toBe(false); // 7 digits too short
    });
  });

  describe('isLikelyProductBarcode', () => {
    it('should identify likely product barcodes', () => {
      expect(isLikelyProductBarcode('6901234567892')).toBe(true); // Chinese product
      expect(isLikelyProductBarcode('4901234567892')).toBe(true); // Japanese product
    });

    it('should reject non-product codes', () => {
      expect(isLikelyProductBarcode('https://example.com')).toBe(false);
      expect(isLikelyProductBarcode('abc123')).toBe(false);
    });
  });

  describe('normalizeFormat', () => {
    it('should normalize QR code formats', () => {
      expect(normalizeFormat('QR_CODE')).toBe(BarcodeFormat.QR_CODE);
      expect(normalizeFormat('qr_code')).toBe(BarcodeFormat.QR_CODE);
      expect(normalizeFormat('QRCODE')).toBe(BarcodeFormat.QR_CODE);
    });

    it('should normalize EAN formats', () => {
      expect(normalizeFormat('EAN_13')).toBe(BarcodeFormat.EAN_13);
      expect(normalizeFormat('EAN13')).toBe(BarcodeFormat.EAN_13);
      expect(normalizeFormat('EAN_8')).toBe(BarcodeFormat.EAN_8);
    });

    it('should return UNKNOWN for unrecognized formats', () => {
      expect(normalizeFormat('INVALID')).toBe(BarcodeFormat.UNKNOWN);
      expect(normalizeFormat('')).toBe(BarcodeFormat.UNKNOWN);
    });
  });

  describe('inferFormatFromContent', () => {
    it('should infer EAN-13 from 13-digit numbers', () => {
      expect(inferFormatFromContent('6901234567892')).toBe(
        BarcodeFormat.EAN_13,
      );
    });

    it('should infer EAN-8 from 8-digit numbers', () => {
      expect(inferFormatFromContent('12345678')).toBe(BarcodeFormat.EAN_8);
    });

    it('should infer QR_CODE from URLs', () => {
      expect(inferFormatFromContent('https://example.com')).toBe(
        BarcodeFormat.QR_CODE,
      );
    });

    it('should return UNKNOWN for non-matching content', () => {
      expect(inferFormatFromContent('abc')).toBe(BarcodeFormat.UNKNOWN);
    });
  });

  describe('parseContentType', () => {
    it('should parse URL content', () => {
      expect(parseContentType('https://example.com')).toBe('url');
    });

    it('should parse phone numbers', () => {
      expect(parseContentType('tel:+1234567890')).toBe('phone');
    });

    it('should parse email addresses', () => {
      expect(parseContentType('mailto:test@example.com')).toBe('email');
    });

    it('should parse WiFi config', () => {
      expect(parseContentType('WIFI:S:network;T:WPA;P:password;;')).toBe(
        'wifi',
      );
    });

    it('should default to TEXT', () => {
      expect(parseContentType('plain text')).toBe('text');
    });
  });

  describe('getContentTypeLabel', () => {
    it('should return Chinese labels', () => {
      expect(getContentTypeLabel('url')).toBe('网页链接');
      expect(getContentTypeLabel('text')).toBe('文本');
      expect(getContentTypeLabel('phone')).toBe('电话号码');
    });
  });
});
