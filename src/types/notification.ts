/** 通知选项 */
export interface NotificationOptions {
  /** 通知标题（必填） */
  title: string;
  /** 通知内容 */
  body?: string;
  /** 通知渠道ID（Android 8.0+） */
  channelId?: string;
}

/** 通知渠道重要性级别 */
export type ChannelImportance = 'none' | 'min' | 'low' | 'default' | 'high';

/** 通知渠道配置 */
export interface NotificationChannel {
  /** 渠道ID */
  id: string;
  /** 渠道名称 */
  name: string;
  /** 渠道描述 */
  description?: string;
  /** 重要性级别 - high 会在前台也弹出通知 */
  importance?: ChannelImportance;
  /** 是否震动 */
  vibration?: boolean;
  /** 是否有声音 */
  sound?: string;
}
