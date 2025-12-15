/**
 * QR扫描器 Composable（跨平台版）
 *
 * - 移动端 App：使用 Tauri 原生 barcode-scanner 插件
 * - Web/桌面端：使用 html5-qrcode 库
 * - 图片识别：统一使用 html5-qrcode
 *
 * @module core/scanner/useQRScanner
 */

import type { Html5QrcodeResult } from 'html5-qrcode';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { closeToast, showLoadingToast, showToast } from 'vant';
import { onUnmounted, ref } from 'vue';
import { AUDIO, SCANNER } from '../constants';
import { isTauriMobile } from '../platform/detect';
import { logger } from '../platform/logger';
import type { ScanError, ScanOptions, ScanResult } from './types';
import { BarcodeFormat } from './types';
import {
  getFormatInfo,
  inferFormatFromContent,
  normalizeFormat,
} from './utils';

/**
 * QR扫描器 Composable
 *
 * @param options 扫描选项
 * @param elementId 扫描器容器元素ID（Web端使用）
 */
export function useQRScanner(options: ScanOptions = {}, elementId?: string) {
  const { vibrate = true, sound = true, onSuccess, onError } = options;

  const scanning = ref(false);
  const result = ref<ScanResult | null>(null);
  const torchOn = ref(false);
  const torchAvailable = ref(false);

  let scannerInstance: Html5Qrcode | null = null;
  let currentStream: MediaStream | null = null;
  let isDestroyed = false;

  /**
   * 震动反馈
   */
  const vibrateDevice = async () => {
    if (!vibrate) return;

    if (isTauriMobile()) {
      try {
        // @ts-expect-error vibrate exists in plugin but not in type definitions
        const { vibrate: tauriVibrate } = await import(
          '@tauri-apps/plugin-barcode-scanner'
        );
        await tauriVibrate();
      } catch {
        if ('vibrate' in navigator) {
          navigator.vibrate(SCANNER.VIBRATE_DURATION);
        }
      }
    } else if ('vibrate' in navigator) {
      navigator.vibrate(SCANNER.VIBRATE_DURATION);
    }
  };

  /**
   * 声音反馈 - 使用 Web Audio API 生成扫码提示音
   */
  const playScanSound = () => {
    if (!sound) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        logger.debug('[Scanner] AudioContext not available');
        return;
      }

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = AUDIO.SCAN_SOUND_FREQUENCY;
      oscillator.type = 'sine';
      gainNode.gain.value = AUDIO.SCAN_SOUND_VOLUME;

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + AUDIO.SCAN_SOUND_DURATION);

      oscillator.onended = () => {
        audioContext.close();
      };
    } catch (error) {
      logger.debug('[Scanner] Failed to play scan sound:', error);
    }
  };

  /**
   * Tauri 原生扫描（移动端）
   */
  const startTauriNativeScan = async (): Promise<ScanResult> => {
    const {
      scan,
      checkPermissions,
      requestPermissions,
      openAppSettings,
      Format,
    } = await import('@tauri-apps/plugin-barcode-scanner');

    let permission = await checkPermissions();

    if (permission !== 'granted') {
      permission = await requestPermissions();

      if (permission !== 'granted') {
        if (permission === 'denied') {
          showToast({ message: '请在设置中开启相机权限', icon: 'fail' });
          try {
            await openAppSettings();
          } catch {
            // 打开设置失败，静默处理
          }
        } else {
          showToast({ message: '请允许访问相机权限', icon: 'fail' });
        }

        const permissionError: ScanError = {
          name: 'ScanError',
          message: '相机权限被拒绝',
          code: 'PERMISSION_DENIED',
        };
        onError?.(permissionError);
        throw permissionError;
      }
    }

    scanning.value = true;

    try {
      const scanResult = await scan({
        formats: [
          Format.QRCode,
          Format.EAN13,
          Format.EAN8,
          Format.Code128,
          Format.Code39,
          Format.Code93,
          Format.Codabar,
          Format.DataMatrix,
          Format.PDF417,
          Format.Aztec,
        ],
        windowed: false,
      });

      let rawFormat = 'UNKNOWN';
      if (scanResult.format !== undefined && scanResult.format !== null) {
        if (typeof scanResult.format === 'string') {
          rawFormat = scanResult.format;
        } else if (typeof scanResult.format === 'object') {
          // 处理对象类型的 format（Tauri 插件可能返回对象）
          const formatObj = scanResult.format as { name?: string };
          rawFormat = formatObj.name || String(scanResult.format) || 'UNKNOWN';
        } else {
          rawFormat = String(scanResult.format);
        }
      }

      let formatType = normalizeFormat(rawFormat);
      if (formatType === BarcodeFormat.UNKNOWN) {
        const inferredFormat = inferFormatFromContent(scanResult.content);
        if (inferredFormat !== BarcodeFormat.UNKNOWN) {
          formatType = inferredFormat;
        }
      }
      const formatInfo = getFormatInfo(formatType);

      const resultData: ScanResult = {
        content: scanResult.content,
        format: rawFormat,
        formatType,
        formatInfo,
        timestamp: Date.now(),
      };

      result.value = resultData;
      await vibrateDevice();
      playScanSound();

      onSuccess?.(resultData);
      return resultData;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('cancelled') ||
        errorMessage.includes('canceled')
      ) {
        const cancelError: ScanError = {
          name: 'ScanError',
          message: '扫描已取消',
          code: 'CANCELLED',
        };
        onError?.(cancelError);
        throw cancelError;
      }

      const scanError: ScanError = {
        name: 'ScanError',
        message: errorMessage || '扫描失败',
        code: 'SCAN_ERROR',
      };
      showToast({ message: '扫描失败', icon: 'fail' });
      onError?.(scanError);
      throw scanError;
    } finally {
      scanning.value = false;
    }
  };

  /**
   * html5-qrcode 扫描（Web/桌面端）
   */
  const startHtml5QrcodeScan = async (): Promise<ScanResult> => {
    return new Promise(async (resolve, reject) => {
      if (!elementId) {
        const error: ScanError = {
          name: 'ScanError',
          message: '未指定扫描器容器元素ID',
          code: 'SCAN_ERROR',
        };
        onError?.(error);
        reject(error);
        return;
      }

      scanning.value = true;
      result.value = null;
      torchOn.value = false;

      try {
        scannerInstance = new Html5Qrcode(elementId);

        const qrCodeSuccessCallback = async (
          decodedText: string,
          decodedResult: Html5QrcodeResult,
        ) => {
          const rawFormat =
            decodedResult.result?.format?.formatName || 'UNKNOWN';
          let formatType = normalizeFormat(rawFormat);
          if (formatType === BarcodeFormat.UNKNOWN) {
            const inferredFormat = inferFormatFromContent(decodedText);
            if (inferredFormat !== BarcodeFormat.UNKNOWN) {
              formatType = inferredFormat;
            }
          }
          const formatInfo = getFormatInfo(formatType);

          const resultData: ScanResult = {
            content: decodedText,
            format: rawFormat,
            formatType,
            formatInfo,
            timestamp: Date.now(),
          };

          result.value = resultData;
          await vibrateDevice();
          playScanSound();

          onSuccess?.(resultData);

          stopScan()
            .then(() => resolve(resultData))
            .catch(() => resolve(resultData));
        };

        const config = {
          fps: SCANNER.DEFAULT_FPS,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minDimension * SCANNER.SCAN_BOX_RATIO);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
        };

        await scannerInstance.start(
          { facingMode: 'environment' },
          config,
          qrCodeSuccessCallback,
          undefined,
        );

        try {
          const videoElement = document.querySelector(
            `#${elementId} video`,
          ) as HTMLVideoElement;
          if (videoElement?.srcObject) {
            currentStream = videoElement.srcObject as MediaStream;
            const videoTrack = currentStream.getVideoTracks()[0];
            const capabilities = videoTrack.getCapabilities();
            torchAvailable.value = 'torch' in capabilities;
          }
        } catch {
          // 检查手电筒支持失败，静默处理
        }
      } catch (error) {
        scanning.value = false;

        const errorMsg =
          error instanceof Error ? error.message : '打开相机失败';
        const scanError: ScanError = {
          name: 'ScanError',
          message: errorMsg,
          code:
            errorMsg.includes('Permission') ||
            errorMsg.includes('NotAllowedError')
              ? 'PERMISSION_DENIED'
              : 'SCAN_ERROR',
        };

        showToast({
          message:
            scanError.code === 'PERMISSION_DENIED'
              ? '相机权限被拒绝'
              : '打开相机失败',
          icon: 'fail',
        });

        onError?.(scanError);
        reject(scanError);
      }
    });
  };

  /**
   * 启动扫描（自动选择实现）
   */
  const startScan = async (): Promise<ScanResult> => {
    if (scanning.value) {
      throw new Error('扫描已在进行中');
    }

    if (isDestroyed) {
      throw new Error('扫描器已销毁');
    }

    if (isTauriMobile()) {
      return await startTauriNativeScan();
    } else {
      return await startHtml5QrcodeScan();
    }
  };

  /**
   * 停止扫描
   */
  const stopScan = async (): Promise<void> => {
    if (isTauriMobile()) {
      try {
        const { cancel } = await import('@tauri-apps/plugin-barcode-scanner');
        await cancel();
      } catch {
        // 取消扫描失败，静默处理
      }
      scanning.value = false;
      return;
    }

    if (torchOn.value && currentStream) {
      try {
        const videoTrack = currentStream.getVideoTracks()[0];
        await videoTrack.applyConstraints({
          advanced: [{ torch: false }],
        });
      } catch {
        // 关闭手电筒失败，静默处理
      }
    }

    torchOn.value = false;
    currentStream = null;
    torchAvailable.value = false;

    if (!scannerInstance) {
      scanning.value = false;
      return;
    }

    try {
      const state = await scannerInstance.getState();
      if (state === Html5QrcodeScannerState.SCANNING) {
        await scannerInstance.stop();
      }
      await scannerInstance.clear();
    } catch {
      // 停止扫描失败，静默处理
    } finally {
      scannerInstance = null;
      scanning.value = false;
    }
  };

  /**
   * 切换手电筒（仅 Web 端支持）
   */
  const toggleTorch = async (): Promise<boolean> => {
    if (isTauriMobile()) {
      showToast({ message: '移动端暂不支持手电筒', icon: 'info-o' });
      return false;
    }

    if (!torchAvailable.value || !currentStream) {
      return false;
    }

    try {
      const videoTrack = currentStream.getVideoTracks()[0];
      const newTorchState = !torchOn.value;

      await videoTrack.applyConstraints({
        advanced: [{ torch: newTorchState }],
      });

      torchOn.value = newTorchState;
      return true;
    } catch {
      showToast({ message: '手电筒控制失败', icon: 'fail' });
      return false;
    }
  };

  /**
   * 从图片识别二维码
   */
  const scanFromImage = async (file?: File): Promise<ScanResult> => {
    let imageFile: File | null = file || null;

    if (isTauriMobile() && !imageFile) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const { readFile } = await import('@tauri-apps/plugin-fs');

        const selected = await open({
          multiple: false,
          filters: [
            {
              name: 'Images',
              extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            },
          ],
        });

        if (!selected) {
          const cancelError: ScanError = {
            name: 'ScanError',
            message: '取消选择',
            code: 'CANCELLED',
          };
          throw cancelError;
        }

        const filePath = typeof selected === 'string' ? selected : selected;
        const fileData = await readFile(filePath);
        const fileName = filePath.split('/').pop() || 'image.jpg';
        const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType =
          ext === 'png'
            ? 'image/png'
            : ext === 'gif'
              ? 'image/gif'
              : 'image/jpeg';

        imageFile = new File([fileData], fileName, { type: mimeType });
      } catch (error: any) {
        if (error?.code === 'CANCELLED') {
          throw error;
        }
        const scanError: ScanError = {
          name: 'ScanError',
          message: '选择图片失败',
          code: 'IMAGE_SCAN_ERROR',
        };
        showToast({ message: '选择图片失败', icon: 'fail' });
        onError?.(scanError);
        throw scanError;
      }
    }

    if (!imageFile) {
      throw new Error('未选择文件');
    }

    if (!imageFile.type.startsWith('image/')) {
      showToast({ message: '请选择图片文件', icon: 'fail' });
      throw new Error('无效的文件类型');
    }

    if (imageFile.size > SCANNER.MAX_IMAGE_SIZE) {
      showToast({ message: '图片大小不能超过 10MB', icon: 'fail' });
      throw new Error('文件过大');
    }

    const tempElementId = `qr-scanner-temp-${Date.now()}`;
    const tempElement = document.createElement('div');
    tempElement.id = tempElementId;
    tempElement.style.display = 'none';
    document.body.appendChild(tempElement);

    const tempScanner = new Html5Qrcode(tempElementId);

    try {
      showLoadingToast({
        message: '正在识别...',
        forbidClick: true,
        duration: 0,
      });

      const scanResult = await tempScanner.scanFile(imageFile, true);

      closeToast();

      if (scanResult) {
        const inferredFormat = inferFormatFromContent(scanResult);
        const formatType = inferredFormat;
        const formatInfo = getFormatInfo(formatType);

        const resultData: ScanResult = {
          content: scanResult,
          format: formatType,
          formatType,
          formatInfo,
          timestamp: Date.now(),
        };

        result.value = resultData;
        await vibrateDevice();
        playScanSound();

        onSuccess?.(resultData);
        return resultData;
      } else {
        closeToast();
        showToast({ message: '未识别到二维码/条形码', icon: 'fail' });
        throw new Error('未识别到二维码/条形码');
      }
    } catch (error) {
      closeToast();

      const errorMsg = error instanceof Error ? error.message : '图片识别失败';
      const scanError: ScanError = {
        name: 'ScanError',
        message: errorMsg,
        code: 'IMAGE_SCAN_ERROR',
      };

      if (!errorMsg.includes('未识别')) {
        showToast({
          message: errorMsg.includes('No MultiFormat Readers')
            ? '图片中未找到二维码/条形码'
            : '图片识别失败',
          icon: 'fail',
        });
      }

      onError?.(scanError);
      throw scanError;
    } finally {
      try {
        await tempScanner.clear();
        tempElement.remove();
      } catch {
        // 清理失败，静默处理
      }
    }
  };

  /**
   * 销毁扫描器
   */
  const destroy = async () => {
    isDestroyed = true;
    await stopScan();
  };

  onUnmounted(() => {
    destroy();
  });

  return {
    // 状态
    scanning,
    result,
    torchOn,
    torchAvailable,

    // 方法
    startScan,
    stopScan,
    scanFromImage,
    toggleTorch,
    destroy,

    // 工具
    isTauriMobile: () => isTauriMobile(),
  };
}

/**
 * 快速扫描（一次性使用）
 */
export async function quickScan(options?: ScanOptions): Promise<ScanResult> {
  const { startScan, destroy } = useQRScanner(options);
  try {
    return await startScan();
  } finally {
    await destroy();
  }
}
