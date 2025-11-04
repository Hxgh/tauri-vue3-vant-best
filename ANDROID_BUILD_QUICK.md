# Android 构建快速参考

> 最常用的命令和快速构建方式。详细文档请查看 [BUILD_ANDROID.md](./BUILD_ANDROID.md)

---

## 🚀 一键构建脚本（推荐）

### 安装到手机（自动完成所有步骤）

```bash
# arm64 版本（推荐，最快）
./build-android.sh arm64

# 通用版本（兼容所有设备）
./build-android.sh universal

# Release 版本（需要签名）
./build-android.sh release
```

**脚本会自动：**
1. ✅ 检查手机连接
2. ✅ 清理构建环境
3. ✅ 构建前端资源
4. ✅ 构建 APK
5. ✅ 安装到手机
6. ✅ 启动应用

---

## ⚡ 手动构建（3 步）

### 步骤 1：清理（可选）

```bash
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop && ./gradlew clean
```

### 步骤 2：构建

```bash
# arm64 版本（推荐）
./gradlew assembleArm64Debug

# 通用版本
./gradlew assembleUniversalDebug
```

### 步骤 3：安装

```bash
# arm64
adb install -r app/build/outputs/apk/arm64/debug/app-arm64-debug.apk

# 通用版
adb install -r app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

---

## 🔧 常用命令

```bash
# 检查手机连接
adb devices

# 查看应用日志
adb logcat | grep -i tauri

# 启动应用
adb shell am start -n com.express.app/.MainActivity

# 卸载应用
adb uninstall com.express.app

# 强制停止应用
adb shell am force-stop com.express.app
```

---

## 🐛 遇到问题？

### 问题：Blocking waiting for file lock

```bash
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop
ps aux | grep gradle  # 查找卡住的进程
# kill -9 <PID>  # 如果有，强制杀掉
./gradlew clean
```

### 问题：手机检测不到

1. 检查 USB 连接
2. 手机开启"USB 调试"
3. 运行 `adb devices` 并在手机上授权

### 问题：构建失败

```bash
# 深度清理
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop
rm -rf .gradle app/.gradle app/build build
./gradlew clean
```

---

## 📁 APK 位置

| 构建类型 | APK 路径 |
|---------|---------|
| arm64 debug | `src-tauri/gen/android/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk` |
| universal debug | `src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk` |
| arm64 release | `src-tauri/gen/android/app/build/outputs/apk/arm64/release/app-arm64-release.apk` |

---

## 📊 构建时间对比

| 构建类型 | 时间 | 文件大小 | 适用场景 |
|---------|------|---------|---------|
| arm64 | ~30秒 | ~15MB | ✅ 推荐（现代手机） |
| universal | ~90秒 | ~40MB | 兼容老设备 |

---

## 💡 开发提示

### 热重载开发（最快）

```bash
# 终端 1
pnpm dev

# 终端 2
npx @tauri-apps/cli android dev
```

修改代码后，点击应用内的刷新按钮即可。

### 仅重新安装（不重新构建）

```bash
adb install -r <APK路径>
```

### 查看构建日志

```bash
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew assembleArm64Debug --info
```

---

## 🎯 推荐工作流

**日常开发：**
```bash
# 使用热重载，不需要打包
pnpm dev
npx @tauri-apps/cli android dev
```

**测试打包：**
```bash
# 使用快速脚本
./build-android.sh arm64
```

**发布版本：**
```bash
# 构建 release 版本
./build-android.sh release
```

---

## 📖 完整文档

更多详细信息，请查看：
- [BUILD_ANDROID.md](./BUILD_ANDROID.md) - 完整构建指南
- [THEME_CONFIG.md](./THEME_CONFIG.md) - 主题配置文档

---

**快速开始：**
```bash
./build-android.sh arm64
```

就这么简单！ 🎉

