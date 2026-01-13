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
| `image-picker` | 图片选择器 | 相机/相册选择、图片压缩 |
| `scripts` | 构建脚本 | 跨平台 Android 构建 |

## 快速迁移

### 方式一：完整复制（推荐）

```bash
# 1. 复制整个 core 目录
cp -r src/core/ your-project/src/core/

# 2. 更新 package.json 脚本
# "build:android:dev": "node src/core/scripts/build-android.mjs dev"
# "build:android:prod": "node src/core/scripts/build-android.mjs release"

# 3. 复制原生集成代码（见下方说明）
```

### 方式二：按需复制

只复制需要的模块目录，注意依赖关系：
- `scanner` 依赖 `platform`
- `theme` 依赖 `platform`
- `map` 依赖 `platform`（可选）
- `scripts` 独立，无依赖

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

# 图片压缩功能
pnpm add browser-image-compression
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

## Android 构建脚本

### 使用方法

```bash
# 开发模式（热更新）
pnpm build:android:dev

# 生产模式（硬打包）
pnpm build:android:prod
```

### 配置说明

脚本自动从以下位置读取配置：

| 配置项 | 来源 | 说明 |
|--------|------|------|
| 包名 | `src-tauri/tauri.conf.json` → `identifier` | Android 应用包名 |
| 应用名 | `src-tauri/tauri.conf.json` → `productName` | 应用显示名称 |
| 开发服务器 | `.env` → `DEV_SERVER_HOST` / `DEV_SERVER_PORT` | 热更新服务器地址 |

### .env 配置示例

```bash
# 开发服务器配置
DEV_SERVER_HOST=192.168.1.100
DEV_SERVER_PORT=1234
```

### 脚本功能

- ✅ 跨平台支持 (Windows/macOS/Linux)
- ✅ 自动检测 Android SDK
- ✅ 自动清理 Gradle 缓存
- ✅ MainActivity 模板切换（开发/生产）
- ✅ APK 自动签名和安装
- ✅ 构建失败自动重试

## 原生集成

### 1. Rust 地图命令

复制以下代码到 `src-tauri/src/lib.rs`：

```rust
#[derive(Debug, serde::Serialize)]
struct MapResult {
    success: bool,
    message: String,
}

#[tauri::command]
async fn open_map_navigation(
    app: tauri::AppHandle,
    lat: f64,
    lng: f64,
    name: String,
    app_type: String,
) -> Result<MapResult, String> {
    #[cfg(target_os = "android")]
    {
        use tauri_plugin_opener::OpenerExt;

        let scheme_url = match app_type.as_str() {
            "amap" => format!("androidamap://navi?sourceApplication=app&lat={}&lon={}&dev=0&style=2", lat, lng),
            "baidu" => format!("baidumap://map/direction?destination=latlng:{},{}|name:{}&coord_type=bd09ll&mode=driving", lat, lng, name),
            "tencent" => format!("qqmap://map/routeplan?type=drive&to={}&tocoord={},{}", name, lat, lng),
            _ => return Err("不支持的地图类型".to_string()),
        };

        match app.opener().open_url(scheme_url, None::<&str>) {
            Ok(_) => Ok(MapResult { success: true, message: "已唤起地图应用".to_string() }),
            Err(_) => {
                // fallback 到网页版
                let web_url = match app_type.as_str() {
                    "amap" => format!("https://uri.amap.com/navigation?to={},{},{}", lng, lat, name),
                    "baidu" => format!("https://api.map.baidu.com/marker?location={},{}&title={}&output=html", lat, lng, name),
                    "tencent" => format!("https://apis.map.qq.com/uri/v1/routeplan?type=drive&to={}&tocoord={},{}", name, lat, lng),
                    _ => return Err("不支持的地图类型".to_string()),
                };
                match app.opener().open_url(web_url, None::<&str>) {
                    Ok(_) => Ok(MapResult { success: false, message: "已打开网页版".to_string() }),
                    Err(e) => Err(format!("打开地图失败: {}", e)),
                }
            }
        }
    }

    #[cfg(not(target_os = "android"))]
    {
        // 桌面端直接打开网页版
        use tauri_plugin_opener::OpenerExt;
        let web_url = match app_type.as_str() {
            "amap" => format!("https://uri.amap.com/navigation?to={},{},{}", lng, lat, name),
            _ => return Err("不支持的地图类型".to_string()),
        };
        match app.opener().open_url(web_url, None::<&str>) {
            Ok(_) => Ok(MapResult { success: true, message: "已打开地图".to_string() }),
            Err(e) => Err(format!("打开地图失败: {}", e)),
        }
    }
}

// 在 run() 中注册命令
.invoke_handler(tauri::generate_handler![open_map_navigation])
```

### 2. Android gradle.properties

在 `src-tauri/gen/android/gradle.properties` 添加：

```properties
# 修复 Windows 跨驱动器编译问题
kotlin.incremental=false
```

### 3. index.html 防闪屏

在 `index.html` 的 `<head>` 中添加：

```html
<!-- 首屏样式：定义主题颜色，防止闪白屏 -->
<style>
  :root {
    --first-screen-bg-light: #f7f8fa;
    --first-screen-bg-dark: #141414;
  }
  html { transition: none !important; }
  html.light { background-color: var(--first-screen-bg-light); }
  html.dark { background-color: var(--first-screen-bg-dark); }
</style>

<!-- 防止深色模式闪白屏：在页面渲染前立即应用主题 -->
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

### 4. MainActivity 模板

构建脚本会自动使用 `scripts/templates/MainActivity/` 中的模板。模板包含：

- **ThemeBridge**: Web ↔ Android 主题同步
- **MapBridge**: 检查地图应用是否安装
- **键盘监听**: 通过 CSS 变量 `--skb` 暴露键盘高度
- **Edge-to-Edge**: 沉浸式状态栏和导航栏

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
│   ├── index.ts
│   ├── store.ts        # Pinia Store
│   ├── types.ts
│   └── styles/
│       └── theme.css   # 主题 CSS 变量
│
├── layout/             # 布局系统
│   ├── index.ts
│   ├── types.ts        # 枚举和预设
│   ├── MainLayout.vue  # 核心组件
│   ├── components/     # 子组件
│   └── styles/
│       └── safe-area.css
│
├── scanner/            # 扫码系统
│   ├── index.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── useQRScanner.ts
│   ├── useBarcodeScanner.ts
│   └── useProductQuery.ts
│
├── map/                # 地图导航
│   ├── index.ts
│   ├── types.ts
│   ├── useMapNavigation.ts
│   └── components/
│       └── MapNavigationButton.vue
│
├── notification/       # 通知系统
│   ├── index.ts
│   ├── types.ts
│   └── useNotification.ts
│
├── image-picker/       # 图片选择器
│   ├── index.ts
│   ├── types.ts
│   └── useImagePicker.ts
│
├── scripts/            # 构建脚本
│   ├── build-android.mjs
│   └── templates/
│       └── MainActivity/
│           ├── dev.kt
│           └── release.kt
│
├── index.ts            # 统一导出入口
└── README.md           # 本文档
```

## 版本信息

```ts
import { CORE_VERSION } from '@/core';
console.log('Core version:', CORE_VERSION); // 1.1.0
```
