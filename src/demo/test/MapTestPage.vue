<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ContentStart,
  HeaderMode,
  MainLayout,
  TabbarMode,
} from '@/core/layout';
import { MapNavigationButton } from '@/core/map';

const router = useRouter();

// 当前选择的导航模式
const currentMode = ref<'coords_name' | 'coords_only' | 'name_only'>('coords_name');

// 是否直接导航（undefined = 自动判断）
const directNavOption = ref<'auto' | 'true' | 'false'>('auto');

// 模式选项
const modeOptions = [
  { text: '经纬度+地址', value: 'coords_name' },
  { text: '纯经纬度', value: 'coords_only' },
  { text: '纯地址', value: 'name_only' },
];

// 直接导航选项
const directNavOptions = [
  { text: '自动判断', value: 'auto' },
  { text: '直接导航', value: 'true' },
  { text: '路径规划', value: 'false' },
];

// 计算 directNav 值
const directNavValue = computed(() => {
  if (directNavOption.value === 'auto') return undefined;
  return directNavOption.value === 'true';
});

// 测试地点 - 经纬度+地址模式（最精确）
const testLocationsWithAll = [
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

// 测试地点 - 纯经纬度模式（精确定位）
const testLocationsCoordsOnly = [
  {
    lat: 30.660479,
    lng: 104.065762,
    desc: '成都天府广场坐标',
  },
  {
    lat: 39.908722,
    lng: 116.397499,
    desc: '北京天安门坐标',
  },
];

// 测试地点 - 纯地址模式（地图搜索）
const testLocationsNameOnly = [
  {
    name: '上海市东方明珠广播电视塔',
  },
  {
    name: '广州市广州塔',
  },
  {
    name: '深圳市世界之窗',
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
        <h2>三种导航模式测试</h2>
        <p class="subtitle">支持经纬度、地址、混合模式</p>
      </div>

      <!-- 模式选择 -->
      <van-cell-group inset title="选择导航模式">
        <van-radio-group v-model="currentMode" direction="horizontal" style="padding: 12px 16px;">
          <van-radio
            v-for="option in modeOptions"
            :key="option.value"
            :name="option.value"
            style="margin-right: 16px;"
          >
            {{ option.text }}
          </van-radio>
        </van-radio-group>
      </van-cell-group>

      <!-- 直接导航选项 -->
      <van-cell-group inset title="导航行为（仅高德支持）">
        <van-radio-group v-model="directNavOption" direction="horizontal" style="padding: 12px 16px;">
          <van-radio
            v-for="option in directNavOptions"
            :key="option.value"
            :name="option.value"
            style="margin-right: 16px;"
          >
            {{ option.text }}
          </van-radio>
        </van-radio-group>
        <div class="mode-desc">
          <van-tag type="primary">说明</van-tag>
          <span>直接导航：立即开始语音导航；路径规划：先预览路线再导航</span>
        </div>
      </van-cell-group>

      <!-- 模式1：经纬度+地址 -->
      <van-cell-group v-if="currentMode === 'coords_name'" inset title="经纬度+地址模式（最精确）">
        <div class="mode-desc">
          <van-tag type="success">推荐</van-tag>
          <span>同时提供坐标和地址名称，定位最精确</span>
        </div>
        <div v-for="location in testLocationsWithAll" :key="location.name" class="location-item">
          <div class="location-info">
            <div class="location-name">{{ location.name }}</div>
            <div class="location-coords">{{ location.lat.toFixed(4) }}, {{ location.lng.toFixed(4) }}</div>
          </div>
          <MapNavigationButton
            :lat="location.lat"
            :lng="location.lng"
            :name="location.name"
            :direct-nav="directNavValue"
          >
            <van-button size="small" type="primary">导航</van-button>
          </MapNavigationButton>
        </div>
      </van-cell-group>

      <!-- 模式2：纯经纬度 -->
      <van-cell-group v-if="currentMode === 'coords_only'" inset title="纯经纬度模式（精确定位）">
        <div class="mode-desc">
          <van-tag type="primary">精确</van-tag>
          <span>仅提供坐标，无地址名称显示</span>
        </div>
        <div v-for="location in testLocationsCoordsOnly" :key="location.desc" class="location-item">
          <div class="location-info">
            <div class="location-name">{{ location.desc }}</div>
            <div class="location-coords">{{ location.lat.toFixed(4) }}, {{ location.lng.toFixed(4) }}</div>
          </div>
          <MapNavigationButton
            :lat="location.lat"
            :lng="location.lng"
            :direct-nav="directNavValue"
          >
            <van-button size="small" type="primary">导航</van-button>
          </MapNavigationButton>
        </div>
      </van-cell-group>

      <!-- 模式3：纯地址 -->
      <van-cell-group v-if="currentMode === 'name_only'" inset title="纯地址模式（地图搜索）">
        <div class="mode-desc">
          <van-tag type="warning">搜索</van-tag>
          <span>仅提供地址，由地图应用自动搜索定位（直接导航选项无效）</span>
        </div>
        <div v-for="location in testLocationsNameOnly" :key="location.name" class="location-item">
          <div class="location-info">
            <div class="location-name">{{ location.name }}</div>
            <div class="location-coords">无坐标，使用地址搜索</div>
          </div>
          <MapNavigationButton :name="location.name" :direct-nav="directNavValue">
            <van-button size="small" type="primary">导航</van-button>
          </MapNavigationButton>
        </div>
      </van-cell-group>

      <van-cell-group inset title="功能特性">
        <van-cell>
          <template #title>
            <div class="feature-text">
              <p>✅ 三种导航模式灵活选择</p>
              <p>✅ 经纬度+地址：最精确定位</p>
              <p>✅ 纯经纬度：精确坐标导航</p>
              <p>✅ 纯地址：地图自动搜索</p>
              <p>✅ directNav 参数控制导航行为</p>
              <p>✅ 自动检测地图应用安装</p>
              <p>✅ 未安装时自动 Fallback 到网页版</p>
            </div>
          </template>
        </van-cell>
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

.mode-desc {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.location-item {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.location-item:last-child {
  border-bottom: none;
}

.location-info {
  flex: 1;
  min-width: 0;
}

.location-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--color-text-primary);
}

.location-coords {
  font-size: 12px;
  color: var(--color-text-tertiary);
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
