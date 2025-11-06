# Android 构建完整指南

> 本文档包含 Tauri Android 应用的完整构建流程，包括环境配置、构建步骤和问题排查。

---

## 📋 目录

1. [环境要求](#环境要求)
2. [快速构建](#快速构建)
3. [详细步骤](#详细步骤)
4. [常见问题](#常见问题)
5. [开发调试](#开发调试)

---

## 🔧 环境要求

### 必需软件
- ✅ **JDK 17+**（推荐 OpenJDK 17）
- ✅ **Android SDK**（通过 Android Studio 安装）
- ✅ **NDK 29** (路径: `~/Library/Android/sdk/ndk/29.0.14206865`)
- ✅ **Rust** + **Cargo**
- ✅ **Node.js** + **pnpm**
- ✅ **ADB** (Android Debug Bridge)

### Rust Android 目标

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

### ⚠️ NDK 29 链接器配置（重要！）

**问题：** NDK 29 的链接器不兼容 Rust 的某些链接参数。

**解决方案：** 创建 Cargo 配置文件指定兼容的链接器。

**文件：** `src-tauri/.cargo/config.toml`

```toml
[target.aarch64-linux-android]
linker = "/Users/hugh/Library/Android/sdk/ndk/29.0.14206865/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android24-clang"

[target.armv7-linux-androideabi]
linker = "/Users/hugh/Library/Android/sdk/ndk/29.0.14206865/toolchains/llvm/prebuilt/darwin-x86_64/bin/armv7a-linux-androideabi24-clang"

[target.i686-linux-android]
linker = "/Users/hugh/Library/Android/sdk/ndk/29.0.14206865/toolchains/llvm/prebuilt/darwin-x86_64/bin/i686-linux-android24-clang"

[target.x86_64-linux-android]
linker = "/Users/hugh/Library/Android/sdk/ndk/29.0.14206865/toolchains/llvm/prebuilt/darwin-x86_64/bin/x86_64-linux-android24-clang"
```

> ✅ **已自动创建，无需手动操作！**

---

## ⚡ 快速构建

### 方案 A：仅构建 arm64（最快，推荐）

```bash
# 1. 清理环境
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop
./gradlew clean

# 2. 构建 arm64 版本
./gradlew assembleArm64Debug

# 3. 安装到手机
adb install -r app/build/outputs/apk/arm64/debug/app-arm64-debug.apk
```

**APK 位置：**
```
src-tauri/gen/android/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk
```

---

### 方案 B：构建通用版（兼容所有设备）

```bash
# 1. 清理环境
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop
./gradlew clean

# 2. 构建通用版本
./gradlew assembleUniversalDebug

# 3. 安装到手机
adb install -r app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

**APK 位置：**
```
src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

---

### 方案 C：使用 Tauri CLI（可能卡住）

```bash
cd /Users/hugh/workspace/test/express
npx @tauri-apps/cli android build --debug
```

> ⚠️ **注意：** 如果遇到 "Blocking waiting for file lock" 错误，请使用方案 A 或 B。

---

## 📝 详细步骤

### 步骤 1：检查手机连接

```bash
adb devices
```

**预期输出：**
```
List of devices attached
XXXXXXXXXX      device
```

如果没有设备：
- 检查 USB 连接
- 确保手机开启了"USB 调试"
- 重新授权 ADB 调试

---

### 步骤 2：清理构建环境（可选，但推荐）

```bash
cd /Users/hugh/workspace/test/express/src-tauri/gen/android

# 停止所有 Gradle 守护进程
./gradlew --stop

# 清理构建缓存
./gradlew clean

# 深度清理（遇到问题时使用）
rm -rf .gradle app/.gradle app/build build
find . -type f -name "*.lock" -delete
```

---

### 步骤 3：构建前端资源

```bash
cd /Users/hugh/workspace/test/express
pnpm build
```

**预期输出：**
```
Rsbuild v1.6.0
info    build started...
ready   built in 0.3 s
```

---

### 步骤 4：构建 APK

#### 选项 1：arm64 版本（推荐，最快）

```bash
cd src-tauri/gen/android
./gradlew assembleArm64Debug
```

**构建时间：** 约 30-40 秒

**产物：** `app/build/outputs/apk/arm64/debug/app-arm64-debug.apk`

---

#### 选项 2：所有架构（通用版）

```bash
cd src-tauri/gen/android
./gradlew assembleUniversalDebug
```

**构建时间：** 约 60-90 秒

**产物：** `app/build/outputs/apk/universal/debug/app-universal-debug.apk`

---

### 步骤 5：安装到手机

```bash
# arm64 版本
adb install -r /Users/hugh/workspace/test/express/src-tauri/gen/android/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk

# 或通用版本
adb install -r /Users/hugh/workspace/test/express/src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

**预期输出：**
```
Performing Streamed Install
Success
```

---

### 步骤 6：启动应用

```bash
# 方式 1：在手机上手动打开 "Express App"

# 方式 2：使用 ADB 启动
adb shell am start -n com.express.app/.MainActivity
```

---

## 🐛 常见问题

### 问题 1：Blocking waiting for file lock on Android

**原因：** 多个 Gradle 进程同时运行导致文件锁冲突。

**解决方案：**

```bash
# 1. 停止所有 Gradle 进程
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop

# 2. 查找并杀死卡住的进程
ps aux | grep gradle
# 如果有进程，执行：kill -9 <PID>

# 3. 清理锁文件
find . -type f -name "*.lock" -delete
rm -rf .gradle app/.gradle

# 4. 重新构建
./gradlew clean
./gradlew assembleArm64Debug
```

---

### 问题 2：linker `aarch64-linux-android26-clang` not found

**原因：** NDK 29 中链接器版本不匹配。

**解决方案：** 

已通过 `src-tauri/.cargo/config.toml` 配置解决。

如果仍有问题，检查文件内容：

```bash
cat /Users/hugh/workspace/test/express/src-tauri/.cargo/config.toml
```

应该包含完整的 NDK 路径。

---

### 问题 3：INSTALL_PARSE_FAILED_NO_CERTIFICATES

**原因：** 尝试安装未签名的 release 版本。

**解决方案：** 

```bash
# 使用 debug 版本（自动签名）
./gradlew assembleArm64Debug

# 而不是
# ./gradlew assembleArm64Release  ❌
```

---

### 问题 4：adb: no devices/emulators found

**原因：** 手机未连接或 USB 调试未开启。

**解决方案：**

1. 检查 USB 连接
2. 手机开启"开发者选项"→"USB 调试"
3. 重新插拔 USB
4. 运行 `adb devices`，手机上授权调试

---

### 问题 5：构建卡在 Rust 编译阶段

**原因：** Rust 依赖下载慢或网络问题。

**解决方案：**

```bash
# 使用国内镜像源（已配置）
cat ~/.cargo/config
# 应该包含 rsproxy.cn 镜像配置

# 手动触发依赖更新
cd /Users/hugh/workspace/test/express/src-tauri
cargo clean
cargo build --target aarch64-linux-android
```

---

## 🚀 开发调试

### 方式 1：热重载开发（推荐）

**终端 1：启动前端 dev server**
```bash
cd /Users/hugh/workspace/test/express
pnpm dev
```

**终端 2：启动 Android app**
```bash
npx @tauri-apps/cli android dev
```

**手机访问：**
- 应用会自动连接到 `http://你的电脑IP:1420`
- 修改代码后，点击应用内的刷新按钮即可看到更新

**优点：**
- ✅ 不需要重新打包
- ✅ 实时预览
- ✅ 调试方便

---

### 方式 2：URL 调试

```bash
# 1. 启动 dev server
pnpm dev

# 2. 查看本机 IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 3. 在手机浏览器访问
http://你的IP:1420
```

---

### 方式 3：Android Studio 调试

```bash
# 用 Android Studio 打开项目
open -a "Android Studio" /Users/hugh/workspace/test/express/src-tauri/gen/android
```

**在 Android Studio 里：**
1. Build → Clean Project
2. Build → Make Project
3. Run → Run 'app'（选择你的设备）

---

## 📦 构建 Release 版本

### 步骤 1：生成签名密钥

```bash
keytool -genkey -v -keystore ~/express-release.keystore -alias express -keyalg RSA -keysize 2048 -validity 10000
```

### 步骤 2：配置签名

创建 `src-tauri/gen/android/keystore.properties`：

```properties
storePassword=你的密码
keyPassword=你的密码
keyAlias=express
storeFile=/Users/hugh/express-release.keystore
```

### 步骤 3：构建 Release APK

   ```bash
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew assembleArm64Release
```

**产物：**
```
app/build/outputs/apk/arm64/release/app-arm64-release.apk
```

---

## 🎯 快速命令参考

   ```bash
# === 清理 ===
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop && ./gradlew clean

# === 构建 ===
# arm64 (推荐)
./gradlew assembleArm64Debug

# 通用版
./gradlew assembleUniversalDebug

# === 安装 ===
adb install -r app/build/outputs/apk/arm64/debug/app-arm64-debug.apk

# === 启动 ===
adb shell am start -n com.express.app/.MainActivity

# === 查看日志 ===
adb logcat | grep -i tauri

# === 卸载 ===
adb uninstall com.express.app
   ```

---

## 📁 重要文件路径

| 文件/目录 | 说明 |
|----------|------|
| `src-tauri/.cargo/config.toml` | Rust 链接器配置（NDK 29 兼容性） |
| `src-tauri/tauri.conf.json` | Tauri 配置（bundle ID, minSdkVersion 等） |
| `src-tauri/gen/android/` | Android 项目目录 |
| `src-tauri/gen/android/app/src/main/res/values/themes.xml` | 浅色模式系统栏颜色 |
| `src-tauri/gen/android/app/src/main/res/values-night/themes.xml` | 深色模式系统栏颜色 |
| `src-tauri/gen/android/app/build/outputs/apk/` | 构建产物（APK） |

---

## 🔄 完整构建流程（一键复制）

### 开发版本（Debug）

```bash
#!/bin/bash
set -e

echo "🧹 清理环境..."
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop
./gradlew clean

echo "📦 构建前端..."
cd /Users/hugh/workspace/test/express
pnpm build

echo "🔨 构建 APK..."
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew assembleArm64Debug

echo "📱 安装到手机..."
adb install -r app/build/outputs/apk/arm64/debug/app-arm64-debug.apk

echo "✅ 完成！"
echo "APK: $(pwd)/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk"
```

**保存为 `build-android.sh` 并执行：**

```bash
chmod +x build-android.sh
./build-android.sh
```

---

## 💡 性能优化建议

### 1. 仅构建目标架构

大多数现代手机是 arm64：

```bash
./gradlew assembleArm64Debug  # ✅ 快（30秒）
# 而不是
./gradlew assembleUniversalDebug  # ❌ 慢（90秒）
```

### 2. 跳过 Tauri CLI

直接用 Gradle 构建更快、更稳定：

```bash
./gradlew assembleArm64Debug  # ✅ 推荐
# 而不是
npx @tauri-apps/cli android build  # ❌ 可能卡住
```

### 3. 增量构建

不要每次都 `clean`，除非遇到问题：

```bash
./gradlew assembleArm64Debug  # ✅ 增量构建，更快
```

### 4. 使用 Gradle 守护进程

Gradle 守护进程会加速后续构建，不要频繁 `--stop`。

---

## 📚 参考资料

- [Tauri Android 官方文档](https://tauri.app/zh-cn/v2/guides/building/android/)
- [Android Studio 下载](https://developer.android.com/studio)
- [NDK 官方文档](https://developer.android.com/ndk)
- [Gradle 构建文档](https://docs.gradle.org/)

---

## 🎉 总结

**推荐工作流：**

1. **日常开发：** 使用热重载（`pnpm dev` + `npx @tauri-apps/cli android dev`）
2. **测试打包：** 使用 Gradle 构建 arm64 版本
3. **发布版本：** 构建签名的 Release APK

**遇到问题：**
1. 先尝试清理环境（`./gradlew clean`）
2. 检查是否有卡住的进程（`ps aux | grep gradle`）
3. 查看错误日志（完整的 Gradle 输出）
4. 参考本文档的"常见问题"章节

---

**文档版本：** v1.0  
**最后更新：** 2025-11-04  
**适用项目：** Express App (Tauri + Vue + Vant)
