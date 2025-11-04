# 📱 Android 构建步骤（手动执行）

## 方案一：分步构建（推荐，更稳定）

### 步骤 1：启动开发服务器

**在第一个终端窗口运行：**

```bash
cd /Users/hugh/workspace/test/express
pnpm dev
```

等待看到类似输出：
```
✓ ready   built in xxx ms
➜  Local:    http://localhost:1420/
```

**保持这个终端窗口运行！不要关闭！**

---

### 步骤 2：构建并安装到手机

**在第二个终端窗口运行：**

```bash
cd /Users/hugh/workspace/test/express
npx @tauri-apps/cli android build
```

等待构建完成（首次约 5-10 分钟）...

---

### 步骤 3：安装 APK 到手机

构建完成后，APK 位置：
```
src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

**安装到手机：**

```bash
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

---

### 步骤 4：手动启动应用

在手机上找到并点击 **Express** 应用图标启动。

---

## 方案二：简化构建（仅构建，不启动开发服务器）

如果你只想先看看能否成功构建 APK：

```bash
cd /Users/hugh/workspace/test/express

# 1. 先构建前端
pnpm build

# 2. 构建 Android APK（使用生产版本）
npx @tauri-apps/cli android build --apk
```

APK 位置：
```
src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

安装：
```bash
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

---

## 方案三：完整构建命令（一步到位）

如果 `pnpm dev` 能正常启动，可以尝试：

```bash
cd /Users/hugh/workspace/test/express

# 修改 tauri.conf.json，设置 beforeDevCommand 为空
# 然后手动启动开发服务器
pnpm dev &

# 等待 5 秒
sleep 5

# 构建 Android
npx @tauri-apps/cli android build --apk

# 安装
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

---

## 检查命令

### 检查手机连接
```bash
adb devices
```

应该看到：
```
List of devices attached
b3426c7b	device
```

### 检查开发服务器
```bash
curl http://localhost:1420
```

如果返回 HTML，说明服务器正常。

---

## 常见问题

### 问题 1：开发服务器启动失败
```bash
# 检查端口占用
lsof -i :1420

# 杀掉占用进程
lsof -ti:1420 | xargs kill -9

# 重新启动
pnpm dev
```

### 问题 2：Gradle 构建失败
```bash
# 清理 Gradle 缓存
cd src-tauri/gen/android
./gradlew clean
cd ../../..

# 重新构建
npx @tauri-apps/cli android build --apk
```

### 问题 3：安装失败
```bash
# 卸载旧版本
adb uninstall com.express.app

# 重新安装
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

---

## 快速命令汇总

```bash
# 终端 1：启动开发服务器
cd /Users/hugh/workspace/test/express && pnpm dev

# 终端 2：构建 Android（等开发服务器启动后）
cd /Users/hugh/workspace/test/express && npx @tauri-apps/cli android build --apk

# 安装到手机
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk

# 启动应用（在手机上手动点击图标）
```

---

## 成功标志

构建成功后，你会看到：

```
BUILD SUCCESSFUL in XXm XXs
```

安装成功后，你会看到：

```
Success
```

应用启动后，你应该能在手机上看到：
- 顶部导航栏显示 "Express App"
- 可滚动的内容区域
- 底部标签栏（首页、搜索、朋友、设置）

---

**现在开始！打开两个终端窗口，按照方案一执行。** 🚀

