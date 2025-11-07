<template>
  <div class="immersive-navbar">
    <div class="navbar-content">
      <div class="navbar-left" @click="handleLeftClick">
        <slot name="left">
          <van-icon name="arrow-left" size="20" />
        </slot>
      </div>
      
      <div class="navbar-title">
        <slot name="title">{{ title }}</slot>
      </div>
      
      <div class="navbar-right" @click="handleRightClick">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Props {
  /** 标题文字 */
  title?: string;
  /** 左侧点击事件（默认返回） */
  onLeftClick?: () => void;
  /** 右侧点击事件 */
  onRightClick?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
});

const router = useRouter();

const handleLeftClick = () => {
  if (props.onLeftClick) {
    props.onLeftClick();
  } else {
    router.back();
  }
};

const handleRightClick = () => {
  if (props.onRightClick) {
    props.onRightClick();
  }
};
</script>

<style scoped>
/**
 * 完全沉浸式导航栏
 * - 透明背景，无毛玻璃效果
 * - 固定在屏幕顶部
 * - 内容自动避开顶部安全区域（刘海）
 * - 适用于完全沉浸式页面（登录页、视频页）
 */
.immersive-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  /* 透明背景，完全无背景色 */
  background: transparent;
  /* 顶部安全区域占位 */
  padding-top: env(safe-area-inset-top);
}

.navbar-content {
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-left,
.navbar-right {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* 增加点击区域，改善触摸体验 */
  margin: 0 -12px;
  padding: 0 12px;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  /* 防止标题被左右按钮挤压 */
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

