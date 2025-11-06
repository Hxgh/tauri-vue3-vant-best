<template>
  <MainLayout
    v-model="activeTab"
    :show-header="currentPageConfig.showHeader"
    :header-title="currentPageConfig.headerTitle"
    :show-tabbar="true"
    :extend-to-top="currentPageConfig.extendToTop"
    @tab-change="handleTabChange"
  >
    <!-- 自定义Header（如果页面需要） -->
    <template v-if="currentPageConfig.showHeader" #header>
      <van-nav-bar :title="currentPageConfig.headerTitle">
        <template #left>
          <div @click="handleHeaderAction" class="nav-icon-btn">
            <van-icon name="bars" size="18" />
          </div>
        </template>
        <template #right>
          <div class="nav-right-actions">
            <div @click="handleSearch" class="nav-icon-btn">
              <van-icon name="search" size="18" />
            </div>
          </div>
        </template>
      </van-nav-bar>
    </template>

    <!-- 页面内容 -->
    <component :is="currentPageComponent" />

    <!-- 自定义Tabbar -->
    <template #tabbar>
      <van-tabbar v-model="activeTab" :border="false" :fixed="false">
        <van-tabbar-item icon="home-o">首页</van-tabbar-item>
        <van-tabbar-item icon="search">发现</van-tabbar-item>
        <van-tabbar-item icon="setting-o">设置</van-tabbar-item>
      </van-tabbar>
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { computed, ref } from 'vue';
import MainLayout from './layouts/MainLayout.vue';
import Page1 from './pages/Page1.vue';
import Page2 from './pages/Page2.vue';
import Page3 from './pages/Page3.vue';

// 当前激活的Tab
const activeTab = ref(0);

// 页面配置
interface PageConfig {
  showHeader: boolean;
  headerTitle: string;
  extendToTop: boolean;
}

// 各个页面的配置
const pagesConfig: Record<number, PageConfig> = {
  0: {
    showHeader: false, // 页1：无Header
    headerTitle: '',
    extendToTop: true, // 内容延伸至屏幕顶部（沉浸式，Hero背景超过安全区域）
  },
  1: {
    showHeader: true, // 页2：有Header
    headerTitle: '发现',
    extendToTop: false, // 标准布局
  },
  2: {
    showHeader: false, // 页3：无Header
    headerTitle: '',
    extendToTop: false, // 不延伸，内容从安全区域内开始
  },
};

// 当前页面配置
const currentPageConfig = computed(() => {
  return pagesConfig[activeTab.value] || pagesConfig[0];
});

// 当前页面组件
const currentPageComponent = computed(() => {
  const components = [Page1, Page2, Page3];
  return components[activeTab.value] || Page1;
});

// 处理Tab切换
const handleTabChange = (index: number) => {
  console.log('Tab changed to:', index);
};

// Header左侧按钮点击
const handleHeaderAction = () => {
  showToast({
    message: '菜单功能',
    icon: 'bars',
  });
};

// Header右侧搜索按钮点击
const handleSearch = () => {
  showToast({
    message: '搜索功能',
    icon: 'search',
  });
};
</script>

<style scoped>
/* 导航栏按钮样式 */
.nav-icon-btn {
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.nav-icon-btn:active {
  background-color: var(--color-bg-tertiary);
}

.nav-right-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
