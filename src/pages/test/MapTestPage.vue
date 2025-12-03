<script setup lang="ts">
import { useRouter } from 'vue-router';
import MapNavigationButton from '@/components/MapNavigationButton.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { ContentStart, HeaderMode, TabbarMode } from '@/types/layout';

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

function goBack() {
  router.back();
}
</script>

<template>
  <MainLayout
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="地图跳转测试"
  >
    <template #header-left>
      <van-icon name="arrow-left" @click="goBack" />
    </template>

    <div class="map-test-page">
      <div class="header-info">
        <van-tag type="primary">地图导航</van-tag>
        <h2>MapNavigationButton 组件</h2>
        <p class="subtitle">组件化地图导航方案</p>
      </div>

      <van-cell-group inset title="组件示例">
        <div v-for="location in testLocations" :key="location.name" style="padding: 16px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="flex: 1;">
              <div style="font-weight: 500; margin-bottom: 4px;">{{ location.name }}</div>
              <div style="font-size: 12px; color: #999;">{{ location.lat }}, {{ location.lng }}</div>
            </div>
            <MapNavigationButton
              :lat="location.lat"
              :lng="location.lng"
              :name="location.name"
            >
              <van-button size="small" type="primary">
                导航
              </van-button>
            </MapNavigationButton>
          </div>
        </div>
      </van-cell-group>

      <van-cell-group inset title="功能特性">
        <van-cell>
          <template #title>
            <div class="feature-text">
              <p>✅ 组件化方案 - 无需写死代码</p>
              <p>✅ 支持自定义内容包裹</p>
              <p>✅ 自动检测地图应用安装</p>
              <p>✅ 未安装时自动 Fallback 到网页版</p>
              <p>✅ 跨平台支持（Android/iOS/桌面）</p>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="滚动测试">
        <van-cell 
          v-for="i in 10" 
          :key="i" 
          :title="`测试项 ${i}`" 
          :value="`值 ${i}`"
        />
      </van-cell-group>
    </div>
  </MainLayout>
</template>

<style scoped>
.map-test-page {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
}

.header-info {
  background: var(--color-bg-primary);
  padding: 24px;
  text-align: center;
}

.header-info h2 {
  margin: 12px 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 4px 0;
}

.feature-text p {
  margin: 8px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.van-cell-group {
  margin-bottom: 16px;
}
</style>

