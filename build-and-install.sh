#!/bin/bash
# Android 应用一键构建与安装脚本

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🚀 Express App - Android 构建脚本"
echo "=========================================="
echo ""

# 检查手机连接
echo "📱 检查手机连接..."
if ! adb devices | grep -q "device$"; then
    echo "❌ 错误：未检测到手机连接！"
    echo "请确保："
    echo "  1. 手机已连接到电脑"
    echo "  2. 手机已开启 USB 调试"
    echo "  3. 手机已授权此电脑"
    exit 1
fi
echo "✅ 手机已连接"
echo ""

# 1. 停止 Gradle 守护进程
echo "🛑 停止 Gradle 守护进程..."
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew --stop > /dev/null 2>&1 || true
echo "✅ 完成"
echo ""

# 2. 清理旧构建
echo "🧹 清理旧构建..."
./gradlew clean > /dev/null 2>&1
echo "✅ 完成"
echo ""

# 3. 构建前端
echo "📦 构建前端资源..."
cd /Users/hugh/workspace/test/express
pnpm build
echo "✅ 完成"
echo ""

# 4. 构建 Android APK
echo "🔨 构建 Android APK (arm64)..."
cd /Users/hugh/workspace/test/express/src-tauri/gen/android
./gradlew assembleArm64Debug
echo "✅ 完成"
echo ""

# 5. 安装到手机
echo "📲 安装到手机..."
APK_PATH="app/build/outputs/apk/arm64/debug/app-arm64-debug.apk"
adb install -r "$APK_PATH"
echo "✅ 完成"
echo ""

echo "=========================================="
echo "🎉 构建与安装成功！"
echo "=========================================="
echo ""
echo "APK 位置: $APK_PATH"
echo ""
echo "💡 提示："
echo "  - 修改前端代码后，再次运行此脚本即可"
echo "  - 使用热重载：运行 'pnpm dev'，手机浏览器访问 http://<你的IP>:1420"
echo ""

