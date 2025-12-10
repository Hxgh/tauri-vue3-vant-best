# Core 核心能力模块

本目录包含 Tauri + Vue 3 + Vant 应用的**可复用基础能力**，可直接复制到其他项目使用。

## 模块列表

| 模块 | 说明 | 主要功能 |
|------|------|---------|
| `platform` | 平台工具 | 平台检测、原生桥接、日志 |
| `theme` | 主题系统 | 浅色/深色/跟随系统、原生同步 |
| `layout` | 布局系统 | 三维布局、安全区域、键盘适配 |
| `scanner` | 扫码系统 | 跨平台扫码、商品查询 |
| `map` | 地图导航 | 高德/百度/腾讯地图导航 |
| `notification` | 通知系统 | 系统通知、权限管理 |

## 迁移到其他项目

### 方式一：完整复制

1. 复制整个 `src/core/` 目录到目标项目的 `src/` 下
2. 复制 `src-tauri/src/lib.rs` 中的地图相关命令（如果需要地图功能）
3. 安装依赖（见下方）
4. 引入样式和初始化

### 方式二：按需复制

只复制需要的模块目录，注意依赖关系：
- `scanner` 依赖 `platform`
- `theme` 依赖 `platform`
- `map` 依赖 `platform`（可选）

## 依赖安装

### npm 依赖

```bash
# 基础依赖
pnpm add pinia vant

# 扫码功能
pnpm add html5-qrcode
pnpm add @tauri-apps/plugin-barcode-scanner
pnpm add @tauri-apps/plugin-dialog
pnpm add @tauri-apps/plugin-fs
pnpm add @tauri-apps/plugin-http

# 通知功能
pnpm add @tauri-apps/plugin-notification

# 地图功能（仅需要 Tauri API）
pnpm add @tauri-apps/api
```

### Rust 依赖 (Cargo.toml)

```toml
[dependencies]
tauri-plugin-opener = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-http = "2"
tauri-plugin-notification = "2"

[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]
tauri-plugin-barcode-scanner = "2"
```

## 初始化

```ts
// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// 1. 引入 Vant 样式
import 'vant/lib/index.css';

// 2. 引入核心样式
import '@/core/layout/styles/safe-area.css';
import '@/core/theme/styles/theme.css';

// 3. 创建应用
const app = createApp(App);
app.use(createPinia());

// 4. 初始化主题系统
import { useThemeStore } from '@/core/theme';
const themeStore = useThemeStore();
themeStore.initTheme();

app.mount('#app');
```

## 使用示例

### 主题切换

```ts
import { useThemeStore } from '@/core/theme';

const themeStore = useThemeStore();

// 设置主题
themeStore.setMode('dark');
themeStore.setMode('light');
themeStore.setMode('auto');

// 切换主题
themeStore.toggleTheme();

// 读取当前主题
console.log(themeStore.mode); // 'light' | 'dark' | 'auto'
console.log(themeStore.resolvedTheme); // 'light' | 'dark'
```

### 布局使用

```vue
<template>
  <MainLayout
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="详情页"
  >
    <div>页面内容</div>
  </MainLayout>
</template>

<script setup lang="ts">
import {
  MainLayout,
  HeaderMode,
  ContentStart,
  TabbarMode,
} from '@/core/layout';
</script>
```

### 扫码功能

```ts
import { useBarcodeScanner } from '@/core/scanner';

const { scanning, lastResult, startScan } = useBarcodeScanner({
  autoQueryProduct: true,
  onComplete: (result) => {
    console.log('扫描内容:', result.scan.content);
    if (result.product) {
      console.log('商品名称:', result.product.name);
    }
  },
});

// 开始扫描
await startScan();
```

### 地图导航

```ts
import { useMapNavigation, checkMapInstalled } from '@/core/map';

// 检查地图是否安装
const installed = await checkMapInstalled('amap');

// 使用 Hook
const { mapApps, handleMapSelect } = useMapNavigation(
  39.9042,  // 纬度
  116.4074, // 经度
  '北京天安门'
);

// 打开地图
await handleMapSelect('amap');
```

### 发送通知

```ts
import { useNotification } from '@/core/notification';

const { checkPermission, requestPermission, send } = useNotification();

// 检查并请求权限
const hasPermission = await checkPermission();
if (!hasPermission) {
  await requestPermission();
}

// 发送通知
await send({
  title: '新消息',
  body: '您有一条新消息',
});
```

## 原生桥接（Android/iOS）

### 主题同步

需要在原生层实现以下接口：

**Android:**
```kotlin
// 注入 window.AndroidTheme
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun setTheme(theme: String, mode: String) {
        // 更新状态栏和导航栏颜色
    }
}, "AndroidTheme")

// 注入系统主题
webView.evaluateJavascript("window.__ANDROID_SYSTEM_THEME__ = '${systemTheme}'", null)
```

**iOS:**
参考 `src-tauri/gen/apple/Sources/app/NativeBridge.mm`

### 地图命令

需要在 `src-tauri/src/lib.rs` 实现：
- `open_map_navigation`: 打开地图导航
- `check_map_installed`: 检查地图是否安装

参考本项目的实现。

## 目录结构

```
src/core/
├── platform/           # 平台工具
│   ├── index.ts        # 导出入口
│   ├── detect.ts       # 平台检测
│   ├── bridge.ts       # 原生桥接
│   └── logger.ts       # 日志工具
│
├── theme/              # 主题系统
│   ├── index.ts        # 导出入口
│   ├── store.ts        # Pinia Store
│   ├── types.ts        # 类型定义
│   └── styles/
│       └── theme.css   # 主题 CSS 变量
│
├── layout/             # 布局系统
│   ├── index.ts        # 导出入口
│   ├── types.ts        # 枚举和预设
│   ├── MainLayout.vue  # 核心组件
│   └── styles/
│       └── safe-area.css
│
├── scanner/            # 扫码系统
│   ├── index.ts        # 导出入口
│   ├── types.ts        # 类型定义
│   ├── utils.ts        # 工具函数
│   ├── useQRScanner.ts
│   ├── useBarcodeScanner.ts
│   └── useProductQuery.ts
│
├── map/                # 地图导航
│   ├── index.ts
│   ├── types.ts
│   └── useMapNavigation.ts
│
├── notification/       # 通知系统
│   ├── index.ts
│   ├── types.ts
│   └── useNotification.ts
│
├── index.ts            # 统一导出入口
└── README.md           # 本文档
```
