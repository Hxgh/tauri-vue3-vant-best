# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Tauri 2 + Vue 3 + Vant 4 的跨平台移动应用模板工程，为 Tauri Vue3 Vant Android/iOS 提供框架级解决方案。

**定位:** 作为模板工程，核心能力集中在 `src/core/` 目录，便于业务项目复用和长期升级维护。

**技术栈:**
- 前端: Vue 3 + TypeScript + Vant 4
- 构建: Rsbuild (Rspack) + unplugin-vue-components (自动导入 Vant)
- 状态管理: Pinia
- 移动端: Tauri 2 (Android)
- 代码规范: Biome

## 开发命令

```bash
# Web 开发
npm run dev          # 启动开发服务器 (端口 1234)
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

## 目录结构

```
src/
├── core/                    # 🔒 核心能力（业务项目复用）
│   ├── platform/            # 平台检测、桥接、日志
│   ├── theme/               # 主题系统
│   ├── layout/              # 布局系统
│   │   ├── MainLayout.vue
│   │   └── components/      # AppTabbar, FixedBottom, ImmersiveNavbar...
│   ├── scanner/             # 扫码
│   ├── map/                 # 地图导航
│   │   └── components/      # MapNavigationButton
│   ├── notification/        # 通知
│   └── index.ts             # 统一导出 + 版本号
│
├── demo/                    # 📝 示例页面（业务项目删除）
│   ├── routes.ts            # 示例路由配置
│   ├── Page1/2/3.vue        # Tab 页面示例
│   └── test/                # 功能测试页面
│
├── router/                  # 路由配置
├── App.vue                  # 应用入口
└── index.ts                 # 主入口
```

**业务项目使用:** 复制 `src/core/` 目录，删除 `src/demo/`，按需修改路由和页面。

## 架构说明

### 核心模块 (src/core/)

项目采用模块化架构，所有核心能力封装在 `src/core/` 目录下，便于复用和维护：

| 模块 | 路径 | 说明 |
|------|------|------|
| **platform** | `@/core/platform` | 平台检测、原生桥接、日志系统 |
| **theme** | `@/core/theme` | 主题系统（深浅色、跟随系统） |
| **layout** | `@/core/layout` | 布局系统（Header/Tabbar/安全区域） |
| **scanner** | `@/core/scanner` | 扫码系统（QR/条形码、商品查询） |
| **map** | `@/core/map` | 地图导航（高德/百度/腾讯） |
| **notification** | `@/core/notification` | 系统通知 |

**统一导入方式：**
```typescript
// 推荐：从具体模块导入
import { logger, isTauriEnv } from '@/core/platform';
import { useThemeStore } from '@/core/theme';
import { HeaderMode, ContentStart, TabbarMode } from '@/core/layout';
import { useBarcodeScanner } from '@/core/scanner';
import { useMapNavigation } from '@/core/map';
import { useNotification } from '@/core/notification';

// 或从统一入口导入（适合导入多个模块）
import { logger, useThemeStore, HeaderMode, CORE_VERSION } from '@/core';
console.log('Core version:', CORE_VERSION); // 1.0.0
```

### 布局系统 (三维配置)

核心布局由 `MainLayout.vue` 控制，通过 `@/core/layout` 定义的三个独立维度配置:

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

主题管理位于 `@/core/theme`，与原生（Android/iOS）双向同步:

**模式:**
- `auto`: 跟随系统主题 (使用 `@media (prefers-color-scheme: dark)`)
- `light`: 强制浅色模式
- `dark`: 强制深色模式

**架构层次:**
1. **CSS 层:** `@media (prefers-color-scheme: dark)` + `data-theme` 属性控制自定义变量
2. **JS 层:** Pinia store 管理状态，解析模式为实际主题
3. **原生层:** 通过 Android/iOS Bridge 实现双向同步
   - Web → Android: `window.AndroidTheme.setTheme(theme, mode)`
   - Web → iOS: `window.webkit.messageHandlers.iOSTheme.postMessage({ action: 'setTheme', theme, mode })`
   - 原生 → Web: 注入 `window.__ANDROID_SYSTEM_THEME__` / `window.__IOS_SYSTEM_THEME__` + 调用 `window.__FORCE_THEME_CHECK__()`

**关键函数:**
- `applyTheme()`: 为 Vant 设置 `van-theme-dark` 类，为自定义 CSS 设置 `data-theme` 属性
- `syncToNative()`: 调用 Android/iOS 桥接同步系统栏颜色
- `initTheme()`: 应用启动时调用一次，设置监听器
- iOS Bridge: `src-tauri/gen/apple/Sources/app/NativeBridge.mm` 注册 `window.webkit.messageHandlers.iOSTheme`、同步 `__IOS_SYSTEM_THEME__` 与 Safe Area CSS 变量

**⚠️ 重要：index.html 防闪屏配置**

`index.html` 中包含防止深色模式闪白屏的关键代码，业务项目必须保留：

```html
<!-- 首屏样式 -->
<style>
  :root {
    --first-screen-bg-light: #f7f8fa;
    --first-screen-bg-dark: #141414;
  }
  html.light { background-color: var(--first-screen-bg-light); }
  html.dark { background-color: var(--first-screen-bg-dark); }
</style>

<!-- 防闪屏脚本（在 Vue 加载前执行） -->
<script>
  (function() {
    const storedMode = localStorage.getItem('app-theme-mode') || 'auto';
    let theme = storedMode;
    if (storedMode === 'auto') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

此脚本在 HTML 解析时立即执行，避免 Vue 加载期间的白屏闪烁。localStorage key `app-theme-mode` 与 `@/core/theme` 保持一致。

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

对应的组合式函数位于 `src/core/` 各模块:
- `@/core/scanner` - useBarcodeScanner, useQRScanner, useProductQuery
- `@/core/map` - useMapNavigation
- `@/core/notification` - useNotification

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
- **日志:** 使用 `@/core/platform` 的 logger 而不是 console.log（生产环境自动禁用 debug 日志）

## Android 构建流程

`scripts/build-android.mjs` 跨平台脚本处理开发和发布构建（支持 Windows/macOS/Linux）:
- **开发模式:** 使用 `devUrl` 指向本地开发服务器（支持热重载）
- **发布模式:** 通过 `pnpm build` 打包前端，然后构建 APK

构建配置位于 `src-tauri/tauri.conf.json`:
- `beforeBuildCommand`: pnpm build
- Android minSdkVersion: 24

**环境变量配置** (复制 `.env.example` 为 `.env`):
```bash
DEV_SERVER_HOST=192.168.3.81  # 开发服务器 IP
DEV_SERVER_PORT=1234          # 开发服务器端口
```

## 常见模式

### 创建带布局的新页面

```typescript
// 在组件中
import { HeaderMode, ContentStart, TabbarMode } from '@/core/layout';

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
import { useThemeStore } from '@/core/theme';

const themeStore = useThemeStore();
themeStore.setMode('dark');  // 或 'light', 'auto'
themeStore.toggleTheme();    // 在 light/dark 之间切换
```

### 使用扫码功能

```typescript
import { useBarcodeScanner } from '@/core/scanner';

const { scanning, lastResult, startScan, stopScan } = useBarcodeScanner({
  autoQueryProduct: true,
  onComplete: (result) => console.log('扫码结果:', result),
});

await startScan();
```

### 使用地图导航

```typescript
import { useMapNavigation, openMapNavigation } from '@/core/map';

// 方式1: 组合式函数
const { handleMapSelect } = useMapNavigation(30.66, 104.06, '目的地');
await handleMapSelect('amap');

// 方式2: 直接调用
await openMapNavigation(30.66, 104.06, '目的地', 'baidu');
```

### 使用通知功能

```typescript
import { useNotification } from '@/core/notification';

const { requestPermission, send } = useNotification();
await requestPermission();
await send({ title: '标题', body: '内容' });
```

### 添加新的核心模块

在 `src/core/` 下创建新模块，遵循现有模式：
1. 创建模块目录（如 `src/core/newmodule/`）
2. 创建类型定义 `types.ts`
3. 创建核心逻辑 `useXxx.ts`
4. 创建导出入口 `index.ts`
5. 在 `src/core/index.ts` 添加导出

### 使用工具函数

```typescript
// 日志（生产环境自动禁用 debug）
import { logger } from '@/core/platform';
logger.debug('...');  // 仅开发环境
logger.info('...');
logger.error('...');

// 平台检测和桥接调用
import { isTauriEnv, isAndroid, callBridge } from '@/core/platform';

if (isTauriEnv()) {
  const result = await callBridge<boolean>('AndroidMap', 'isAppInstalled', 'com.xxx');
  if (result.success) { /* ... */ }
}
```

## 业务项目升级指南

1. **Git Subtree 方式（推荐）:**
   ```bash
   # 添加模板仓库为远程
   git remote add template https://github.com/xxx/tauri-vue3-vant-best.git
   # 拉取 core 目录更新
   git subtree pull --prefix=src/core template main --squash
   ```

2. **手动复制方式:**
   - 对比 `CORE_VERSION` 版本号
   - 复制新版 `src/core/` 覆盖旧版
   - 检查 breaking changes

## 重要提示

- Android 开发构建前务必确保开发服务器正在运行
- 主题系统需要在应用初始化时调用 `initTheme()`
- 布局系统自动处理安全区域 - 大多数情况下避免手动设置 padding
- Android 桥接方法在纯 Web 模式下可能不可用 - 始终检查是否存在
- `src/demo/` 是示例代码，业务项目可直接删除
