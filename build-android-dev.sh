#!/bin/bash
# Android 开发模式脚本（连接到开发服务器，支持热重载）
# 用法：./build-android-dev.sh

set -e

PROJECT_ROOT="/Users/hugh/workspace/test/express"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
echo "========================================="
echo "   🔧 Android 开发模式"
echo "========================================="
echo ""

# 获取本机 IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
DEV_URL="http://${LOCAL_IP}:1420"

info "开发服务器: $DEV_URL"
echo ""

# 检查开发服务器是否运行
if ! curl -s "$DEV_URL" > /dev/null 2>&1; then
    warn "无法连接到开发服务器: $DEV_URL"
    warn "请确保已运行: pnpm dev"
    echo ""
fi

# 检查设备
info "检查设备连接..."
if ! adb devices | grep -q "device$"; then
    error "未检测到设备"
    echo ""
    echo "请确保："
    echo "  1. USB 已连接"
    echo "  2. 已开启 USB 调试"
    echo "  3. 已授权此电脑"
    exit 1
fi

DEVICE=$(adb devices | grep "device$" | awk '{print $1}' | head -1)
success "设备: $DEVICE"
echo ""

# 使用 Tauri android dev（自动连接 devUrl，支持热重载）
info "启动开发模式（会自动构建、安装、启动）..."
cd "$PROJECT_ROOT"

# android dev 会：
# 1. 读取 tauri.conf.json 中的 devUrl
# 2. 自动构建 APK
# 3. 自动安装到设备
# 4. 自动启动应用
npx @tauri-apps/cli android dev

echo ""
echo "========================================="
success "开发模式已启动！"
echo "========================================="
echo ""
echo "🔥 开发服务器: $DEV_URL"
echo "📱 设备: $DEVICE"
echo "🔄 热重载: 已启用"
echo ""
echo "💡 修改前端代码后，页面会自动刷新（无需重新打包）"
echo "💡 修改 Android/Rust 代码后，需要重新运行此脚本"
echo ""
