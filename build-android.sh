#!/bin/bash
# Android 快速构建脚本
# 用法：./build-android.sh [arm64|universal|release]

set -e

PROJECT_ROOT="/Users/hugh/workspace/test/express"
ANDROID_DIR="$PROJECT_ROOT/src-tauri/gen/android"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 检查手机连接
check_device() {
    info "检查设备连接..."
    if ! adb devices | grep -q "device$"; then
        error "未检测到设备！请检查："
        echo "  1. USB 连接是否正常"
        echo "  2. 手机是否开启 USB 调试"
        echo "  3. 是否授权了 ADB 调试"
        exit 1
    fi
    DEVICE=$(adb devices | grep "device$" | awk '{print $1}' | head -1)
    success "检测到设备: $DEVICE"
}

# 清理环境
clean_env() {
    info "清理构建环境..."
    cd "$ANDROID_DIR"
    ./gradlew --stop > /dev/null 2>&1 || true
    ./gradlew clean > /dev/null 2>&1
    success "环境清理完成"
}

# 构建前端
build_frontend() {
    info "构建前端资源..."
    cd "$PROJECT_ROOT"
    pnpm build
    success "前端构建完成"
}

# 构建 APK
build_apk() {
    local build_type=$1
    info "构建 APK ($build_type)..."
    cd "$ANDROID_DIR"
    
    case $build_type in
        arm64)
            ./gradlew assembleArm64Debug
            APK_PATH="$ANDROID_DIR/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk"
            ;;
        universal)
            ./gradlew assembleUniversalDebug
            APK_PATH="$ANDROID_DIR/app/build/outputs/apk/universal/debug/app-universal-debug.apk"
            ;;
        release)
            ./gradlew assembleArm64Release
            APK_PATH="$ANDROID_DIR/app/build/outputs/apk/arm64/release/app-arm64-release.apk"
            ;;
        *)
            error "未知的构建类型: $build_type"
            exit 1
            ;;
    esac
    
    success "APK 构建完成"
}

# 安装到手机
install_apk() {
    info "安装到手机..."
    if [ ! -f "$APK_PATH" ]; then
        error "APK 文件不存在: $APK_PATH"
        exit 1
    fi
    
    adb install -r "$APK_PATH"
    success "安装完成"
}

# 启动应用
launch_app() {
    info "启动应用..."
    adb shell am start -n com.express.app/.MainActivity
    success "应用已启动"
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "   📱 Android 快速构建脚本"
    echo "========================================="
    echo ""
    
    # 获取构建类型参数
    BUILD_TYPE=${1:-arm64}
    
    # 验证构建类型
    if [[ ! "$BUILD_TYPE" =~ ^(arm64|universal|release)$ ]]; then
        error "无效的构建类型: $BUILD_TYPE"
        echo ""
        echo "用法: $0 [arm64|universal|release]"
        echo ""
        echo "  arm64      - 构建 arm64 debug 版本（推荐，最快）"
        echo "  universal  - 构建通用 debug 版本（兼容所有设备）"
        echo "  release    - 构建 arm64 release 版本（需要签名）"
        echo ""
        exit 1
    fi
    
    info "构建类型: $BUILD_TYPE"
    echo ""
    
    # 执行构建流程
    check_device
    clean_env
    build_frontend
    build_apk "$BUILD_TYPE"
    install_apk
    launch_app
    
    # 显示 APK 信息
    echo ""
    echo "========================================="
    success "构建完成！"
    echo "========================================="
    echo ""
    echo "📦 APK 路径:"
    echo "   $APK_PATH"
    echo ""
    echo "📱 已安装到设备: $DEVICE"
    echo ""
    
    # 显示 APK 大小
    APK_SIZE=$(du -h "$APK_PATH" | awk '{print $1}')
    echo "💾 APK 大小: $APK_SIZE"
    echo ""
}

# 错误处理
trap 'error "构建失败！请检查错误信息。"; exit 1' ERR

# 运行主函数
main "$@"

