/**
 * 图片选择器模块
 * 提供调用相机/相册选择图片的能力，支持可选压缩
 *
 * @module core/image-picker
 *
 * ## 功能特性
 * - 跨平台支持：基于 HTML5 原生能力 + Vant van-uploader
 * - 移动端自动弹出系统选择框（相机/相册）
 * - 可选图片压缩（基于 browser-image-compression）
 * - 支持多选、数量限制、大小限制
 * - 自动转换为 base64 格式
 *
 * ## 使用方式
 *
 * ### 1. 基础用法（不压缩）
 * ```ts
 * import { useImagePicker } from '@/core/image-picker';
 *
 * const { uploaderProps, previewUrls, reset } = useImagePicker({
 *   maxCount: 9,
 * });
 * ```
 *
 * ### 2. 带压缩（默认 300KB）
 * ```ts
 * const { uploaderProps } = useImagePicker({
 *   maxCount: 3,
 *   compress: true,
 * });
 * ```
 *
 * ### 3. 自定义压缩参数
 * ```ts
 * const { uploaderProps } = useImagePicker({
 *   maxCount: 3,
 *   compress: {
 *     maxSizeMB: 0.5,        // 目标 500KB
 *     maxWidthOrHeight: 800, // 最大尺寸
 *     quality: 0.8,          // 质量 80%
 *   },
 * });
 * ```
 *
 * ### 4. 模板绑定
 * ```vue
 * <template>
 *   <!-- 注意：uploaderProps 是 computed，嵌套在对象中需要 .value -->
 *   <van-uploader v-bind="uploaderProps.value" />
 * </template>
 * ```
 *
 * ### 5. 获取图片数据
 * ```ts
 * // 获取 base64 URL 列表（用于提交）
 * const urls = previewUrls.value;
 *
 * // 获取完整文件列表
 * const files = fileList.value;
 *
 * // 重置
 * reset();
 * ```
 *
 * ## 依赖
 * - vant（van-uploader 组件）
 * - browser-image-compression（可选，压缩功能）
 *
 * ## Android 配置
 * MainActivity 需要实现 onShowFileChooser 支持文件选择
 * 模板已在 src/core/scripts/templates/MainActivity/ 中配置
 */
export type {
  ImageCompressOptions,
  UseImagePickerOptions,
  UseImagePickerReturn,
} from './types';

export { useImagePicker } from './useImagePicker';
