/**
 * Tauri 命令类型声明
 */

declare module '@tauri-apps/api/core' {
  export function invoke<T>(
    cmd: 'open_map_navigation',
    args: {
      lat: number;
      lng: number;
      name: string;
      appType: 'amap' | 'baidu' | 'tencent';
    }
  ): Promise<T>;
}

export interface MapResult {
  success: boolean;
  message: string;
}

