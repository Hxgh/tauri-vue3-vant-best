# Express App

一个使用 Tauri + Vue 3 + Vant 构建的跨平台移动应用示例。

## 🚀 快速开始

### Web 开发

```bash
pnpm dev      # 启动开发服务器（http://localhost:1420）
pnpm build    # 构建生产版本
pnpm preview  # 预览生产构建
```

### Android 开发

```bash
# 开发模式（热更新）
./scripts/build-android.sh dev

# 生产模式（硬打包）
./scripts/build-android.sh release
```

### 环境检查

```bash
./scripts/android-check.sh
```

## 📁 项目结构

```
express/
├── src/                  # 前端源代码（Vue 3 + TypeScript）
├── src-tauri/           # Tauri 后端（Rust）
├── scripts/             # 构建脚本
│   ├── build-android.sh # 统一 Android 构建脚本
│   └── templates/       # 构建模板（dev/release）
├── docs/                # 文档
├── dist/                # 构建产物
├── AGENTS.md            # 项目规范
└── package.json         # 依赖配置
```

## ✨ 主要特性

- 🎨 **Vant UI 4.9** - 完整的移动端组件库
- 📱 **安全区域适配** - 支持 iPhone 刘海屏和 Android 异形屏
- 🌓 **深色/浅色主题** - 跟随系统或用户自定义
- 🔥 **热重载开发** - 修改代码后自动刷新
- 📦 **Tauri 应用** - 原生性能 + Web 开发体验

## 📚 文档

详细文档请访问 [`docs/`](./docs) 目录：

- **[快速开始](./docs/QUICK_START.md)** - 3 分钟入门
- **[Android 调试](./docs/ANDROID_DEBUG.md)** - 完整调试指南
- **[构建脚本](./scripts/README.md)** - 脚本使用说明
- **[移动端配置](./docs/MOBILE_SETUP.md)** - 响应式设计
- **[主题配置](./docs/THEME_CONFIG.md)** - 深色模式

## 🛠️ 构建脚本

统一的 Android 构建脚本支持两种模式：

| 模式 | 命令 | 特点 |
|------|------|------|
| **开发** | `./scripts/build-android.sh dev` | 加载开发服务器，支持热更新 |
| **生产** | `./scripts/build-android.sh release` | 硬打包资源，无需服务器 |

脚本会自动处理：
- ✅ 环境检查和清理
- ✅ 模板切换（dev/release MainActivity）
- ✅ APK 构建和安装
- ✅ 应用启动

详见 [`scripts/README.md`](./scripts/README.md)

## 🔧 技术栈

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Vant** - 移动端 UI 库
- **Pinia** - 状态管理
- **Rsbuild** - 构建工具

### 后端

- **Tauri 2** - 轻量级应用框架
- **Rust** - 高性能系统语言
- **WebView** - 跨平台 Web 容器

### 开发工具

- **Biome** - 代码检查和格式化
- **Gradle** - Android 构建系统
- **ADB** - Android 调试工具

## 🎯 工作流

### 日常开发

```bash
# 终端 1：启动 Web 开发服务器
pnpm dev

# 终端 2：打包并在手机上运行
./scripts/build-android.sh dev

# 修改代码 → 手机自动刷新（无需重新打包）
```

### 发布流程

```bash
# 1. 构建生产版本
./scripts/build-android.sh release

# 2. 在手机上测试
# 3. 准备发布（签名等）
```

## 📱 支持的平台

- ✅ **Web** - 任何现代浏览器
- ✅ **Android** - 7.0 及以上
- 🏗️ **iOS** - 规划中
- 🏗️ **macOS/Windows** - 规划中

## 🐛 问题排查

### 遇到构建问题？

1. 检查环境：`./scripts/android-check.sh`
2. 查看构建脚本说明：[`scripts/README.md`](./scripts/README.md)
3. 详细调试指南：[`docs/ANDROID_DEBUG.md`](./docs/ANDROID_DEBUG.md)

### 常见错误

| 错误 | 解决方案 |
|------|---------|
| 手机未连接 | 检查 USB 连接，开启 USB 调试 |
| Gradle 锁定 | 脚本会自动清理（如果问题持续，手动运行 `./scripts/android-check.sh`） |
| 构建失败 | 查看详细日志，参考 [`docs/ANDROID_DEBUG.md`](./docs/ANDROID_DEBUG.md) |

## 📖 参考资源

- [Tauri 官方文档](https://tauri.app/zh-cn/)
- [Vue 3 文档](https://vuejs.org/)
- [Vant 文档](https://vant-ui.github.io/vant/)
- [Rsbuild 文档](https://rsbuild.dev/)

## 📝 规范

项目遵循 [`AGENTS.md`](./AGENTS.md) 中的编码规范。

主要工具：
- 代码检查：`pnpm lint`
- 代码格式化：`pnpm format`
- 类型检查：`pnpm check`

## 📄 许可

MIT License

---

**版本**: v0.1.0  
**最后更新**: 2025-11-06

🚀 **开始开发**：连接手机并运行 `./scripts/build-android.sh dev`
