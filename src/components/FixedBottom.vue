<template>
  <div class="fixed-bottom">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// 固定底部组件
// 自动处理底部安全区域，适用于详情页的固定按钮
</script>

<style scoped>
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-bg-primary);
  border-top: 1px solid var(--van-border-color);
  padding: 12px 16px;
  /* 自动处理底部安全区域 */
  padding-bottom: calc(12px + max(env(safe-area-inset-bottom), 20px));
}
</style>

