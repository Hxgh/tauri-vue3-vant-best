<template>
  <div class="app-container">
    <!-- 顶部导航栏：包装器 + 安全区域占位 -->
    <div class="navbar-wrapper">
      <div class="safe-area-placeholder-top"></div>
      <van-nav-bar title="🚀 Express App">
        <!-- 左侧：刷新按钮 -->
        <template #left>
          <div @click="handleRefresh" class="nav-icon-btn">
            <van-icon name="replay" size="18" />
          </div>
        </template>
        <!-- 右侧：主题切换 + 更多菜单 -->
        <template #right>
          <div class="nav-right-actions">
            <div @click="handleToggleTheme" class="nav-icon-btn">
              <van-icon :name="themeIcon" size="18" />
            </div>
          </div>
        </template>
      </van-nav-bar>
    </div>

    <!-- 主内容区域（可滚动 + 下拉刷新） -->
    <div class="page-content" ref="pageContentRef">
      <van-pull-refresh v-model="refreshing" @refresh="onPullRefresh">
        <div class="content-inner safe-area-horizontal">
        <!-- 欢迎卡片 -->
        <van-cell-group inset title="欢迎" style="margin-top: 16px;">
          <van-cell title="Rsbuild + Vue + Vant" value="已配置" />
          <van-cell title="安全区域适配" value="已启用" />
          <van-cell title="按需引入" value="已配置" />
        </van-cell-group>

        <!-- 功能演示 -->
        <van-cell-group inset title="功能演示" style="margin-top: 16px;">
          <van-cell title="显示通知" is-link @click="showNotifyFunc" />
          <van-cell title="显示对话框" is-link @click="showDialogFunc" />
          <van-cell title="显示 Toast" is-link @click="showToastFunc" />
        </van-cell-group>

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
            :value="`点击右上角切换`"
          />
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

        <!-- 占位内容 -->
        <div style="padding: 16px 0;">
          <van-empty 
            description="滚动查看更多内容"
            image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
          />
        </div>

        <!-- 测试滚动内容 -->
        <van-cell-group inset title="滚动测试">
          <van-cell 
            v-for="i in 20" 
            :key="i" 
            :title="`列表项 ${i}`" 
            :value="`值 ${i}`"
          />
        </van-cell-group>
        </div>
      </van-pull-refresh>
    </div>

    <!-- 底部标签栏：包装器 + 安全区域占位 -->
    <div class="tabbar-wrapper">
      <van-tabbar v-model="active" :border="false" :fixed="false">
        <van-tabbar-item icon="home-o">首页</van-tabbar-item>
        <van-tabbar-item icon="search">搜索</van-tabbar-item>
        <van-tabbar-item icon="friends-o">朋友</van-tabbar-item>
        <van-tabbar-item icon="setting-o">设置</van-tabbar-item>
      </van-tabbar>
      <div class="safe-area-placeholder-bottom"></div>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showNotify, showDialog, showToast } from 'vant'
import { useThemeStore } from './stores/theme'
import type { ThemeMode } from './stores/theme'

const active = ref(0)
const themeStore = useThemeStore()
const refreshing = ref(false)
const pageContentRef = ref<HTMLElement>()
const showThemePicker = ref(false)

// 计算主题图标（根据设置模式，不是实际主题）
const themeIcon = computed(() => {
  if (themeStore.mode === 'auto') {
    return 'replay' // 自动模式显示循环图标
  }
  return themeStore.mode === 'dark' ? 'moon-o' : 'sun-o'
})

// 🔄 刷新（滚动到顶部，不重新加载页面）
const handleRefresh = () => {
  // 滚动到顶部
  if (pageContentRef.value) {
    pageContentRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
  showToast({
    message: '已刷新',
    icon: 'success',
    duration: 1000,
  })
}

// 🔄 下拉刷新（模拟刷新，不重新加载）
const onPullRefresh = () => {
  // 模拟数据加载
  setTimeout(() => {
    refreshing.value = false
    showToast({
      message: '刷新成功',
      icon: 'success',
    })
  }, 1000)
}

// 🌙 切换主题（显示选择器）
const handleToggleTheme = () => {
  showThemePicker.value = true
}

// 选择主题模式
const selectThemeMode = (mode: ThemeMode) => {
  if (mode !== themeStore.mode) {
    themeStore.setMode(mode)
    
    // 显示切换成功提示
    const modeText = mode === 'auto' 
      ? `跟随系统 (当前${themeStore.resolvedTheme === 'dark' ? '深色' : '浅色'})`
      : mode === 'dark' ? '深色模式' : '浅色模式'
    
    showToast({
      message: `已切换到${modeText}`,
      icon: themeStore.resolvedTheme === 'dark' ? 'moon-o' : 'sun-o',
    })
  }
  
  // 关闭弹窗
  showThemePicker.value = false
}

const showNotifyFunc = () => {
  showNotify({ type: 'success', message: '通知内容' })
}

const showDialogFunc = () => {
  showDialog({
    title: '提示',
    message: '这是一个对话框',
  })
}

const showToastFunc = () => {
  showToast('提示内容')
}
</script>

<style scoped>
/* ==================== 主容器 ==================== */
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
  /* 禁用拉伸效果 */
  overscroll-behavior: none;
}

/* ==================== 顶部导航栏 ==================== */
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background-color: var(--navbar-bg);
}

/* 顶部安全区域占位 */
.safe-area-placeholder-top {
  /* iOS 11.0-11.2 回退 */
  height: constant(safe-area-inset-top, 0px);
  /* 标准方式 */
  height: env(safe-area-inset-top, 0px);
  /* 背景色：使用专用的安全区域变量 */
  background-color: var(--safe-area-top-bg);
}

/* 导航栏按钮样式 */
.nav-icon-btn {
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.nav-icon-btn:active {
  background-color: var(--color-bg-tertiary);
}

.nav-right-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ==================== 内容区域 ==================== */
.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* 禁用内容区域的拉伸效果 */
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  /* NavBar 包装器高度：46px NavBar + 顶部安全区域 */
  padding-top: calc(46px + constant(safe-area-inset-top, 0px));
  padding-top: calc(46px + env(safe-area-inset-top, 0px));
  /* Tabbar 包装器高度：50px Tabbar + 底部安全区域（至少 20px 兜底） */
  padding-bottom: calc(50px + max(constant(safe-area-inset-bottom, 0px), 20px));
  padding-bottom: calc(50px + max(env(safe-area-inset-bottom, 0px), 20px));
}

.content-inner {
  padding-bottom: 16px;
}

/* ==================== 底部标签栏 ==================== */
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

/* 移除 Vant Tabbar 的上边框 */
.tabbar-wrapper :deep(.van-tabbar) {
  border-top: none;
}

/* 底部安全区域占位 */
.safe-area-placeholder-bottom {
  /* iOS 11.0-11.2 回退 */
  height: constant(safe-area-inset-bottom, 0px);
  /* 标准方式 (iOS ≥ 11.2, Android) */
  height: env(safe-area-inset-bottom, 0px);
  /* 兜底值：部分 Android 设备 env() 返回 0，确保至少 20px */
  min-height: 20px;
  /* 背景色：使用专用的安全区域变量 */
  background-color: var(--safe-area-bottom-bg);
}

/* ==================== 其他 ==================== */
.info-text {
  line-height: 1.8;
}

.info-text p {
  margin: 8px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* ==================== 主题选择器 ==================== */
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
