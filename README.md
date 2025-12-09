# tvvb App

基于 Tauri + Vue 3 + Vant 的跨平台移动应用。

## 特性

- 🎨 **主题系统**：浅色/深色/跟随系统，与 Android/iOS 系统栏完美同步
- 📱 **布局系统**：5 种布局模式，2 个工具组件
- 🛡️ **安全区域适配**：自动处理刘海屏和 Home Indicator
- ⚡ **开发体验**：热重载、TypeScript、Biome

## 快速开始

### 开发模式

```bash
# 启动 Web 开发服务器
npm run dev

# 构建并安装到 Android（需先启动 dev server）
npm run build:android:dev
```

### 生产构建

```bash
# 构建前端资源
npm run build

# 构建并安装生产版 APK
npm run build:android:prod
```

## 布局系统

### 5 种模式

| 模式 | 配置 | 示例 | 适用场景 |
|------|------|------|----------|
| 1 | `Standard` + `BelowHeader` + `Standard` | Page2 | 标准列表页 |
| 2 | `None` + `SafeArea` + `Standard` | Page3 | 无导航首页 |
| 3 | `Standard` + `BelowHeader` + `None` | DetailPage | 详情页 + 固定按钮 |
| 4 | `None` + `ScreenTop` + `Immersive` | LoginPage/VideoPage | 登录/视频/全屏 |

**详见：** [docs/LAYOUT_SYSTEM.md](docs/LAYOUT_SYSTEM.md)

### 工具组件

**FixedBottom** - 固定底部按钮（有背景）

```vue
<FixedBottom>
  <van-button type="primary">提交</van-button>
</FixedBottom>
```

**ImmersiveNavbar / ImmersiveBottomBar** - 沉浸式透明导航栏（无背景）

```vue
<!-- 顶部 -->
<ImmersiveNavbar>
  <template #title>
    <span style="color: white;">标题</span>
  </template>
</ImmersiveNavbar>

<!-- 底部 -->
<ImmersiveBottomBar>
  <van-icon name="play" color="white" />
</ImmersiveBottomBar>
```

## 主题系统

### 三种模式

```typescript
themeStore.setMode('auto');   // 跟随系统（推荐）
themeStore.setMode('dark');   // 强制深色
themeStore.setMode('light');  // 强制浅色
```

### 架构

- **CSS 层**：`@media (prefers-color-scheme: dark)` + `data-theme` 属性
- **JavaScript 层**：Pinia Store 管理状态
- **原生层（Android/iOS）**：双向同步（Web ↔ Native Bridge）

**详见：** [docs/THEME_SYSTEM.md](docs/THEME_SYSTEM.md)

## 技术栈

- **前端**：Vue 3 + TypeScript + Vant 4
- **构建**：Rsbuild (Rspack)
- **状态管理**：Pinia
- **移动端**：Tauri 2
- **代码规范**：Biome

## 开发命令

```bash
# Web 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建

# 代码质量
npm run lint         # 检查代码
npm run check        # 检查并自动修复
npm run format       # 格式化代码

# Android 构建
npm run build:android:dev   # 开发模式（热更新）
npm run build:android:prod  # 生产模式（硬打包）
```

## 项目结构

```
tvvb/
├── src/
│   ├── components/          # 公共组件
│   │   ├── FixedBottom.vue
│   │   ├── ImmersiveNavbar.vue
│   │   └── ImmersiveBottomBar.vue
│   ├── layouts/             # 布局组件
│   │   └── MainLayout.vue
│   ├── pages/               # 页面
│   ├── stores/              # 状态管理
│   └── styles/              # 全局样式
├── src-tauri/               # Tauri 后端
│   └── gen/android/         # Android 项目
├── scripts/                  # 构建脚本
│   ├── build-android.sh
│   └── templates/
├── docs/                     # 文档
│   ├── LAYOUT_SYSTEM.md
│   ├── THEME_SYSTEM.md
│   └── BUILD_ANDROID.md
└── SUMMARY.md                # 功能总结
```

## 文档

- [布局系统](docs/LAYOUT_SYSTEM.md) - 5 种布局模式详解
- [主题系统](docs/THEME_SYSTEM.md) - 主题配置与原生同步
- [Android 构建](docs/BUILD_ANDROID.md) - 构建指南
- [功能总结](SUMMARY.md) - 完整功能总结

## License

MIT
