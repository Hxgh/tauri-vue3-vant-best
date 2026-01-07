<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  checkMapInstalled,
  getMapApps,
  openMapNavigation,
} from '@/core/map';
import type { MapType } from '@/core/map';

/**
 * 地图导航按钮组件
 * 支持三种导航模式：
 * 1. 经纬度+地址：lat + lng + name（最精确）
 * 2. 纯经纬度：lat + lng（精确定位）
 * 3. 纯地址：name（地图搜索）
 */
interface Props {
  /** 纬度（可选） */
  lat?: number;
  /** 经度（可选） */
  lng?: number;
  /** 地点名称/地址（可选） */
  name?: string;
  /**
   * 是否直接开始导航（仅高德地图支持）
   * - true: 直接开始语音导航（需要有经纬度）
   * - false: 显示路径规划，用户确认后再导航
   * - undefined: 自动判断（有经纬度时直接导航，纯地址时路径规划）
   */
  directNav?: boolean;
}

const props = defineProps<Props>();

const showActionSheet = ref(false);
const loading = ref(false);
const mapApps = getMapApps();
const installedMaps = ref<Set<string>>(new Set());
const isChecking = ref(false);

// 生成 actions，未安装的地图会被 disabled
// biome-ignore lint/correctness/noUnusedVariables: used in template
const actions = computed(() =>
  mapApps.map((app) => ({
    name: app.label,
    value: app.value,
    disabled: !installedMaps.value.has(app.value),
  })),
);

// 点击时并行检查已安装的地图应用
// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleClick = async () => {
  if (isChecking.value) return;

  isChecking.value = true;
  try {
    // 并行检查所有地图应用
    const results = await Promise.all(
      mapApps.map((app) => checkMapInstalled(app.value)),
    );

    const installed = new Set<string>();
    results.forEach((isInstalled, index) => {
      if (isInstalled) {
        installed.add(mapApps[index].value);
      }
    });

    installedMaps.value = installed;
    showActionSheet.value = true;
  } finally {
    isChecking.value = false;
  }
};

// 直接调用 openMapNavigation，使用当前 props 值（响应式）
// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleSelect = async (action: {
  name: string;
  value: string;
}): Promise<void> => {
  showActionSheet.value = false;
  loading.value = true;
  try {
    await openMapNavigation(
      {
        lat: props.lat,
        lng: props.lng,
        name: props.name,
        directNav: props.directNav,
      },
      action.value as MapType,
    );
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="map-navigation-button" @click="handleClick">
    <slot />
  </div>

  <van-action-sheet
    v-model:show="showActionSheet"
    :actions="actions"
    cancel-text="取消"
    :loading="loading"
    @select="handleSelect"
  />
</template>

<style scoped>
.map-navigation-button {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
</style>
