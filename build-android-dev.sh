#!/bin/bash
# Android 开发模式脚本（连接到开发服务器，支持热重载）
# 用法：./build-android-dev.sh [arm64|universal]

set -e

PROJECT_ROOT="/Users/hugh/workspace/test/express"
ANDROID_DIR="$PROJECT_ROOT/src-tauri/gen/android"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

echo ""
echo "========================================="
echo "   🔧 Android 开发模式"
echo "========================================="
echo ""

# 获取架构类型
ARCH=${1:-arm64}
info "架构: $ARCH"

# 获取本机 IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
DEV_URL="http://${LOCAL_IP}:1420"

info "开发服务器: $DEV_URL"
warn "请确保开发服务器已启动: pnpm dev"
echo ""

# 检查开发服务器是否运行
if ! curl -s "$DEV_URL" > /dev/null 2>&1; then
    echo "❌ 无法连接到开发服务器: $DEV_URL"
    echo ""
    echo "请先运行: pnpm dev"
    exit 1
fi

success "开发服务器运行中"

# 1. 检查设备
info "检查设备连接..."
if ! adb devices | grep -q "device$"; then
    echo "❌ 未检测到设备"
    exit 1
fi
DEVICE=$(adb devices | grep "device$" | awk '{print $1}' | head -1)
success "设备: $DEVICE"

# 2. 临时修改配置文件，启用 devUrl
info "配置开发模式..."
TAURI_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json"
BACKUP_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json.backup"

# 备份原配置
cp "$TAURI_CONF" "$BACKUP_CONF"

# 修改 devUrl（使用 sed 替换）
sed -i '' "s|\"devUrl\": \"http://localhost:1420\"|\"devUrl\": \"$DEV_URL\"|g" "$TAURI_CONF"

success "开发模式配置完成"

# 3. 构建 APK（使用 Tauri CLI，会自动连接到 devUrl）
info "构建开发版 APK..."
cd "$PROJECT_ROOT"

# 使用 Tauri CLI 构建
npx @tauri-apps/cli android build --target aarch64 2>&1 | grep -v "thread '<unnamed>' panicked" || true

# 恢复配置
mv "$BACKUP_CONF" "$TAURI_CONF"

case $ARCH in
    arm64)
        APK_PATH="$ANDROID_DIR/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk"
        ;;
    universal)
        APK_PATH="$ANDROID_DIR/app/build/outputs/apk/universal/debug/app-universal-debug.apk"
        ;;
    *)
        echo "❌ 未知架构: $ARCH"
        exit 1
        ;;
esac

if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK 构建失败"
    exit 1
fi

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
success "开发模式已启动！"
echo "========================================="
echo ""
echo "🔥 开发服务器: $DEV_URL"
echo "📱 设备: $DEVICE"
echo "🔄 热重载: 已启用"
echo ""
echo "💡 修改代码后，页面会自动刷新（无需重新打包）"
echo ""

