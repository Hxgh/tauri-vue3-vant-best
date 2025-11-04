# 📱 Express App - Rsbuild + Vue + Vant + Tauri

一个现代化的跨平台移动应用，支持 Web、Android 和桌面端。

## ✨ 特性

- 🚀 **Rsbuild** - 快速的构建工具
- 🎨 **Vue 3** - 渐进式 JavaScript 框架
- 📱 **Vant UI** - 轻量、可靠的移动端组件库
- 🔧 **Tauri** - 构建原生应用
- 🎯 **TypeScript** - 类型安全
- 📐 **安全区域适配** - 完美支持刘海屏、异形屏

## 🚀 快速开始

### Web 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 1420）
pnpm dev

# 构建生产版本
pnpm build
```

### Android 开发

**快速构建（推荐）：**
```bash
# 一键构建并安装到手机
./build-android.sh arm64
```

**或使用 npm scripts：**
```bash
# 启动 Android 调试
pnpm android:dev

# 构建 APK
pnpm android:build
```

**详细文档：**
- 📱 [Android 构建快速参考](./ANDROID_BUILD_QUICK.md) ⭐
- 📖 [Android 构建完整指南](./BUILD_ANDROID.md)

## 📚 文档

### 构建相关
- 📱 **[ANDROID_BUILD_QUICK.md](./ANDROID_BUILD_QUICK.md)** - Android 构建快速参考 ⭐
- 📖 **[BUILD_ANDROID.md](./BUILD_ANDROID.md)** - Android 构建完整指南
- 🛠️ **[build-android.sh](./build-android.sh)** - 一键构建脚本

### 配置相关
- ⚙️ **[README_ANDROID_READY.md](./README_ANDROID_READY.md)** - Android 环境配置说明
- 🎨 **[THEME_CONFIG.md](./THEME_CONFIG.md)** - 主题配置文档
- 📱 **[MOBILE_SETUP.md](./MOBILE_SETUP.md)** - 移动端配置说明

### 开发相关
- 🚀 **[QUICK_START.md](./QUICK_START.md)** - 快速开始指南
- 🐛 **[ANDROID_DEBUG.md](./ANDROID_DEBUG.md)** - Android 调试指南

## 🛠️ 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Web 开发服务器（端口 1420） |
| `pnpm build` | 构建 Web 应用 |
| `pnpm preview` | 预览生产构建 |
| `pnpm check` | 代码检查 |
| `pnpm format` | 代码格式化 |
| `pnpm android:check` | 检查 Android 开发环境 |
| `pnpm android:dev` | Android 调试模式 |
| `pnpm android:build` | 构建 Debug APK |
| `pnpm android:build:release` | 构建 Release APK |

## 🏗️ 技术栈

- **构建工具**: Rsbuild 1.6.0
- **框架**: Vue 3.5.22
- **UI 库**: Vant 4.9.21
- **语言**: TypeScript 5.9.3
- **原生**: Tauri 2.9.2
- **代码检查**: Biome 2.2.3

## 📱 支持平台

- ✅ Web（现代浏览器）
- ✅ Android 7.0+（API 24+）
- ✅ macOS（桌面应用）
- ⏳ iOS（需要 macOS + Xcode）
- ⏳ Windows（需要 Windows 系统）
- ⏳ Linux（需要 Linux 系统）

## 🎯 已配置功能

### 前端
- ✅ Vant 组件自动按需引入
- ✅ 移动端安全区域适配
- ✅ NavBar + Tabbar 布局示例
- ✅ Toast、Dialog、Notify 组件
- ✅ CSS 变量配置

### Android
- ✅ Android 项目初始化完成
- ✅ 支持多架构（ARM64、ARMv7、x86、x86_64）
- ✅ 热重载开发
- ✅ 环境检查脚本

## 🔧 开发环境要求

### Web 开发
- Node.js 20+
- pnpm 8+

### Android 开发
- macOS（已验证）
- Android Studio
- Java JDK（Android Studio 自带）
- Android SDK + NDK
- Rust 工具链

**详细配置请查看**: [ANDROID_DEBUG.md](./ANDROID_DEBUG.md)

## 📖 下一步

1. 🌐 **Web 开发**: 运行 `pnpm dev` 开始开发
2. 📱 **Android 开发**: 阅读 [README_ANDROID_READY.md](./README_ANDROID_READY.md)
3. 🚀 **快速上手**: 查看 [QUICK_START.md](./QUICK_START.md)

## 📄 License

MIT

---

## Learn more

- [Rsbuild documentation](https://rsbuild.rs) - explore Rsbuild features and APIs
- [Vue documentation](https://vuejs.org/) - learn Vue
- [Vant documentation](https://vant-ui.github.io/vant/) - Vant UI components
- [Tauri documentation](https://tauri.app/) - build native apps
