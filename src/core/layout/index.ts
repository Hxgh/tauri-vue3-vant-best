/**
 * 布局系统模块
 * 提供三维布局配置（HeaderMode、ContentStart、TabbarMode）和安全区域处理
 *
 * @module core/layout
 *
 * ## 功能特性
 * - 三维布局配置：Header 模式、内容起点、Tabbar 模式
 * - 7 种预设布局：Standard、Detail、NoHeader、ImmersiveHeader、ImmersiveDetail、SafeFullscreen、FullImmersive
 * - 自动处理安全区域（状态栏、Home Indicator）
 * - 键盘弹出自动适配
 * - 支持 Vant 组件集成
 *
 * ## 使用方式
 *
 * ### 1. 引入样式（main.ts）
 * ```ts
 * import '@/core/layout/styles/safe-area.css';
 * ```
 *
 * ### 2. 使用 MainLayout 组件
 * ```vue
 * <template>
 *   <MainLayout
 *     :header-mode="HeaderMode.Standard"
 *     :content-start="ContentStart.BelowHeader"
 *     :tabbar-mode="TabbarMode.Standard"
 *     header-title="页面标题"
 *   >
 *     <template #header-left>
 *       <van-icon name="arrow-left" @click="goBack" />
 *     </template>
 *
 *     <!-- 内容 -->
 *     <div>页面内容</div>
 *
 *     <template #tabbar>
 *       <AppTabbar />
 *     </template>
 *   </MainLayout>
 * </template>
 *
 * <script setup lang="ts">
 * import { MainLayout, HeaderMode, ContentStart, TabbarMode } from '@/core/layout';
 * </script>
 * ```
 *
 * ### 3. 使用预设配置
 * ```vue
 * <template>
 *   <MainLayout v-bind="LayoutPresets.Detail" header-title="详情页">
 *     <!-- 内容 -->
 *   </MainLayout>
 * </template>
 *
 * <script setup lang="ts">
 * import { MainLayout, LayoutPresets } from '@/core/layout';
 * </script>
 * ```
 *
 * ## 三维配置说明
 *
 * ### HeaderMode（头部模式）
 * - `Standard`: 标准头部，位于安全区域下方
 * - `Immersive`: 沉浸式头部，覆盖状态栏（带毛玻璃效果）
 * - `None`: 无头部
 *
 * ### ContentStart（内容起点）
 * - `BelowHeader`: 内容从头部下方开始
 * - `SafeArea`: 内容从状态栏下方开始（无头部时使用）
 * - `ScreenTop`: 内容从屏幕顶部开始（页面自行处理安全区域）
 *
 * ### TabbarMode（底栏模式）
 * - `Standard`: 固定底栏，自动处理底部安全区域
 * - `None`: 无底栏，内容在安全区域内结束
 * - `Immersive`: 无底栏，内容延伸到屏幕底部
 */

export { default as MainLayout } from './MainLayout.vue';
export { default as AppTabbar } from './components/AppTabbar.vue';
export { default as FixedBottom } from './components/FixedBottom.vue';
export { default as ImmersiveBottomBar } from './components/ImmersiveBottomBar.vue';
export { default as ImmersiveNavbar } from './components/ImmersiveNavbar.vue';
export type { LayoutConfig } from './types';
export {
  ContentStart,
  HeaderMode,
  LayoutPresets,
  TabbarMode,
} from './types';
