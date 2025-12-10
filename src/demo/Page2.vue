<template>
  <MainLayout 
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.Standard"
    header-title="发现"
  >
    <template #tabbar>
      <AppTabbar />
    </template>

    <div class="page2">
    <div class="content-wrapper safe-area-horizontal">
      <!-- 欢迎信息 -->
      <div class="welcome-card">
        <h2>页面2</h2>
        <p>有Header，内容从Header下方开始</p>
      </div>

      <!-- 页面特性 -->
      <van-cell-group inset title="页面特性" style="margin-top: 16px;">
        <van-cell title="Header" value="显示" />
        <van-cell title="内容区域" value="从Header下方开始" />
        <van-cell title="布局方式" value="标准布局" />
        <van-cell title="适配方式" value="自动适配安全区域" />
      </van-cell-group>

      <!-- 功能演示 -->
      <van-cell-group inset title="功能演示" style="margin-top: 16px;">
        <van-cell title="显示通知" is-link @click="showNotifyFunc" />
        <van-cell title="显示对话框" is-link @click="showDialogFunc" />
        <van-cell title="显示Toast" is-link @click="showToastFunc" />
      </van-cell-group>

      <!-- 滚动测试 -->
      <van-cell-group inset title="滚动测试" style="margin-top: 16px;">
        <van-cell 
          v-for="i in 20" 
          :key="i" 
          :title="`列表项 ${i}`" 
          :value="`值 ${i}`"
        />
      </van-cell-group>
    </div>
  </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { showDialog, showNotify, showToast } from 'vant';
import {
  AppTabbar,
  ContentStart,
  HeaderMode,
  MainLayout,
  TabbarMode,
} from '@/core/layout';

const showNotifyFunc = () => {
  showNotify({ type: 'success', message: '通知内容' });
};

const showDialogFunc = () => {
  showDialog({
    title: '提示',
    message: '这是一个对话框',
  });
};

const showToastFunc = () => {
  showToast('提示内容');
};
</script>

<style scoped>
.page2 {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
}

.content-wrapper {
  padding-top: 16px;
  padding-bottom: 24px;
}

.welcome-card {
  background-color: var(--color-bg-primary);
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  margin: 0 16px;
  box-shadow: var(--shadow-light);
}

.welcome-card h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--color-text-primary);
}

.welcome-card p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 4px 0;
}
</style>


