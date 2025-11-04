#!/bin/bash

echo "🚀 Android 构建脚本"
echo ""

# 切换到项目目录
cd /Users/hugh/workspace/test/express

# 步骤 1：构建前端
echo "📦 步骤 1: 构建前端..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败！"
    exit 1
fi

echo "✅ 前端构建成功！"
echo ""

# 步骤 2：构建 Android APK
echo "📱 步骤 2: 构建 Android APK..."
echo "（这需要几分钟，请耐心等待...）"
echo ""

npx @tauri-apps/cli android build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Android 构建失败！"
    echo ""
    echo "常见问题："
    echo "1. 检查手机是否连接: adb devices"
    echo "2. 清理 Gradle 缓存: cd src-tauri/gen/android && ./gradlew clean"
    echo "3. 查看详细日志: 滚动查看上面的错误信息"
    exit 1
fi

echo ""
echo "✅ 构建成功！"
echo ""

# 查找 APK 文件
APK_PATH="src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk"
APK_DEBUG_PATH="src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo "📦 Release APK 位置："
    echo "   $APK_PATH"
    echo ""
    echo "安装到手机："
    echo "   adb install -r $APK_PATH"
elif [ -f "$APK_DEBUG_PATH" ]; then
    echo "📦 Debug APK 位置："
    echo "   $APK_DEBUG_PATH"
    echo ""
    echo "安装到手机："
    echo "   adb install -r $APK_DEBUG_PATH"
else
    echo "⚠️  未找到 APK 文件，请检查构建日志"
fi

echo ""
echo "🎉 完成！"

