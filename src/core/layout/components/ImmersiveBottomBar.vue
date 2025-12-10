<template>
  <div class="immersive-bottom-bar">
    <div class="bottom-bar-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// 沉浸式底部栏
// - 透明背景
// - 自动处理底部安全区域
// - 通过 slot 自定义内容
</script>

<style scoped>
/**
 * 完全沉浸式底部栏
 * - 透明背景，无毛玻璃效果
 * - 固定在屏幕底部
 * - 内容自动避开底部安全区域（Home 键）
 * - 适用于完全沉浸式页面（视频页、图片查看器）
 */
.immersive-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  /* 透明背景，完全无背景色 */
  background: transparent;
  /* 底部安全区域占位 */
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-bar-content {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

