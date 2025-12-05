<template>
  <div class="main-layout">
    <!-- 顶部Header（可选） -->
    <div 
      v-if="headerMode !== HeaderMode.None" 
      class="header-wrapper"
      :class="{
        'header-immersive': headerMode === HeaderMode.Immersive,
        'header-standard': headerMode === HeaderMode.Standard,
      }"
    >
      <div v-if="headerMode === HeaderMode.Standard" class="safe-area-placeholder-top"></div>
      <div v-else-if="headerMode === HeaderMode.Immersive" class="immersive-status-bar"></div>
      
      <slot name="header">
        <!-- 默认Header -->
        <van-nav-bar :title="headerTitle">
          <template #left>
            <slot name="header-left"></slot>
          </template>
          <template #right>
            <slot name="header-right"></slot>
          </template>
        </van-nav-bar>
      </slot>
    </div>

    <!-- 无Header但需要安全区域占位（固定不滚动） -->
    <div 
      v-if="headerMode === HeaderMode.None && contentStart === ContentStart.SafeArea"
      class="safe-area-spacer"
    ></div>

    <!-- 主内容区域 -->
    <div 
      class="content-wrapper"
      :style="contentStyle"
    >
      <slot></slot>
    </div>

    <!-- 底部Tabbar（可选） -->
    <div 
      v-if="tabbarMode === TabbarMode.Standard" 
      class="tabbar-wrapper"
    >
      <slot name="tabbar">
        <!-- 默认Tabbar -->
        <van-tabbar 
          :model-value="currentTab" 
          :border="false" 
          :fixed="false" 
          @update:model-value="handleTabClick"
        >
          <van-tabbar-item 
            v-for="(tab, index) in tabs" 
            :key="index"
            :icon="tab.icon"
          >
            {{ tab.label }}
          </van-tabbar-item>
        </van-tabbar>
      </slot>
      <div class="safe-area-placeholder-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContentStart, HeaderMode, TabbarMode } from '../types/layout';

interface Tab {
  label: string;
  icon: string;
  name?: string;
}

interface Props {
  // Header 模式
  headerMode?: HeaderMode;
  // Header 标题
  headerTitle?: string;
  // 内容起点
  contentStart?: ContentStart;
  // Tabbar 模式
  tabbarMode?: TabbarMode;
  // Tab 配置
  tabs?: Tab[];
  // 当前激活的Tab索引（从路由获取）
  activeTab?: number;
}

const props = withDefaults(defineProps<Props>(), {
  headerMode: HeaderMode.Standard,
  headerTitle: '',
  contentStart: ContentStart.BelowHeader,
  tabbarMode: TabbarMode.Standard,
  tabs: () => [],
  activeTab: 0,
});

const emit = defineEmits<{
  'tab-change': [index: number];
}>();

// 计算响应式的 activeTab（只读，由路由控制）
// biome-ignore lint/correctness/noUnusedVariables: used in template
const currentTab = computed(() => props.activeTab ?? 0);

// biome-ignore lint/correctness/noUnusedVariables: used in template
function handleTabClick(index: number) {
  emit('tab-change', index);
}

/**
 * 计算内容区域的样式
 * 核心逻辑：根据 headerMode、contentStart、tabbarMode 计算 padding
 */
// biome-ignore lint/correctness/noUnusedVariables: used in template via v-bind
const contentStyle = computed<{ paddingTop: string; paddingBottom: string }>(
  () => {
    let paddingTop = '0';
    let paddingBottom = '0';

    // ==================== 顶部 Padding ====================
    if (props.headerMode === HeaderMode.None) {
      // 无 Header
      if (props.contentStart === ContentStart.SafeArea) {
        // 有固定的 .safe-area-spacer 占位元素（不可滚动），content-wrapper 需要 padding 避开它
        paddingTop = 'var(--sat)';
      } else if (props.contentStart === ContentStart.ScreenTop) {
        paddingTop = '0'; // 从屏幕顶部开始
      }
    } else {
      // 有 Header
      if (props.contentStart === ContentStart.BelowHeader) {
        if (props.headerMode === HeaderMode.Standard) {
          // 标准 Header：Header 高度 + 状态栏高度
          paddingTop = 'calc(46px + var(--sat))';
        } else if (props.headerMode === HeaderMode.Immersive) {
          // 沉浸式 Header：仅 Header 高度（Header 已包含状态栏）
          paddingTop = '46px';
        }
      }
    }

    // ==================== 底部 Padding ====================
    // 注：--skb 是键盘高度（由原生层注入），键盘弹出时自动增加底部 padding
    if (props.tabbarMode === TabbarMode.Standard) {
      // 有 Tabbar：Tabbar 高度 + max(键盘高度, 底部安全区域)
      paddingBottom = 'calc(50px + max(var(--skb), max(var(--sab), 20px)))';
    } else if (props.tabbarMode === TabbarMode.None) {
      // 无 Tabbar：max(键盘高度, 底部安全区域)
      paddingBottom = 'max(var(--skb), max(var(--sab), 20px))';
    } else if (props.tabbarMode === TabbarMode.Immersive) {
      // 完全沉浸式：仅在键盘弹出时添加 padding
      paddingBottom = 'var(--skb)';
    }

    return {
      paddingTop,
      paddingBottom,
    };
  },
);
</script>

<style scoped>
/* ==================== 主容器 ==================== */
.main-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
  overscroll-behavior: none;
}

/* ==================== 顶部Header ==================== */
.header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* 标准 Header（不覆盖状态栏） */
.header-standard {
  background-color: var(--navbar-bg);
}

.header-standard .safe-area-placeholder-top {
  height: constant(safe-area-inset-top, 0px);
  height: env(safe-area-inset-top, 0px);
  background-color: var(--safe-area-top-bg);
}

/* 沉浸式 Header（覆盖状态栏，使用半透明背景） */
.header-immersive {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.98)
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 深色模式的沉浸式 Header 样式移到全局样式 */

.immersive-status-bar {
  height: constant(safe-area-inset-top, 0px);
  height: env(safe-area-inset-top, 0px);
  /* 状态栏区域透明，显示背景 */
}

/* ==================== 安全区域占位（无Header时） ==================== */
.safe-area-spacer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: constant(safe-area-inset-top, 0px);
  height: env(safe-area-inset-top, 0px);
  z-index: 999;
  pointer-events: none; /* 不阻止点击事件 */
  background-color: var(--safe-area-top-bg);
}

/* ==================== 内容区域 ==================== */
.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  /* padding 由 contentStyle 动态计算 */
}

/* ==================== 底部Tabbar ==================== */
.tabbar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background-color: var(--tabbar-bg);
}

.tabbar-wrapper :deep(.van-tabbar) {
  border-top: none;
}

.safe-area-placeholder-bottom {
  height: constant(safe-area-inset-bottom, 0px);
  height: env(safe-area-inset-bottom, 0px);
  min-height: 20px;
  background-color: var(--safe-area-bottom-bg);
}
</style>
