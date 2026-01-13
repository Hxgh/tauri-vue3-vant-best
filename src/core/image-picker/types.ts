/**
 * 图片选择器类型定义
 */
import type { Ref, ComputedRef } from 'vue';
import type { UploaderFileListItem } from 'vant';

/** 图片压缩配置 */
export interface ImageCompressOptions {
  /** 压缩后最大大小 (MB)，默认 0.3 */
  maxSizeMB?: number;
  /** 最大宽高 (px)，默认 1200 */
  maxWidthOrHeight?: number;
  /** 压缩质量 0-1，默认 0.7 */
  quality?: number;
}

/** 图片选择器配置 */
export interface UseImagePickerOptions {
  /** 最大图片数量，默认 9 */
  maxCount?: number;
  /** 单张最大大小 (bytes)，默认 10MB */
  maxSize?: number;
  /** 压缩配置，默认 false（不压缩）。传 true 使用默认压缩参数，传对象自定义参数 */
  compress?: boolean | ImageCompressOptions;
}

/** 图片选择器返回值 */
export interface UseImagePickerReturn {
  /** 文件列表（用于 van-uploader v-model） */
  fileList: Ref<UploaderFileListItem[]>;
  /** 图片 base64 URL 列表 */
  previewUrls: ComputedRef<string[]>;
  /** van-uploader 的统一配置 */
  uploaderProps: ComputedRef<Record<string, unknown>>;
  /** 重置文件列表 */
  reset: () => void;
}
