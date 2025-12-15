/**
 * Core 模块常量定义
 * 集中管理所有魔法数字和配置常量
 *
 * @module core/constants
 */

// ============ 布局常量 ============
export const LAYOUT = {
  /** Header 高度 (px) */
  HEADER_HEIGHT: 46,
  /** Tabbar 高度 (px) */
  TABBAR_HEIGHT: 50,
  /** 底部安全区域最小高度 (px) */
  MIN_BOTTOM_SAFE_AREA: 20,
} as const;

// ============ 扫码常量 ============
export const SCANNER = {
  /** 扫描超时时间 (ms) */
  DEFAULT_TIMEOUT: 10000,
  /** 震动时长 (ms) */
  VIBRATE_DURATION: 200,
  /** 最大图片大小 (bytes) - 10MB */
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  /** 扫描帧率 */
  DEFAULT_FPS: 10,
  /** 扫描框相对于视窗的比例 */
  SCAN_BOX_RATIO: 0.7,
  /** 轮询间隔 (ms) */
  POLL_INTERVAL: 50,
  /** 历史记录最大长度 */
  MAX_HISTORY_LENGTH: 20,
} as const;

// ============ 商品查询常量 ============
export const PRODUCT_QUERY = {
  /** API 请求超时 (ms) */
  API_TIMEOUT: 30000,
} as const;

// ============ 音频常量 ============
export const AUDIO = {
  /** 扫码提示音频率 (Hz) */
  SCAN_SOUND_FREQUENCY: 1800,
  /** 扫码提示音时长 (s) */
  SCAN_SOUND_DURATION: 0.1,
  /** 扫码提示音音量 */
  SCAN_SOUND_VOLUME: 0.3,
} as const;

// ============ 主题常量 ============
export const THEME = {
  /** localStorage 存储键名 */
  STORAGE_KEY: 'app-theme-mode',
  /** 解析后主题存储键名 */
  RESOLVED_STORAGE_KEY: 'app-theme-resolved',
} as const;

// ============ 通知常量 ============
export const NOTIFICATION = {
  /** 默认高优先级渠道ID */
  DEFAULT_CHANNEL_ID: 'high_priority_channel',
  /** 默认渠道名称 */
  DEFAULT_CHANNEL_NAME: '重要通知',
  /** 默认渠道描述 */
  DEFAULT_CHANNEL_DESCRIPTION: '会在前台弹出的重要通知',
} as const;
