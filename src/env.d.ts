/// <reference types="@rsbuild/core/types" />

// ============ Vue 模块声明 ============
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  // biome-ignore lint/complexity/noBannedTypes: Vue component type
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// ============ 环境变量类型 ============
interface ImportMetaEnv {
  /** 是否为开发模式 */
  readonly DEV: boolean;
  /** 是否为生产模式 */
  readonly PROD: boolean;
  /** 模式 (development | production) */
  readonly MODE: string;
  /** 基础 URL */
  readonly BASE_URL: string;
  /** 开发服务器主机地址 */
  readonly DEV_SERVER_HOST?: string;
  /** 开发服务器端口 */
  readonly DEV_SERVER_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ============ Web Audio API 扩展 ============
interface Window {
  /** Safari/旧版浏览器的 AudioContext */
  webkitAudioContext?: typeof AudioContext;

  // ============ 主题系统 ============
  /** Android 注入的系统主题 */
  __ANDROID_SYSTEM_THEME__?: 'light' | 'dark';
  /** iOS 注入的系统主题 */
  __IOS_SYSTEM_THEME__?: 'light' | 'dark';
  /** 强制主题检查函数（由原生层调用） */
  __FORCE_THEME_CHECK__?: () => void;

  // ============ Android 桥接 ============
  /** Android 主题桥接 */
  AndroidTheme?: {
    setTheme: (
      theme: 'light' | 'dark',
      mode: 'light' | 'dark' | 'auto',
    ) => void;
  };
  /** Android 地图桥接 */
  AndroidMap?: {
    isAppInstalled: (packageName: string) => boolean;
  };

  // ============ iOS 桥接 ============
  webkit?: {
    messageHandlers?: {
      /** iOS 主题消息处理器 */
      iOSTheme?: {
        postMessage: (message: {
          action: 'setTheme';
          theme: 'light' | 'dark';
          mode: 'light' | 'dark' | 'auto';
        }) => void;
      };
    };
  };
}

// ============ MediaTrackCapabilities 扩展 ============
interface MediaTrackCapabilities {
  /** 手电筒/闪光灯支持 */
  torch?: boolean;
}

// ============ MediaTrackConstraintSet 扩展 ============
interface MediaTrackConstraintSet {
  /** 手电筒/闪光灯控制 */
  torch?: boolean;
}
