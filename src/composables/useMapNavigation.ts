import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { showToast, showLoadingToast, closeToast } from 'vant';

// Android Bridge 类型定义
declare global {
  interface Window {
    AndroidMap?: {
      isAppInstalled: (packageName: string) => boolean;
    };
  }
}

export interface MapApp {
  label: string;
  value: 'amap' | 'baidu' | 'tencent';
  scheme: string;
}

export interface MapResult {
  success: boolean;
  message: string;
}

const MAP_APPS: MapApp[] = [
  { label: '高德地图', value: 'amap', scheme: 'androidamap://' },
  { label: '百度地图', value: 'baidu', scheme: 'baidumap://' },
  { label: '腾讯地图', value: 'tencent', scheme: 'qqmap://' },
];

// 地图应用包名映射
const MAP_PACKAGES: Record<'amap' | 'baidu' | 'tencent', string> = {
  amap: 'com.autonavi.minimap',
  baidu: 'com.baidu.BaiduMap',
  tencent: 'com.tencent.map',
};

/**
 * 检查 Android 是否安装了指定的地图应用（实时检查，无缓存）
 * @param mapType 地图类型
 * @returns 是否已安装
 */
export async function checkMapInstalled(
  mapType: 'amap' | 'baidu' | 'tencent',
): Promise<boolean> {
  // 检查是否在 Android 平台
  const isAndroid = navigator.userAgent.toLowerCase().includes('android');
  if (!isAndroid) {
    // 非 Android 平台（iOS/桌面）总是返回 true
    return true;
  }

  try {
    // 优先使用 Android Bridge 方法（同步，极快）
    if (window.AndroidMap) {
      const packageName = MAP_PACKAGES[mapType];
      return window.AndroidMap.isAppInstalled(packageName);
    }

    // Fallback: 通过 Tauri 命令检查（保持向后兼容）
    const result = await invoke<{ installed: boolean }>('check_map_installed', {
      appType: mapType,
    });

    return result.installed;
  } catch (error) {
    // 如果检查失败，默认返回 false（不显示该地图）
    console.error('[MapCheck] Failed to check map installation:', error);
    return false;
  }
}

/**
 * 打开地图导航
 * @param lat 纬度
 * @param lng 经度
 * @param name 地点名称
 * @param mapType 地图类型
 */
export async function openMapNavigation(
  lat: number,
  lng: number,
  name: string,
  mapType: 'amap' | 'baidu' | 'tencent',
): Promise<void> {
  showLoadingToast({
    message: '正在打开地图...',
    forbidClick: true,
    duration: 0,
  });

  try {
    const result = await invoke<MapResult>('open_map_navigation', {
      lat,
      lng,
      name,
      appType: mapType,
    });

    closeToast();

    if (result.success) {
      showToast({
        message: result.message,
        icon: 'success',
      });
    } else {
      showToast({
        message: result.message,
        icon: 'info',
      });
    }
  } catch (error) {
    closeToast();
    showToast({
      message: `打开地图失败: ${error}`,
      icon: 'fail',
    });
  }
}

/**
 * 获取所有支持的地图应用列表
 */
export function getMapApps(): MapApp[] {
  return MAP_APPS;
}

/**
 * useMapNavigation Hook
 * @param lat 纬度
 * @param lng 经度
 * @param name 地点名称
 * @returns Hook 返回值
 */
export function useMapNavigation(lat: number, lng: number, name: string) {
  const loading = ref(false);
  const mapApps = ref<MapApp[]>(MAP_APPS);
  const availableMaps = computed(() => mapApps.value);

  const handleMapSelect = async (mapType: 'amap' | 'baidu' | 'tencent') => {
    loading.value = true;
    try {
      await openMapNavigation(lat, lng, name, mapType);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    mapApps: availableMaps,
    handleMapSelect,
  };
}
