#!/bin/bash
# Android 硬打包脚本（生产版本，不依赖开发服务器）
# 用法：./build-android-release.sh [arm64|universal]

set -e

PROJECT_ROOT="/Users/hugh/workspace/test/express"
ANDROID_DIR="$PROJECT_ROOT/src-tauri/gen/android"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo ""
echo "========================================="
echo "   📦 Android 硬打包脚本"
echo "========================================="
echo ""

# 获取架构类型
ARCH=${1:-arm64}
info "架构: $ARCH"

# 1. 检查设备
info "检查设备连接..."
if ! adb devices | grep -q "device$"; then
    echo "❌ 未检测到设备"
    exit 1
fi
DEVICE=$(adb devices | grep "device$" | awk '{print $1}' | head -1)
success "设备: $DEVICE"

# 2. 构建前端
info "构建前端生产版本..."
cd "$PROJECT_ROOT"
pnpm build
success "前端构建完成"

# 3. 构建 APK（跳过 Rust 编译，使用已有的 release 库）
info "构建 APK (使用 release 库)..."
cd "$ANDROID_DIR"

case $ARCH in
    arm64)
        ./gradlew assembleArm64Debug -x rustBuildArm64Debug
        APK_PATH="$ANDROID_DIR/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk"
        ;;
    universal)
        ./gradlew assembleUniversalDebug -x rustBuildUniversalDebug
        APK_PATH="$ANDROID_DIR/app/build/outputs/apk/universal/debug/app-universal-debug.apk"
        ;;
    *)
        echo "❌ 未知架构: $ARCH"
        exit 1
        ;;
esac

success "APK 构建完成"

# 4. 安装
info "安装到手机..."
adb install -r "$APK_PATH"
success "安装完成"

# 5. 启动
info "启动应用..."
adb shell am start -n com.express.app/.MainActivity
success "应用已启动"

# 显示信息
echo ""
echo "========================================="
success "硬打包完成！"
echo "========================================="
echo ""
echo "📦 APK: $APK_PATH"
echo "📱 设备: $DEVICE"
echo "💾 大小: $(du -h "$APK_PATH" | awk '{print $1}')"
echo ""

