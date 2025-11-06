# 📚 Express App 文档

## 快速导航

### 🚀 快速开始
- **[QUICK_START.md](./QUICK_START.md)** - 3 分钟快速入门指南

### 📱 Android 开发
- **[ANDROID_DEBUG.md](./ANDROID_DEBUG.md)** - 完整 Android 调试指南
- **[ANDROID_BUILD_QUICK.md](./ANDROID_BUILD_QUICK.md)** - Android 构建快速参考
- **[BUILD_ANDROID.md](./BUILD_ANDROID.md)** - Android 构建完整指南

### 🎨 移动端配置
- **[MOBILE_SETUP.md](./MOBILE_SETUP.md)** - Vant UI 和安全区域配置
- **[THEME_CONFIG.md](./THEME_CONFIG.md)** - 主题深色模式配置

---

## 项目结构

```
express/
├── src/                    # 前端源码
├── src-tauri/              # Tauri 后端
├── scripts/                # 构建脚本和工具
│   ├── build-android.sh   # 统一 Android 构建脚本
│   ├── android-check.sh   # 环境检查脚本
│   ├── templates/         # 构建模板
│   └── README.md          # 脚本说明
├── docs/                   # 文档（本目录）
├── AGENTS.md              # 项目规范
└── package.json           # 项目配置
```

---

## 常用命令

```bash
# 前端开发
pnpm dev                 # 启动开发服务器

# Android 构建
./scripts/build-android.sh dev      # 开发模式（热更新）
./scripts/build-android.sh release  # 生产模式（硬打包）

# 环境检查
./scripts/android-check.sh          # 检查 Android 环境
```

---

## 关键特性

✅ Vue 3 + TypeScript  
✅ Vant UI 4.9  
✅ 移动端安全区域适配  
✅ 深色/浅色主题支持  
✅ Android 开发（Tauri + Rust）  
✅ 热重载开发  

---

## 下一步

1. 阅读 [QUICK_START.md](./QUICK_START.md) 快速上手
2. 连接 Android 设备后运行 `./scripts/android-check.sh`
3. 参考 [ANDROID_DEBUG.md](./ANDROID_DEBUG.md) 进行开发

---

**项目版本**: v0.1.0  
**最后更新**: 2025-11-06


