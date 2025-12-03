# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Tauri 2 + Vue 3 + Vant 4 的跨平台移动应用，具备先进的布局系统和主题系统。

**技术栈:**
- 前端: Vue 3 + TypeScript + Vant 4
- 构建: Rsbuild (Rspack) + unplugin-vue-components (自动导入 Vant)
- 状态管理: Pinia
- 移动端: Tauri 2 (Android)
- 代码规范: Biome

## 开发命令

```bash
# Web 开发
npm run dev          # 启动开发服务器 (端口 1420)
npm run build        # 构建生产版本
npm run preview      # 预览生产构建

# 代码质量检查 (使用 Biome)
npm run lint         # 检查代码
npm run check        # 检查并自动修复
npm run format       # 格式化代码
npm run type-check   # TypeScript 类型检查

# Android 构建 (开发模式需要先启动 dev server)
npm run build:android:dev    # 开发模式，支持热重载
npm run build:android:prod   # 生产模式 APK

# Android 调试
adb devices                  # 列出已连接设备
adb logcat                   # 查看 Android 日志
adb install path/to/apk      # 安装 APK
```

**重要:** 提交代码时会自动运行 lint（通过 husky + lint-staged）。构建 Android 开发模式前，必须先启动开发服务器。

## 架构说明

### 布局系统 (三维配置)

核心布局由 `MainLayout.vue` 控制，通过 `src/types/layout.ts` 定义的三个独立维度配置:

1. **HeaderMode (头部模式)** (枚举):
   - `Standard` (0): 标准头部，位于安全区域下方，不延伸到状态栏
   - `Immersive` (1): 沉浸式头部，延伸到屏幕顶部，覆盖状态栏（带毛玻璃效果）
   - `None` (2): 无头部

2. **ContentStart (内容起点)** (枚举):
   - `BelowHeader` (0): 内容从头部下方开始（需要有头部）
   - `SafeArea` (1): 内容从状态栏下方开始（无头部）
   - `ScreenTop` (2): 内容从屏幕顶部开始（页面自行处理安全区域）

3. **TabbarMode (底栏模式)** (枚举):
   - `Standard` (0): 固定底栏，自动处理底部安全区域
   - `None` (1): 无底栏，内容在安全区域内结束
   - `Immersive` (2): 无底栏，内容延伸到屏幕底部

**关键实现细节:** `MainLayout.vue` 根据这三个维度动态计算 `paddingTop` 和 `paddingBottom`（见第 121-166 行的 `contentStyle` 计算属性）。逻辑考虑了:
- 通过 CSS 变量处理安全区域插入 (`--sat`, `--sab`)
- 固定的头部/底栏高度 (46px, 50px)
- 头部/内容/底栏模式的不同组合

### 主题系统 (三模式架构)

主题管理位于 `src/stores/theme.ts`，与 Android 双向同步:

**模式:**
- `auto`: 跟随系统主题 (使用 `@media (prefers-color-scheme: dark)`)
- `light`: 强制浅色模式
- `dark`: 强制深色模式

**架构层次:**
1. **CSS 层:** `@media (prefers-color-scheme: dark)` + `data-theme` 属性控制自定义变量
2. **JS 层:** Pinia store 管理状态，解析模式为实际主题
3. **Android 层:** 通过 `window.AndroidTheme` 桥接实现双向同步
   - Web → Android: `window.AndroidTheme.setTheme(theme, mode)`
   - Android → Web: `window.__ANDROID_SYSTEM_THEME__` 注入 + `window.__FORCE_THEME_CHECK__()` 回调

**关键函数:**
- `applyTheme()`: 为 Vant 设置 `van-theme-dark` 类，为自定义 CSS 设置 `data-theme` 属性
- `syncToAndroid()`: 调用 Android 桥接同步系统栏颜色
- `initTheme()`: 应用启动时调用一次，设置监听器

### 路由和导航

- 使用 Vue Router 的 `createWebHistory()`
- 路由元数据包括: `showHeader`, `headerTitle`, `extendToTop`, `tabIndex`, `title`
- 主标签页: 首页 (`/home`)、发现 (`/discover`)、设置 (`/settings`)
- 测试页面位于 `/test/*`

### 组件自动导入

Vant 组件通过 `unplugin-vue-components` 和 `VantResolver` 自动导入（在 `rsbuild.config.ts` 中配置）。无需手动导入 Vant 组件，可直接在模板中使用。

### 路径别名

`@/` 映射到 `src/`（在 `tsconfig.json` 和 `rsbuild.config.ts` 中配置）

### Tauri 插件

可用插件（见 `src-tauri/Cargo.toml`）:
- `tauri-plugin-barcode-scanner` (仅移动端)
- `tauri-plugin-dialog`
- `tauri-plugin-fs`
- `tauri-plugin-http`
- `tauri-plugin-notification`

对应的组合式函数位于 `src/composables/`:
- `useBarcodeScanner.ts`
- `useMapNavigation.ts`
- `useNotification.ts`
- `useProductQuery.ts`
- `useQRScanner.ts`

### 安全区域处理

由 Tauri/Android 注入的 CSS 变量:
- `--sat`: safe-area-inset-top (状态栏高度)
- `--sab`: safe-area-inset-bottom (Home Indicator，最小 20px)

这些变量在整个布局系统中用于正确的间距处理。

## 代码规范

- **TypeScript:** 启用严格模式，禁止未使用的局部变量/参数
- **Biome:** 用于代码检查和格式化（配置在 `biome.json`）
- **Git Hooks:** husky + lint-staged 自动在提交前检查代码
- **导入:** 使用 `@/` 别名导入 src 目录内容
- **Vue:** Composition API + `<script setup>` + TypeScript
- **命名:** 枚举值使用 PascalCase（如 `HeaderMode.Standard`）
- **日志:** 使用 `@/utils/logger` 而不是 console.log（生产环境自动禁用 debug 日志）

## Android 构建流程

`scripts/build-android.sh` 脚本处理开发和发布构建:
- **开发模式:** 使用 `devUrl` 指向本地开发服务器（支持热重载）
- **发布模式:** 通过 `pnpm build` 打包前端，然后构建 APK

构建配置位于 `src-tauri/tauri.conf.json`:
- `beforeBuildCommand`: pnpm build
- Android minSdkVersion: 24

**环境变量配置** (复制 `.env.example` 为 `.env`):
```bash
DEV_SERVER_HOST=192.168.3.81  # 开发服务器 IP
DEV_SERVER_PORT=1420          # 开发服务器端口
```

## 常见模式

### 创建带布局的新页面

```typescript
// 在组件中
import { HeaderMode, ContentStart, TabbarMode } from '@/types/layout';

// 传递给 MainLayout props
<MainLayout
  :header-mode="HeaderMode.Standard"
  :content-start="ContentStart.BelowHeader"
  :tabbar-mode="TabbarMode.None"
  header-title="页面标题"
>
  <!-- 内容 -->
</MainLayout>
```

### 使用主题 Store

```typescript
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
themeStore.setMode('dark');  // 或 'light', 'auto'
themeStore.toggleTheme();    // 在 light/dark 之间切换
```

### 添加新的组合式函数

放置在 `src/composables/`，遵循现有模式（如 `useNotification.ts` 用于 Tauri 插件集成）

### 使用工具函数

```typescript
// 日志（生产环境自动禁用 debug）
import { logger } from '@/utils/logger';
logger.debug('...');  // 仅开发环境
logger.info('...');
logger.error('...');

// 平台检测和桥接调用
import { isTauriEnv, isAndroid, callBridge } from '@/utils/platform';

if (isTauriEnv()) {
  const result = await callBridge<boolean>('AndroidMap', 'isAppInstalled', 'com.xxx');
  if (result.success) { /* ... */ }
}
```

## 重要提示

- Android 开发构建前务必确保开发服务器正在运行
- 主题系统需要在应用初始化时调用 `initTheme()`
- 布局系统自动处理安全区域 - 大多数情况下避免手动设置 padding
- Android 桥接方法在纯 Web 模式下可能不可用 - 始终检查是否存在
