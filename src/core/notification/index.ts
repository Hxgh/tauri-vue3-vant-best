/**
 * 通知系统模块
 * 提供系统通知能力（基于 Tauri notification 插件）
 *
 * @module core/notification
 *
 * ## 功能特性
 * - 检查和请求通知权限
 * - 创建通知渠道（Android 8.0+）
 * - 发送系统通知
 * - 支持前台弹出通知（高优先级）
 *
 * ## 使用方式
 *
 * ```ts
 * import { useNotification } from '@/core/notification';
 *
 * const {
 *   permissionGranted,
 *   loading,
 *   checkPermission,
 *   requestPermission,
 *   createChannel,
 *   send,
 * } = useNotification();
 *
 * // 1. 检查权限
 * const hasPermission = await checkPermission();
 *
 * // 2. 请求权限（如果没有）
 * if (!hasPermission) {
 *   const granted = await requestPermission();
 *   if (!granted) {
 *     console.log('用户拒绝了通知权限');
 *     return;
 *   }
 * }
 *
 * // 3. 发送通知（高优先级，前台也弹出）
 * await send({
 *   title: '新订单',
 *   body: '您有一个新订单待处理',
 * });
 *
 * // 4. 发送普通通知（不在前台弹出）
 * await send({
 *   title: '系统消息',
 *   body: '您的订单已发货',
 * }, false);
 *
 * // 5. 自定义渠道
 * await createChannel({
 *   id: 'order_channel',
 *   name: '订单通知',
 *   description: '订单相关通知',
 *   importance: 'high',
 *   vibration: true,
 * });
 *
 * await send({
 *   title: '订单更新',
 *   body: '您的订单状态已更新',
 *   channelId: 'order_channel',
 * });
 * ```
 *
 * ## 依赖
 * - @tauri-apps/plugin-notification
 *
 * ## Android 注意事项
 * - Android 8.0+ 需要创建通知渠道
 * - importance 为 'high' 时，通知会在前台也弹出（Heads-up 通知）
 * - 默认使用高优先级渠道，自动创建
 */

export type {
  ChannelImportance,
  NotificationChannel,
  NotificationOptions,
} from './types';
export { useNotification } from './useNotification';
