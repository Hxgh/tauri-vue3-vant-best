<script setup lang="ts">
import { ref } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { showToast, showLoadingToast, closeToast } from 'vant';
import { useRouter } from 'vue-router';
import { HeaderMode, ContentStart, TabbarMode } from '@/types/layout';

const router = useRouter();

// 测试地点
const testLocations = [
  {
    name: '成都天府广场',
    lat: 30.660479,
    lng: 104.065762,
  },
  {
    name: '西安钟楼',
    lat: 34.260493,
    lng: 108.944309,
  },
];

const selectedLocationIndex = ref(0);
const selectedMapType = ref('amap');

const mapTypes = [
  { label: '高德地图', value: 'amap' },
  { label: '百度地图', value: 'baidu' },
  { label: '腾讯地图', value: 'tencent' },
];

interface MapResult {
  success: boolean;
  message: string;
}

const openMap = async () => {
  const location = testLocations[selectedLocationIndex.value];
  
  const toast = showLoadingToast({
    message: '正在打开地图...',
    forbidClick: true,
    duration: 0,
  });

  try {
    const result = await invoke<MapResult>('open_map_navigation', {
      lat: location.lat,
      lng: location.lng,
      name: location.name,
      appType: selectedMapType.value,
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
      message: error as string,
      icon: 'fail',
    });
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <MainLayout
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="地图跳转测试"
    :show-back="true"
    @back="goBack"
  >
    <div class="map-test-page">
      <van-cell-group inset title="选择目的地">
        <van-radio-group v-model="selectedLocationIndex">
          <van-cell
            v-for="(location, index) in testLocations"
            :key="location.name"
            clickable
            @click="selectedLocationIndex = index"
          >
            <template #title>
              <span class="location-name">{{ location.name }}</span>
            </template>
            <template #right-icon>
              <van-radio :name="index" />
            </template>
          </van-cell>
        </van-radio-group>
      </van-cell-group>

      <van-cell-group inset title="选择地图应用">
        <van-radio-group v-model="selectedMapType">
          <van-cell
            v-for="map in mapTypes"
            :key="map.value"
            clickable
            @click="selectedMapType = map.value"
          >
            <template #title>
              <span class="map-name">{{ map.label }}</span>
            </template>
            <template #right-icon>
              <van-radio :name="map.value" />
            </template>
          </van-cell>
        </van-radio-group>
      </van-cell-group>

      <van-cell-group inset title="功能说明">
        <van-cell title="原生唤起" label="优先尝试唤起原生地图 App" />
        <van-cell title="自动 Fallback" label="未安装时自动打开网页版" />
        <van-cell title="跨平台支持" label="Android / iOS / 桌面端" />
      </van-cell-group>

      <div class="action-area">
        <van-button type="primary" block @click="openMap">
          打开地图导航
        </van-button>
      </div>

      <van-cell-group inset title="当前配置">
        <van-cell title="目的地" :value="testLocations[selectedLocationIndex].name" />
        <van-cell title="经纬度" :value="`${testLocations[selectedLocationIndex].lat}, ${testLocations[selectedLocationIndex].lng}`" />
        <van-cell title="地图类型" :value="mapTypes.find(m => m.value === selectedMapType)?.label" />
      </van-cell-group>
    </div>
  </MainLayout>
</template>

<style scoped>
.map-test-page {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
  padding: 16px 0;
}

.location-name,
.map-name {
  font-weight: 500;
}

.action-area {
  padding: 24px 16px;
}

.van-cell-group {
  margin-bottom: 16px;
}
</style>

