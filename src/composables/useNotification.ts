import { ref } from 'vue';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  createChannel,
  Importance,
} from '@tauri-apps/plugin-notification';
import type { NotificationOptions, NotificationChannel } from '@/types/notification';

/** 默认高优先级渠道ID */
const DEFAULT_CHANNEL_ID = 'high_priority_channel';

/** 渠道是否已创建 */
let channelCreated = false;

/**
 * 通知能力 Composable
 *
 * 提供系统通知的基础功能：
 * - 检查通知权限
 * - 请求通知权限
 * - 创建通知渠道（Android）
 * - 发送通知（支持前台弹出）
 */
export function useNotification() {
  const permissionGranted = ref(false);
  const loading = ref(false);

  /**
   * 检查通知权限状态
   */
  async function checkPermission(): Promise<boolean> {
    try {
      const granted = await isPermissionGranted();
      permissionGranted.value = granted;
      return granted;
    } catch (error) {
      console.error('检查通知权限失败:', error);
      return false;
    }
  }

  /**
   * 请求通知权限
   */
  async function requestNotificationPermission(): Promise<boolean> {
    loading.value = true;
    try {
      // 先检查是否已有权限
      const alreadyGranted = await isPermissionGranted();
      if (alreadyGranted) {
        permissionGranted.value = true;
        return true;
      }

      // 请求权限
      const permission = await requestPermission();
      const granted = permission === 'granted';
      permissionGranted.value = granted;
      return granted;
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建通知渠道（Android 8.0+）
   * importance 为 high 时，通知会在前台也弹出
   */
  async function createNotificationChannel(channel: NotificationChannel): Promise<void> {
    try {
      const importance = channel.importance === 'high' ? Importance.High
        : channel.importance === 'low' ? Importance.Low
        : channel.importance === 'min' ? Importance.Min
        : channel.importance === 'none' ? Importance.None
        : Importance.Default;

      await createChannel({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        importance,
        vibration: channel.vibration,
        sound: channel.sound,
      });
    } catch (error) {
      console.error('创建通知渠道失败:', error);
      throw error;
    }
  }

  /**
   * 确保默认高优先级渠道已创建
   */
  async function ensureDefaultChannel(): Promise<void> {
    if (channelCreated) return;

    try {
      await createChannel({
        id: DEFAULT_CHANNEL_ID,
        name: '重要通知',
        description: '会在前台弹出的重要通知',
        importance: Importance.High,
        vibration: true,
      });
      channelCreated = true;
    } catch (error) {
      // 渠道可能已存在，忽略错误
      channelCreated = true;
    }
  }

  /**
   * 发送通知
   * @param options 通知选项
   * @param highPriority 是否使用高优先级（前台也弹出），默认 true
   */
  async function send(options: NotificationOptions, highPriority = true): Promise<void> {
    loading.value = true;
    try {
      // 确保有权限
      const granted = await isPermissionGranted();
      if (!granted) {
        throw new Error('通知权限未授权');
      }

      // 如果需要高优先级且没有指定渠道，使用默认高优先级渠道
      if (highPriority && !options.channelId) {
        await ensureDefaultChannel();
        await sendNotification({
          title: options.title,
          body: options.body,
          channelId: DEFAULT_CHANNEL_ID,
        });
      } else {
        await sendNotification({
          title: options.title,
          body: options.body,
          channelId: options.channelId,
        });
      }
    } catch (error) {
      console.error('发送通知失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    permissionGranted,
    loading,
    checkPermission,
    requestPermission: requestNotificationPermission,
    createChannel: createNotificationChannel,
    send,
  };
}

export type { NotificationOptions, NotificationChannel };
