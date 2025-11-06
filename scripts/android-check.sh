#!/bin/bash

# Android 开发环境检查脚本

echo "🔍 检查 Android 开发环境..."
echo ""

# 检查 Java
echo "1️⃣  检查 Java..."
if java -version 2>&1 | grep -q "openjdk version"; then
    JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d '"' -f 2)
    echo "   ✅ Java 已安装：$JAVA_VERSION"
else
    echo "   ❌ Java 未安装"
    exit 1
fi
echo ""

# 检查 Android SDK
echo "2️⃣  检查 Android SDK..."
if [ -d "$ANDROID_HOME" ]; then
    echo "   ✅ Android SDK: $ANDROID_HOME"
else
    echo "   ❌ ANDROID_HOME 未设置"
    exit 1
fi
echo ""

# 检查 NDK
echo "3️⃣  检查 Android NDK..."
if [ -d "$NDK_HOME" ]; then
    echo "   ✅ Android NDK: $NDK_HOME"
else
    echo "   ❌ NDK_HOME 未设置"
    exit 1
fi
echo ""

# 检查 ADB
echo "4️⃣  检查 ADB..."
if command -v adb &> /dev/null; then
    ADB_VERSION=$(adb --version | head -1)
    echo "   ✅ ADB 已安装：$ADB_VERSION"
else
    echo "   ❌ ADB 未找到"
    exit 1
fi
echo ""

# 检查连接的设备
echo "5️⃣  检查已连接的设备..."
DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l | xargs)
if [ "$DEVICES" -gt 0 ]; then
    echo "   ✅ 已连接 $DEVICES 台设备："
    adb devices | grep "device$" | sed 's/^/      /'
else
    echo "   ⚠️  没有连接的设备"
    echo ""
    echo "   请按照以下步骤连接手机："
    echo "   1. 开启手机的 USB 调试"
    echo "   2. 用数据线连接手机到电脑"
    echo "   3. 在手机上授权 USB 调试"
    echo "   4. 再次运行此脚本检查"
    echo ""
    echo "   详细说明请查看：ANDROID_DEBUG.md"
    exit 1
fi
echo ""

# 检查 Rust Android 目标
echo "6️⃣  检查 Rust Android 编译目标..."
TARGETS=$(rustup target list | grep android | grep installed | wc -l | xargs)
if [ "$TARGETS" -eq 4 ]; then
    echo "   ✅ Rust Android 目标已安装 ($TARGETS/4)"
else
    echo "   ⚠️  部分 Android 目标未安装 ($TARGETS/4)"
    echo "   正在安装..."
    rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
fi
echo ""

# 检查开发服务器端口
echo "7️⃣  检查开发服务器端口 1420..."
if lsof -i :1420 &> /dev/null; then
    echo "   ✅ 端口 1420 正在使用（开发服务器运行中）"
else
    echo "   ⚠️  端口 1420 未使用"
    echo "   提示：运行 'pnpm dev' 启动开发服务器"
fi
echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 环境检查完成！"
echo ""
echo "📱 下一步："
echo "   1. 确保开发服务器正在运行："
echo "      pnpm dev"
echo ""
echo "   2. 启动 Android 调试："
echo "      npx @tauri-apps/cli android dev"
echo ""
echo "   详细说明请查看：ANDROID_DEBUG.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


