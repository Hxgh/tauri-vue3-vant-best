<template>
  <MainLayout 
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="主题测试"
  >
    <template #header-left>
      <van-icon name="arrow-left" @click="goBack" />
    </template>

    <div class="theme-test-page">
      <van-cell-group inset title="当前主题状态">
        <van-cell title="用户设置" :value="themeStore.mode" />
        <van-cell title="实际主题" :value="themeStore.resolvedTheme" />
        <van-cell title="系统主题" :value="systemTheme" />
      </van-cell-group>

      <van-cell-group inset title="快速切换" style="margin-top: 16px;">
        <van-cell 
          title="切换到浅色" 
          icon="sun-o"
          is-link 
          @click="themeStore.setMode('light')"
        />
        <van-cell 
          title="切换到深色" 
          icon="moon-o"
          is-link 
          @click="themeStore.setMode('dark')"
        />
        <van-cell 
          title="跟随系统" 
          icon="replay"
          is-link 
          @click="themeStore.setMode('auto')"
        />
      </van-cell-group>

      <van-cell-group inset title="布局配置" style="margin-top: 16px;">
        <van-cell title="HeaderMode" value="Standard" />
        <van-cell title="ContentStart" value="BelowHeader" />
        <van-cell title="TabbarMode" value="None" />
      </van-cell-group>

      <van-cell-group inset title="主题效果预览" style="margin-top: 16px;">
        <van-cell title="主背景色">
          <template #value>
            <div class="color-box" :style="{ backgroundColor: 'var(--color-bg-primary)' }"></div>
          </template>
        </van-cell>
        <van-cell title="次背景色">
          <template #value>
            <div class="color-box" :style="{ backgroundColor: 'var(--color-bg-secondary)' }"></div>
          </template>
        </van-cell>
        <van-cell title="主文字色">
          <template #value>
            <div class="color-box" :style="{ backgroundColor: 'var(--color-text-primary)' }"></div>
          </template>
        </van-cell>
        <van-cell title="品牌色">
          <template #value>
            <div class="color-box" :style="{ backgroundColor: 'var(--color-primary)' }"></div>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="demo-content">
        <div class="demo-card">
          <h3>组件效果预览</h3>
          <p>主文字颜色</p>
          <p class="secondary">次要文字颜色</p>
          <van-button type="primary" block style="margin-top: 16px;">主按钮</van-button>
          <van-button block style="margin-top: 12px;">默认按钮</van-button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import MainLayout from '@/layouts/MainLayout.vue';
import { HeaderMode, ContentStart, TabbarMode } from '@/types/layout';

const router = useRouter();
const themeStore = useThemeStore();

const systemTheme = computed(() => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
});

function goBack() {
  router.back();
}
</script>

<style scoped>
.theme-test-page {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
  padding: 16px;
  /* 底部留出安全区域 */
  padding-bottom: calc(16px + max(env(safe-area-inset-bottom), 20px));
}

.color-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.demo-content {
  padding: 16px;
  margin-top: 16px;
}

.demo-card {
  background: var(--color-bg-primary);
  padding: 24px;
  border-radius: 12px;
  box-shadow: var(--shadow-light);
}

.demo-card h3 {
  margin: 0 0 16px;
  color: var(--color-text-primary);
  font-size: 20px;
}

.demo-card p {
  margin: 8px 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.demo-card p.secondary {
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>

