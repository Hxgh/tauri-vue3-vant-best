<template>
  <div class="page1">
    <!-- 内容延伸至屏幕顶部（避开状态栏） -->
    <div class="hero-section">
      <div class="hero-content safe-area-horizontal">
        <h1>12321页2222222面1</h1>
        <p>无Header，内容延伸至屏幕顶部</p>
        <p class="subtitle">状态栏区域已自动避开</p>
      </div>
    </div>

    <div class="content-section safe-area-horizontal">
      <!-- 功能演示卡片 -->
      <van-cell-group inset title="页面特性" style="margin-top: 16px;">
        <van-cell title="Header" value="无" />
        <van-cell title="内容区域" value="延伸至顶部" />
        <van-cell title="状态栏" value="自动避开" />
        <van-cell title="背景色" value="渐变背景" />
      </van-cell-group>

      <!-- 示例列表 -->
      <van-cell-group inset title="示例内容" style="margin-top: 16px;">
        <van-cell 
          v-for="i in 10" 
          :key="i" 
          :title="`列表项 ${i}`" 
          :value="`值 ${i}`"
          is-link
        />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面1：无Header，内容延伸至屏幕顶部（避开状态栏）
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


