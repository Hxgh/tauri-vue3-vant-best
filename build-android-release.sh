#!/bin/bash
# Android 硬打包脚本（生产版本，不依赖开发服务器）
# 用法：./build-android-release.sh

set -e

PROJECT_ROOT="/Users/hugh/workspace/test/express"
ANDROID_DIR="$PROJECT_ROOT/src-tauri/gen/android"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
echo "========================================="
echo "   📦 Android 硬打包脚本"
echo "========================================="
echo ""

# 1. 检查设备
info "检查设备连接..."
if ! adb devices | grep -q "device$"; then
    error "未检测到设备"
    exit 1
fi
DEVICE=$(adb devices | grep "device$" | awk '{print $1}' | head -1)
success "设备: $DEVICE"

# 2. 检查 apksigner
if [ -z "$ANDROID_HOME" ]; then
    error "未设置 ANDROID_HOME 环境变量"
    exit 1
fi

APKSIGNER=$(find $ANDROID_HOME/build-tools -name apksigner 2>/dev/null | sort -V | tail -1)
if [ -z "$APKSIGNER" ]; then
    error "未找到 apksigner"
    exit 1
fi

info "使用 apksigner: $APKSIGNER"

# 3. 备份并移除 devUrl
info "配置硬打包模式（移除 devUrl）..."
TAURI_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json"
BACKUP_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json.backup"

cp "$TAURI_CONF" "$BACKUP_CONF"
sed -i '' '/"devUrl":/d' "$TAURI_CONF"

success "已移除 devUrl（强制使用本地资源）"

# 4. 使用 Tauri CLI 构建
info "构建 APK（使用 Tauri CLI）..."
cd "$PROJECT_ROOT"

npx @tauri-apps/cli android build --apk true

# 恢复配置
mv "$BACKUP_CONF" "$TAURI_CONF"

# 5. 签名 APK
UNSIGNED_APK="$ANDROID_DIR/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk"
SIGNED_APK="$ANDROID_DIR/app/build/outputs/apk/universal/release/app-signed.apk"

if [ ! -f "$UNSIGNED_APK" ]; then
    error "APK 文件不存在: $UNSIGNED_APK"
    exit 1
fi

info "签名 APK..."
$APKSIGNER sign \
    --ks ~/.android/debug.keystore \
    --ks-key-alias AndroidDebugKey \
    --ks-pass pass:android \
    --key-pass pass:android \
    --out "$SIGNED_APK" \
    "$UNSIGNED_APK"

success "APK 签名完成"

# 6. 安装
info "安装到手机..."
adb install -r "$SIGNED_APK"
success "安装完成"

# 7. 启动
info "启动应用..."
adb shell am start -n com.express.app/.MainActivity
success "应用已启动"

# 显示信息
echo ""
echo "========================================="
success "硬打包完成！"
echo "========================================="
echo ""
echo "📦 APK: $SIGNED_APK"
echo "📱 设备: $DEVICE"
echo "💾 大小: $(du -h "$SIGNED_APK" | awk '{print $1}')"
echo ""
echo "💡 此 APK 不依赖开发服务器，可独立运行"
echo ""
