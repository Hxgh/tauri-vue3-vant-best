/**
 * 地图导航 Composable
 * 支持高德、百度、腾讯地图的原生导航
 *
 * @module core/map/useMapNavigation
 */

import { invoke } from '@tauri-apps/api/core';
import { closeToast, showLoadingToast, showToast } from 'vant';
import { computed, ref } from 'vue';
import type { MapApp, MapResult, MapType } from './types';

/**
 * 支持的地图应用列表
 */
const MAP_APPS: MapApp[] = [
  { label: '高德地图', value: 'amap', scheme: 'androidamap://' },
  { label: '百度地图', value: 'baidu', scheme: 'baidumap://' },
  { label: '腾讯地图', value: 'tencent', scheme: 'qqmap://' },
];

/**
 * 地图应用包名映射
 */
const MAP_PACKAGES: Record<MapType, string> = {
  amap: 'com.autonavi.minimap',
  baidu: 'com.baidu.BaiduMap',
  tencent: 'com.tencent.map',
};

/**
 * 检查 Android 是否安装了指定的地图应用
 *
 * @param mapType 地图类型
 * @returns 是否已安装
 */
export async function checkMapInstalled(mapType: MapType): Promise<boolean> {
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
    console.error('[MapCheck] Failed to check map installation:', error);
    return false;
  }
}

/**
 * 打开地图导航
 *
 * @param lat 纬度
 * @param lng 经度
 * @param name 地点名称
 * @param mapType 地图类型
 */
export async function openMapNavigation(
  lat: number,
  lng: number,
  name: string,
  mapType: MapType,
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
 * 地图导航 Hook
 *
 * @param lat 纬度
 * @param lng 经度
 * @param name 地点名称
 *
 * @example
 * ```ts
 * const { loading, mapApps, handleMapSelect } = useMapNavigation(
 *   39.9042,
 *   116.4074,
 *   '北京天安门'
 * );
 *
 * // 显示地图选择列表
 * <van-action-sheet
 *   v-model:show="showSheet"
 *   :actions="mapApps.map(app => ({ name: app.label, value: app.value }))"
 *   @select="(item) => handleMapSelect(item.value)"
 * />
 * ```
 */
export function useMapNavigation(lat: number, lng: number, name: string) {
  const loading = ref(false);
  const mapApps = ref<MapApp[]>(MAP_APPS);
  const availableMaps = computed(() => mapApps.value);

  const handleMapSelect = async (mapType: MapType) => {
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
