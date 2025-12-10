<template>
  <MainLayout 
    :header-mode="HeaderMode.None"
    :content-start="ContentStart.SafeArea"
    :tabbar-mode="TabbarMode.Standard"
  >
    <template #tabbar>
      <AppTabbar />
    </template>

    <div class="page3">
    <!-- MainLayout 已处理顶部安全区域，hero-banner 作为内容的一部分，从安全区域下开始 -->
    <div class="hero-banner">
      <div class="hero-content safe-area-horizontal">
        <h1>设置</h1>
        <p>主题设置与页面控制</p>
      </div>
    </div>

    <div class="content-section safe-area-horizontal">
      <!-- 主题设置 -->
      <van-cell-group inset title="主题设置" style="margin-top: 16px;">
        <van-cell 
          :title="`当前模式：${themeStore.mode === 'auto' ? '跟随系统' : themeStore.mode === 'dark' ? '深色' : '浅色'}`"
          :icon="themeIcon"
          is-link 
          @click="showThemeSelector"
        />
        <van-cell 
          :title="`实际主题：${themeStore.resolvedTheme === 'dark' ? '深色' : '浅色'}`"
          :value="`点击上方切换`"
        />
        <van-cell 
          title="快速切换主题"
          is-link
          @click="handleQuickToggle"
        >
          <template #icon>
            <van-icon :name="themeStore.resolvedTheme === 'dark' ? 'moon-o' : 'sun-o'" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 刷新控制 -->
      <van-cell-group inset title="页面控制" style="margin-top: 16px;">
        <van-cell title="刷新页面" is-link @click="handleRefresh">
          <template #icon>
            <van-icon name="replay" />
          </template>
        </van-cell>
        <van-cell title="滚动到顶部" is-link @click="scrollToTop">
          <template #icon>
            <van-icon name="arrow-up" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 页面特性 -->
      <van-cell-group inset title="页面特性" style="margin-top: 16px;">
        <van-cell title="Header" value="无" />
        <van-cell title="内容区域" value="从安全区域下开始" />
        <van-cell title="布局方式" value="Banner延伸到顶部" />
        <van-cell title="滚动区域" value="内容区域内部滚动" />
      </van-cell-group>

      <!-- 安全区域说明 -->
      <van-cell-group inset title="安全区域说明" style="margin-top: 16px;">
        <van-cell>
          <template #title>
            <div class="info-text">
              <p>✅ 顶部导航栏已适配刘海屏</p>
              <p>✅ 底部标签栏已适配 Home Indicator</p>
              <p>✅ 内容区域自动避开安全区</p>
              <p>✅ 支持 iOS 和 Android</p>
              <p>✅ 禁用页面拉伸效果</p>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 测试内容 -->
      <van-cell-group inset title="滚动测试" style="margin-top: 16px;">
        <van-cell 
          v-for="i in 15" 
          :key="i" 
          :title="`列表项 ${i}`" 
          :value="`值 ${i}`"
        />
      </van-cell-group>
    </div>

    <!-- 主题选择器弹窗 -->
    <van-popup
      v-model:show="showThemePicker"
      position="bottom"
      round
      :style="{ padding: '16px 0' }"
    >
      <div class="theme-picker">
        <div class="theme-picker-header">选择主题模式</div>
        <van-cell-group inset>
          <van-cell
            title="☀️ 浅色模式"
            clickable
            :class="{ 'theme-cell-active': themeStore.mode === 'light' }"
            @click="selectThemeMode('light')"
          >
            <template #right-icon>
              <van-icon v-if="themeStore.mode === 'light'" name="success" color="#1989fa" />
            </template>
          </van-cell>
          <van-cell
            title="🌙 深色模式"
            clickable
            :class="{ 'theme-cell-active': themeStore.mode === 'dark' }"
            @click="selectThemeMode('dark')"
          >
            <template #right-icon>
              <van-icon v-if="themeStore.mode === 'dark'" name="success" color="#1989fa" />
            </template>
          </van-cell>
          <van-cell
            title="🔄 跟随系统"
            clickable
            :class="{ 'theme-cell-active': themeStore.mode === 'auto' }"
            @click="selectThemeMode('auto')"
          >
            <template #right-icon>
              <van-icon v-if="themeStore.mode === 'auto'" name="success" color="#1989fa" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </van-popup>
  </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { computed, ref } from 'vue';
import {
  AppTabbar,
  ContentStart,
  HeaderMode,
  MainLayout,
  TabbarMode,
} from '@/core/layout';
import type { ThemeMode } from '@/core/theme';
import { useThemeStore } from '@/core/theme';

const themeStore = useThemeStore();
const showThemePicker = ref(false);

// 计算主题图标
const themeIcon = computed(() => {
  if (themeStore.mode === 'auto') {
    return 'replay';
  }
  return themeStore.mode === 'dark' ? 'moon-o' : 'sun-o';
});

// 显示主题选择器
const showThemeSelector = () => {
  showThemePicker.value = true;
};

// 快速切换主题
const handleQuickToggle = () => {
  themeStore.toggleTheme();

  const modeText =
    themeStore.mode === 'auto'
      ? `跟随系统 (当前${themeStore.resolvedTheme === 'dark' ? '深色' : '浅色'})`
      : themeStore.mode === 'dark'
        ? '深色模式'
        : '浅色模式';

  showToast({
    message: `已切换到${modeText}`,
    icon: themeStore.resolvedTheme === 'dark' ? 'moon-o' : 'sun-o',
  });
};

// 选择主题模式
const selectThemeMode = (mode: ThemeMode) => {
  if (mode !== themeStore.mode) {
    themeStore.setMode(mode);

    const modeText =
      mode === 'auto'
        ? `跟随系统 (当前${themeStore.resolvedTheme === 'dark' ? '深色' : '浅色'})`
        : mode === 'dark'
          ? '深色模式'
          : '浅色模式';

    showToast({
      message: `已切换到${modeText}`,
      icon: themeStore.resolvedTheme === 'dark' ? 'moon-o' : 'sun-o',
    });
  }

  showThemePicker.value = false;
};

// 刷新页面
const handleRefresh = () => {
  showToast({
    message: '已刷新',
    icon: 'success',
    duration: 1000,
  });
};

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast({
    message: '已回到顶部',
    icon: 'success',
    duration: 1000,
  });
};
</script>

<style scoped>
.page3 {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
}

/* Hero Banner */
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 0;
  color: white;
}

.hero-content {
  text-align: center;
}

.hero-content h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px;
}

.hero-content p {
  font-size: 16px;
  margin: 8px 0;
  opacity: 0.9;
}

/* 内容区域 */
.content-section {
  padding-bottom: 24px;
}

/* 信息文本 */
.info-text {
  line-height: 1.8;
}

.info-text p {
  margin: 8px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 主题选择器 */
.theme-picker {
  padding: 0 16px 16px;
}

.theme-picker-header {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 16px 0;
  color: var(--color-text-primary);
}

.theme-cell-active {
  background-color: var(--color-bg-tertiary);
}

.theme-picker :deep(.van-cell) {
  font-size: 16px;
}

.theme-picker :deep(.van-cell__title) {
  font-weight: 500;
}
</style>


