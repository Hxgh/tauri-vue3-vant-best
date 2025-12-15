/**
 * Platform 检测模块测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window and navigator before importing detect module
const mockNavigator = {
  userAgent: '',
};

const mockWindow: Record<string, unknown> = {};

vi.stubGlobal('navigator', mockNavigator);
vi.stubGlobal('window', mockWindow);

// Dynamic import to ensure mocks are applied
const importDetect = async () => {
  // Clear module cache
  vi.resetModules();
  return await import('@/core/platform/detect');
};

describe('Platform Detect', () => {
  beforeEach(() => {
    mockNavigator.userAgent = '';
    // Remove __TAURI__ property completely (not just set to undefined)
    delete mockWindow.__TAURI__;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAndroid', () => {
    it('should return true for Android user agent', async () => {
      mockNavigator.userAgent =
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36';
      const { isAndroid } = await importDetect();
      expect(isAndroid()).toBe(true);
    });

    it('should return false for iOS user agent', async () => {
      mockNavigator.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      const { isAndroid } = await importDetect();
      expect(isAndroid()).toBe(false);
    });

    it('should return false for desktop user agent', async () => {
      mockNavigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0';
      const { isAndroid } = await importDetect();
      expect(isAndroid()).toBe(false);
    });
  });

  describe('isIOS', () => {
    it('should return true for iPhone user agent', async () => {
      mockNavigator.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      const { isIOS } = await importDetect();
      expect(isIOS()).toBe(true);
    });

    it('should return true for iPad user agent', async () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)';
      const { isIOS } = await importDetect();
      expect(isIOS()).toBe(true);
    });

    it('should return false for Android user agent', async () => {
      mockNavigator.userAgent =
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36';
      const { isIOS } = await importDetect();
      expect(isIOS()).toBe(false);
    });
  });

  describe('isMobile', () => {
    it('should return true for Android', async () => {
      mockNavigator.userAgent =
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36';
      const { isMobile } = await importDetect();
      expect(isMobile()).toBe(true);
    });

    it('should return true for iOS', async () => {
      mockNavigator.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      const { isMobile } = await importDetect();
      expect(isMobile()).toBe(true);
    });

    it('should return false for desktop', async () => {
      mockNavigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0';
      const { isMobile } = await importDetect();
      expect(isMobile()).toBe(false);
    });
  });

  describe('isTauriEnv', () => {
    it('should return true when __TAURI__ exists', async () => {
      mockWindow.__TAURI__ = {};
      const { isTauriEnv } = await importDetect();
      expect(isTauriEnv()).toBe(true);
    });

    it('should return false when __TAURI__ is undefined', async () => {
      delete mockWindow.__TAURI__;
      const { isTauriEnv } = await importDetect();
      expect(isTauriEnv()).toBe(false);
    });
  });

  describe('isTauriMobile', () => {
    it('should return true for Android in Tauri environment', async () => {
      mockWindow.__TAURI__ = {};
      mockNavigator.userAgent =
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36';
      const { isTauriMobile } = await importDetect();
      expect(isTauriMobile()).toBe(true);
    });

    it('should return false for desktop in Tauri environment', async () => {
      mockWindow.__TAURI__ = {};
      mockNavigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0';
      const { isTauriMobile } = await importDetect();
      expect(isTauriMobile()).toBe(false);
    });

    it('should return false for mobile outside Tauri environment', async () => {
      delete mockWindow.__TAURI__;
      mockNavigator.userAgent =
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36';
      const { isTauriMobile } = await importDetect();
      expect(isTauriMobile()).toBe(false);
    });
  });
});
