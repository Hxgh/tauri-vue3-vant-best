# tvvb App

基于 Tauri 2 + Vue 3 + Vant 4 的跨平台移动应用。

## 特性

- 🎨 **主题系统**：浅色/深色/跟随系统，与 Android/iOS 系统栏完美同步
- 📱 **布局系统**：4 种布局模式，3 个工具组件
- 🛡️ **安全区域适配**：自动处理刘海屏和 Home Indicator
- 📷 **扫码功能**：支持 QR/条形码，商品信息查询
- 🗺️ **地图导航**：支持高德/百度/腾讯地图
- 🔔 **系统通知**：跨平台通知支持

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动 Web 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# Android 开发模式（需先启动 dev server）
pnpm build:android:dev

# Android 生产模式
pnpm build:android:prod
```

## 项目结构

```
src/
├── core/                 # 核心模块
│   ├── platform/         # 平台检测、日志、桥接
│   ├── theme/            # 主题系统
│   ├── layout/           # 布局系统
│   ├── scanner/          # 扫码功能
│   ├── map/              # 地图导航
│   └── notification/     # 系统通知
├── components/           # 公共组件
├── pages/                # 页面
├── router/               # 路由
└── types/                # 类型定义

src-tauri/                # Tauri 后端
scripts/                  # 构建脚本
docs/                     # 详细文档
```

## 核心模块使用

```typescript
// 平台工具
import { logger, isTauriEnv, callBridge } from '@/core/platform';

// 主题系统
import { useThemeStore } from '@/core/theme';
const themeStore = useThemeStore();
themeStore.setMode('dark'); // 'light' | 'dark' | 'auto'

// 布局系统
import { MainLayout, HeaderMode, ContentStart, TabbarMode } from '@/core/layout';

// 扫码功能
import { useBarcodeScanner } from '@/core/scanner';
const { startScan, lastResult } = useBarcodeScanner();

// 地图导航
import { openMapNavigation } from '@/core/map';
await openMapNavigation(30.66, 104.06, '目的地', 'amap');

// 系统通知
import { useNotification } from '@/core/notification';
const { send } = useNotification();
await send({ title: '标题', body: '内容' });
```

## 布局模式

| 模式 | 配置 | 适用场景 |
|------|------|----------|
| 标准页面 | `Standard` + `BelowHeader` + `Standard` | 列表页 |
| 无 Header | `None` + `SafeArea` + `Standard` | 首页 |
| 详情页 | `Standard` + `BelowHeader` + `None` | 详情 + 固定按钮 |
| 沉浸式 | `None` + `ScreenTop` + `Immersive` | 登录/视频 |

详见 [docs/LAYOUT_SYSTEM.md](docs/LAYOUT_SYSTEM.md)

## 技术栈

- **前端**：Vue 3 + TypeScript + Vant 4
- **构建**：Rsbuild (Rspack)
- **状态管理**：Pinia
- **移动端**：Tauri 2
- **代码规范**：Biome

## 文档

- [布局系统](docs/LAYOUT_SYSTEM.md)
- [主题系统](docs/THEME_SYSTEM.md)
- [Android 构建](docs/BUILD_ANDROID.md)
- [地图组件](docs/MAP_COMPONENT_USAGE.md)

## License

MIT
