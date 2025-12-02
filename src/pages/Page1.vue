<template>
  <MainLayout 
    :header-mode="HeaderMode.None"
    :content-start="ContentStart.ScreenTop"
    :tabbar-mode="TabbarMode.Standard"
  >
    <template #tabbar>
      <AppTabbar />
    </template>

    <div class="page1">
    <!-- 内容延伸至屏幕顶部（避开状态栏） -->
    <div class="hero-section">
      <div class="hero-content safe-area-horizontal">
        <h1>首页</h1>
        <p>布局系统测试与演示</p>
        <p class="subtitle">无Header，内容延伸至屏幕顶部</p>
      </div>
    </div>

    <div class="content-section safe-area-horizontal">
      <!-- 布局测试入口 -->
      <van-cell-group inset title="🎨 布局系统测试" style="margin-top: 16px;">
        <van-cell 
          title="主题测试"
          label="测试深浅色切换"
          icon="eye-o"
          is-link
          @click="goToTest('theme')"
        />
        <van-cell 
          title="标准详情页"
          label="有 Header + 固定按钮 + 自动安全区域"
          icon="description"
          is-link
          @click="goToTest('detail')"
        />
        <van-cell 
          title="完全沉浸式（登录页）"
          label="内容覆盖整屏，手动处理安全区域"
          icon="contact"
          is-link
          @click="goToTest('login')"
        />
        <van-cell 
          title="完全沉浸式（视频页）"
          label="视频全屏，控制栏浮动"
          icon="video"
          is-link
          @click="goToTest('video')"
        />
      </van-cell-group>

      <!-- 功能测试入口 -->
      <van-cell-group inset title="🚀 功能测试" style="margin-top: 16px;">
        <van-cell 
          title="地图跳转测试"
          label="原生唤起地图 + 自动 Fallback"
          icon="location-o"
          is-link
          @click="goToTest('map')"
        />
        <van-cell 
          title="扫码测试"
          label="二维码/条形码扫描 + 相册识别"
          icon="scan"
          is-link
          @click="goToTest('qr-scanner')"
        />
      </van-cell-group>

      <!-- 页面特性 -->
      <van-cell-group inset title="当前页面特性" style="margin-top: 16px;">
        <van-cell title="Header" value="无" />
        <van-cell title="内容区域" value="延伸至顶部" />
        <van-cell title="状态栏" value="自动避开" />
        <van-cell title="Tabbar" value="标准 Tabbar" />
      </van-cell-group>
    </div>
  </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import AppTabbar from '@/components/AppTabbar.vue';
import { HeaderMode, ContentStart, TabbarMode } from '@/types/layout';

const router = useRouter();

function goToTest(page: string) {
  router.push(`/test/${page}`);
}
</script>

<style scoped>
.page1 {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
}

/* Hero区域 - 延伸到屏幕顶部 */
.hero-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, #5db9ff 100%);
  padding: 0 0 40px;
  color: white;
}

.hero-content {
  text-align: center;
  /* 内容避开状态栏 */
  padding-top: calc(60px + constant(safe-area-inset-top, 0px));
  padding-top: calc(60px + env(safe-area-inset-top, 0px));
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

.hero-content .subtitle {
  font-size: 14px;
  opacity: 0.7;
}

/* 内容区域 */
.content-section {
  padding-bottom: 24px;
}
</style>


