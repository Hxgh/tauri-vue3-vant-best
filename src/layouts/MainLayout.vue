<template>
  <div class="main-layout">
    <!-- 顶部Header（可选） -->
    <div v-if="showHeader" class="header-wrapper">
      <div class="safe-area-placeholder-top"></div>
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

    <!-- 主内容区域 -->
    <div 
      class="content-wrapper" 
      :class="{
        'extend-to-top': extendToTop,
        'with-header': showHeader && !extendToTop,
        'with-tabbar': showTabbar
      }"
    >
      <slot></slot>
    </div>

    <!-- 底部Tabbar（可选） -->
    <div v-if="showTabbar" class="tabbar-wrapper">
      <slot name="tabbar">
        <!-- 默认Tabbar -->
        <van-tabbar v-model="activeTab" :border="false" :fixed="false">
          <van-tabbar-item 
            v-for="(tab, index) in tabs" 
            :key="index"
            :icon="tab.icon"
            @click="handleTabClick(index)"
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

interface Tab {
  label: string;
  icon: string;
  name?: string;
}

interface Props {
  // 是否显示Header
  showHeader?: boolean;
  // Header标题
  headerTitle?: string;
  // 是否显示Tabbar
  showTabbar?: boolean;
  // Tab配置
  tabs?: Tab[];
  // 内容是否延伸到顶部（避开状态栏）
  extendToTop?: boolean;
  // 当前激活的Tab索引
  modelValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  headerTitle: '',
  showTabbar: true,
  tabs: () => [],
  extendToTop: false,
  modelValue: 0,
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
  'tab-change': [index: number];
}>();

const activeTab = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleTabClick = (index: number) => {
  emit('tab-change', index);
};
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
  background-color: var(--navbar-bg);
}

.safe-area-placeholder-top {
  height: constant(safe-area-inset-top, 0px);
  height: env(safe-area-inset-top, 0px);
  background-color: var(--safe-area-top-bg);
}

/* ==================== 内容区域 ==================== */
.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  /* 默认情况：无Header时，内容从安全区域内开始 */
  padding-top: constant(safe-area-inset-top, 0px);
  padding-top: env(safe-area-inset-top, 0px);
}

/* 有Header的情况：Header高度 + 安全区域 */
.content-wrapper.with-header {
  padding-top: calc(46px + constant(safe-area-inset-top, 0px));
  padding-top: calc(46px + env(safe-area-inset-top, 0px));
}

/* 有Tabbar的情况 */
.content-wrapper.with-tabbar {
  padding-bottom: calc(50px + max(constant(safe-area-inset-bottom, 0px), 20px));
  padding-bottom: calc(50px + max(env(safe-area-inset-bottom, 0px), 20px));
}

/* 延伸到顶部的情况（内容从屏幕真正顶部(0,0)开始，Page内部自行处理安全区域） */
.content-wrapper.extend-to-top {
  padding-top: 0 !important; /* 覆盖默认的安全区域padding */
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

