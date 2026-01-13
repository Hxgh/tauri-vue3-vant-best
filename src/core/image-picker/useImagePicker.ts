/**
 * 图片选择器 Composable
 * 基于 van-uploader + HTML5 原生能力
 */
import { ref, computed } from 'vue';
import type { UploaderFileListItem } from 'vant';
import { showToast, showLoadingToast, closeToast } from 'vant';
import { logger } from '@/core/platform';
import type {
  UseImagePickerOptions,
  UseImagePickerReturn,
  ImageCompressOptions,
} from './types';

/** 默认压缩配置 */
const DEFAULT_COMPRESS_OPTIONS: Required<ImageCompressOptions> = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 1200,
  quality: 0.7,
};

/** 默认最大文件大小 10MB */
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

/** 允许的图片类型 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * 压缩图片
 */
async function compressImage(
  file: File,
  options: Required<ImageCompressOptions>
): Promise<File> {
  const originalSize = file.size / 1024 / 1024;

  // 小于目标大小，跳过压缩
  if (originalSize <= options.maxSizeMB) {
    logger.debug('[ImagePicker] 文件已足够小，跳过压缩:', originalSize.toFixed(2), 'MB');
    return file;
  }

  try {
    showLoadingToast({ message: '压缩中...', forbidClick: true, duration: 0 });

    const imageCompression = (await import('browser-image-compression')).default;
    const compressed = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB,
      maxWidthOrHeight: options.maxWidthOrHeight,
      initialQuality: options.quality,
      useWebWorker: false,
    });

    closeToast();

    const compressedSize = compressed.size / 1024 / 1024;
    const ratio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
    logger.debug(`[ImagePicker] 压缩完成: ${originalSize.toFixed(2)}MB → ${compressedSize.toFixed(2)}MB (${ratio}%)`);
    showToast({ message: `已压缩 ${ratio}%`, className: 'van-toast--dark' });

    return compressed;
  } catch (error) {
    closeToast();
    logger.error('[ImagePicker] 压缩失败:', error);
    showToast({ message: '压缩失败，使用原图', className: 'van-toast--dark' });
    return file;
  }
}

/**
 * 文件转 base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 图片选择器 Composable
 *
 * @example
 * ```ts
 * // 基础用法
 * const { uploaderProps, previewUrls, reset } = useImagePicker();
 *
 * // 带压缩
 * const { uploaderProps } = useImagePicker({ compress: true });
 *
 * // 自定义压缩参数
 * const { uploaderProps } = useImagePicker({
 *   compress: { maxSizeMB: 0.5, maxWidthOrHeight: 800 }
 * });
 * ```
 *
 * @example
 * ```vue
 * <van-uploader v-bind="uploaderProps" />
 * ```
 */
export function useImagePicker(options?: UseImagePickerOptions): UseImagePickerReturn {
  const maxCount = options?.maxCount ?? 9;
  const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
  const compress = options?.compress ?? false;

  const fileList = ref<UploaderFileListItem[]>([]);

  const previewUrls = computed(() =>
    fileList.value.filter((item) => item.content).map((item) => item.content as string)
  );

  /** 获取压缩配置 */
  function getCompressOptions(): Required<ImageCompressOptions> | null {
    if (!compress) return null;
    if (compress === true) return DEFAULT_COMPRESS_OPTIONS;
    return { ...DEFAULT_COMPRESS_OPTIONS, ...compress };
  }

  /** 验证文件类型 */
  function validateType(file: File): boolean {
    return ALLOWED_TYPES.includes(file.type);
  }

  /** 验证文件大小 */
  function validateSize(file: File): boolean {
    return file.size <= maxSize;
  }

  /** beforeRead 回调 */
  function beforeRead(file: File | File[]): boolean {
    const files = Array.isArray(file) ? file : [file];
    for (const f of files) {
      // 放宽类型验证：允许空类型或 image/* 类型（Android WebView 可能返回空类型）
      const isValidType = !f.type || f.type.startsWith('image/') || ALLOWED_TYPES.includes(f.type);
      if (!isValidType) {
        showToast({ message: '请选择图片文件', className: 'van-toast--dark' });
        return false;
      }
      if (!validateSize(f)) {
        showToast({ message: `图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`, className: 'van-toast--dark' });
        return false;
      }
    }
    return true;
  }

  /** afterRead 回调 */
  async function afterRead(
    file: UploaderFileListItem | UploaderFileListItem[]
  ): Promise<void> {
    const files = Array.isArray(file) ? file : [file];
    const compressOptions = getCompressOptions();

    for (const item of files) {
      if (!item.file) continue;

      try {
        let processedFile = item.file;

        // 压缩
        if (compressOptions) {
          processedFile = await compressImage(item.file, compressOptions);
        }

        // 转 base64
        const content = await fileToBase64(processedFile);
        item.content = content;
        item.file = processedFile;
        item.status = 'done';
      } catch (error) {
        logger.error('[ImagePicker] 处理图片失败:', error);
        item.status = 'failed';
        item.message = '处理失败';
      }
    }

    // 触发响应式更新
    fileList.value = [...fileList.value];
  }

  const uploaderProps = computed(() => ({
    modelValue: fileList.value,
    'onUpdate:modelValue': (val: UploaderFileListItem[]) => {
      fileList.value = val;
    },
    maxCount,
    accept: 'image/*',
    multiple: true,
    beforeRead,
    afterRead,
  }));

  function reset(): void {
    fileList.value = [];
  }

  return {
    fileList,
    previewUrls,
    uploaderProps,
    reset,
  };
}
