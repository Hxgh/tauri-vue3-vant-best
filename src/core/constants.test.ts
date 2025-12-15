/**
 * Constants 常量模块测试
 */

import { describe, expect, it } from 'vitest';
import {
  AUDIO,
  LAYOUT,
  NOTIFICATION,
  PRODUCT_QUERY,
  SCANNER,
  THEME,
} from '@/core/constants';

describe('Constants', () => {
  describe('LAYOUT', () => {
    it('should have correct header height', () => {
      expect(LAYOUT.HEADER_HEIGHT).toBe(46);
    });

    it('should have correct tabbar height', () => {
      expect(LAYOUT.TABBAR_HEIGHT).toBe(50);
    });

    it('should have correct min bottom safe area', () => {
      expect(LAYOUT.MIN_BOTTOM_SAFE_AREA).toBe(20);
    });
  });

  describe('SCANNER', () => {
    it('should have correct timeout values', () => {
      expect(SCANNER.DEFAULT_TIMEOUT).toBe(10000);
      expect(SCANNER.POLL_INTERVAL).toBe(50);
    });

    it('should have correct vibrate duration', () => {
      expect(SCANNER.VIBRATE_DURATION).toBe(200);
    });

    it('should have correct max image size (10MB)', () => {
      expect(SCANNER.MAX_IMAGE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should have correct FPS and scan box ratio', () => {
      expect(SCANNER.DEFAULT_FPS).toBe(10);
      expect(SCANNER.SCAN_BOX_RATIO).toBe(0.7);
    });

    it('should have correct history length', () => {
      expect(SCANNER.MAX_HISTORY_LENGTH).toBe(20);
    });
  });

  describe('AUDIO', () => {
    it('should have correct scan sound settings', () => {
      expect(AUDIO.SCAN_SOUND_FREQUENCY).toBe(1800);
      expect(AUDIO.SCAN_SOUND_DURATION).toBe(0.1);
      expect(AUDIO.SCAN_SOUND_VOLUME).toBe(0.3);
    });
  });

  describe('THEME', () => {
    it('should have correct storage keys', () => {
      expect(THEME.STORAGE_KEY).toBe('app-theme-mode');
      expect(THEME.RESOLVED_STORAGE_KEY).toBe('app-theme-resolved');
    });
  });

  describe('NOTIFICATION', () => {
    it('should have correct default channel settings', () => {
      expect(NOTIFICATION.DEFAULT_CHANNEL_ID).toBe('high_priority_channel');
      expect(NOTIFICATION.DEFAULT_CHANNEL_NAME).toBe('重要通知');
      expect(NOTIFICATION.DEFAULT_CHANNEL_DESCRIPTION).toBe(
        '会在前台弹出的重要通知',
      );
    });
  });

  describe('PRODUCT_QUERY', () => {
    it('should have correct API timeout', () => {
      expect(PRODUCT_QUERY.API_TIMEOUT).toBe(30000);
    });
  });

  describe('Immutability', () => {
    it('constants should be readonly (as const enforced at compile time)', () => {
      // TypeScript's 'as const' provides compile-time immutability
      // At runtime, the objects are not frozen by default
      // This test just verifies the constants exist and are objects
      expect(typeof LAYOUT).toBe('object');
      expect(typeof SCANNER).toBe('object');
      expect(typeof AUDIO).toBe('object');
      expect(typeof THEME).toBe('object');
      expect(typeof NOTIFICATION).toBe('object');
    });
  });
});
