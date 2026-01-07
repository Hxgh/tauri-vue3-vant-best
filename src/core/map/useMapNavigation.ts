/**
 * 地图导航 Composable
 * 支持高德、百度、腾讯地图的原生导航
 *
 * @module core/map/useMapNavigation
 */

import { invoke } from '@tauri-apps/api/core';
import { closeToast, showLoadingToast, showToast } from 'vant';
import { computed, ref } from 'vue';
import { logger } from '../platform/logger';
import type { MapApp, MapResult, MapType, NavigationTarget } from './types';

/**
 * 支持的地图应用列表
 * name 和 label 都设置为相同值，兼容 Vant ActionSheetAction
 */
const MAP_APPS: MapApp[] = [
  { name: '高德地图', label: '高德地图', value: 'amap', scheme: 'androidamap://' },
  { name: '百度地图', label: '百度地图', value: 'baidu', scheme: 'baidumap://' },
  { name: '腾讯地图', label: '腾讯地图', value: 'tencent', scheme: 'qqmap://' },
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
    logger.error('[MapCheck] Failed to check map installation:', error);
    // 检测失败时默认返回 true，允许用户尝试打开
    return true;
  }
}

/**
 * 打开地图导航
 *
 * 支持三种模式：
 * 1. 经纬度+地址模式：提供 lat + lng + name（最精确，显示地址名称）
 * 2. 纯经纬度模式：仅提供 lat + lng（精确定位，无地址名称）
 * 3. 纯地址模式：仅提供 name（地图应用自动搜索）
 *
 * @param target 导航目标（包含可选的经纬度和必填的地址名称）
 * @param mapType 地图类型
 *
 * @example
 * ```ts
 * // 经纬度+地址模式（最精确）
 * await openMapNavigation({ lat: 39.9, lng: 116.4, name: '天安门' }, 'amap');
 *
 * // 纯经纬度模式（精确定位，无地址名称）
 * await openMapNavigation({ lat: 39.9, lng: 116.4 }, 'amap');
 *
 * // 纯地址模式（地图自动搜索）
 * await openMapNavigation({ name: '北京市天安门广场' }, 'amap');
 *
 * // 直接开始导航（跳过路径规划确认）
 * await openMapNavigation({ lat: 39.9, lng: 116.4, name: '天安门', directNav: true }, 'amap');
 *
 * // 强制显示路径规划
 * await openMapNavigation({ lat: 39.9, lng: 116.4, name: '天安门', directNav: false }, 'amap');
 * ```
 */
export async function openMapNavigation(
  target: NavigationTarget,
  mapType: MapType,
): Promise<void> {
  // 参数校验：必须提供经纬度或地址名称
  const hasCoords = target.lat !== undefined && target.lng !== undefined;
  const hasName = target.name !== undefined && target.name.trim() !== '';

  if (!hasCoords && !hasName) {
    showToast({
      message: '请提供经纬度或地址名称',
      icon: 'fail',
    });
    return;
  }

  // 计算是否直接导航：
  // - directNav 明确指定时使用指定值
  // - 未指定时：有经纬度则直接导航，纯地址则路径规划
  const directNav = target.directNav ?? hasCoords;

  showLoadingToast({
    message: '正在打开地图...',
    forbidClick: true,
    duration: 0,
  });

  try {
    const result = await invoke<MapResult>('open_map_navigation', {
      lat: target.lat ?? null,
      lng: target.lng ?? null,
      name: target.name ?? null,
      appType: mapType,
      directNav,
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
 * @param targetOrGetter 导航目标或返回导航目标的函数（支持响应式更新）
 *
 * @example
 * ```ts
 * const { mapApps, handleMapSelect, checkInstalled } = useMapNavigation(() => ({
 *   lat: 39.9,
 *   lng: 116.4,
 *   name: '天安门',
 * }));
 *
 * // 显示 ActionSheet 前先检测已安装的地图
 * const showNavSheet = async () => {
 *   await checkInstalled();
 *   showSheet.value = true;
 * }
 *
 * // 模板
 * <van-action-sheet
 *   v-model:show="showSheet"
 *   :actions="mapApps"
 *   @select="(item) => handleMapSelect(item.value)"
 * />
 * ```
 */
export function useMapNavigation(
  targetOrGetter: NavigationTarget | (() => NavigationTarget),
) {
  const loading = ref(false);
  const installedMaps = ref<Set<string>>(new Set());
  const isChecked = ref(false);

  // 生成 actions，未安装的地图会被 disabled
  const mapApps = computed(() =>
    MAP_APPS.map((app) => ({
      name: app.label,
      value: app.value,
      disabled: isChecked.value && !installedMaps.value.has(app.value),
    })),
  );

  // 检测已安装的地图应用
  const checkInstalled = async () => {
    if (isChecked.value) return; // 只检测一次

    try {
      const results = await Promise.all(
        MAP_APPS.map((app) => checkMapInstalled(app.value)),
      );

      const installed = new Set<string>();
      results.forEach((isInstalled, index) => {
        if (isInstalled) {
          installed.add(MAP_APPS[index].value);
        }
      });

      installedMaps.value = installed;
      isChecked.value = true;
    } catch (error) {
      logger.error('[MapNavigation] Failed to check installed maps:', error);
      // 检测失败时，默认所有地图都可用
      installedMaps.value = new Set(MAP_APPS.map((app) => app.value));
      isChecked.value = true;
    }
  };

  const handleMapSelect = async (mapType: MapType) => {
    loading.value = true;
    try {
      // 支持 getter 函数，每次调用时获取最新值
      const target =
        typeof targetOrGetter === 'function'
          ? targetOrGetter()
          : targetOrGetter;
      await openMapNavigation(target, mapType);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    mapApps,
    handleMapSelect,
    checkInstalled,
  };
}
