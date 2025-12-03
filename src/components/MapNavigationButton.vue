<script setup lang="ts">
import { ActionSheet } from 'vant';
import { computed, ref } from 'vue';
import {
  checkMapInstalled,
  getMapApps,
  useMapNavigation,
} from '@/composables/useMapNavigation';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

const props = defineProps<Props>();

// biome-ignore lint/correctness/noUnusedVariables: used in template
const { loading, handleMapSelect } = useMapNavigation(
  props.lat,
  props.lng,
  props.name,
);
const showActionSheet = ref(false);
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

// 点击时检查已安装的地图应用
const handleClick = async () => {
  if (isChecking.value) return;

  isChecking.value = true;
  try {
    const installed = new Set<string>();
    for (const app of mapApps) {
      const isInstalled = await checkMapInstalled(app.value);
      if (isInstalled) {
        installed.add(app.value);
      }
    }
    installedMaps.value = installed;
    showActionSheet.value = true;
  } finally {
    isChecking.value = false;
  }
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleSelect = async (action: {
  name: string;
  value: string;
}): Promise<void> => {
  showActionSheet.value = false;
  await handleMapSelect(action.value as 'amap' | 'baidu' | 'tencent');
};
</script>

<template>
  <div class="map-navigation-button" @click="handleClick">
    <slot />
  </div>

  <ActionSheet
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
