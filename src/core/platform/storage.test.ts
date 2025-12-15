/**
 * Storage 工具模块测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createStorage,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
} from '@/core/platform/storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('safeGetItem', () => {
    it('should return stored value', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(safeGetItem('test-key')).toBe('test-value');
    });

    it('should return null for non-existent key', () => {
      expect(safeGetItem('non-existent')).toBeNull();
    });

    it('should return null when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(safeGetItem('test-key')).toBeNull();
    });
  });

  describe('safeSetItem', () => {
    it('should store value and return true', () => {
      const result = safeSetItem('test-key', 'test-value');
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('should return false when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      const result = safeSetItem('test-key', 'test-value');
      expect(result).toBe(false);
    });
  });

  describe('safeRemoveItem', () => {
    it('should remove value and return true', () => {
      localStorage.setItem('test-key', 'test-value');
      const result = safeRemoveItem('test-key');
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should return false when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      const result = safeRemoveItem('test-key');
      expect(result).toBe(false);
    });
  });

  describe('createStorage', () => {
    it('should get default value when key does not exist', () => {
      const storage = createStorage<'a' | 'b'>('test-key', 'a');
      expect(storage.get()).toBe('a');
    });

    it('should get stored value', () => {
      localStorage.setItem('test-key', 'b');
      const storage = createStorage<'a' | 'b'>('test-key', 'a');
      expect(storage.get()).toBe('b');
    });

    it('should set value', () => {
      const storage = createStorage<'a' | 'b'>('test-key', 'a');
      storage.set('b');
      expect(localStorage.getItem('test-key')).toBe('b');
    });

    it('should remove value', () => {
      localStorage.setItem('test-key', 'b');
      const storage = createStorage<'a' | 'b'>('test-key', 'a');
      storage.remove();
      expect(localStorage.getItem('test-key')).toBeNull();
    });
  });
});
