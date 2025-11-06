#!/bin/bash
# 统一的 Android 构建脚本
# 用法：./scripts/build-android.sh dev   - 开发模式（热更新）
#      ./scripts/build-android.sh release - 生产模式（硬打包）

set -e

# 获取项目根目录（脚本所在目录的上一级）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$PROJECT_ROOT/src-tauri/gen/android"

# 颜色输出
RED='\033[0;31m'
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

error() {
    echo -e "${RED}❌ $1${NC}"
}

# 验证参数
BUILD_MODE="${1:-dev}"
if [[ ! "$BUILD_MODE" =~ ^(dev|release)$ ]]; then
    error "无效的构建模式: $BUILD_MODE"
    echo "用法: ./build-android.sh [dev|release]"
    exit 1
fi

echo ""
echo "========================================="
if [ "$BUILD_MODE" = "dev" ]; then
    echo "   🔧 Android 开发模式（热更新）"
else
    echo "   📦 Android 生产模式（硬打包）"
fi
echo "========================================="
echo ""

# ============================================================================
# 通用步骤
# ============================================================================

# 1. 检查设备
info "检查设备连接..."
if ! adb devices | grep -q "device$"; then
    error "未检测到设备"
    exit 1
fi
DEVICE=$(adb devices | grep "device$" | awk '{print $1}' | head -1)
success "设备: $DEVICE"

# 2. 切换 MainActivity 模板
MAIN_ACTIVITY="$ANDROID_DIR/app/src/main/java/com/express/app/MainActivity.kt"
MAIN_ACTIVITY_TEMPLATE="$SCRIPT_DIR/templates/MainActivity/$BUILD_MODE.kt"
MAIN_ACTIVITY_BACKUP="$MAIN_ACTIVITY.bak"

info "配置 $BUILD_MODE 模式..."
if [ -f "$MAIN_ACTIVITY_TEMPLATE" ]; then
    cp "$MAIN_ACTIVITY" "$MAIN_ACTIVITY_BACKUP"
    cp "$MAIN_ACTIVITY_TEMPLATE" "$MAIN_ACTIVITY"
    success "已切换到 $BUILD_MODE 模式"
else
    error "找不到 $BUILD_MODE 版本的 MainActivity"
    exit 1
fi

# 设置脚本退出时恢复
cleanup_main_activity() {
    if [ -f "$MAIN_ACTIVITY_BACKUP" ]; then
        mv "$MAIN_ACTIVITY_BACKUP" "$MAIN_ACTIVITY"
        info "已恢复原始 MainActivity"
    fi
}
trap cleanup_main_activity EXIT

# 3. 清理 Gradle 和 Rust 缓存
info "清理 Gradle 和 Rust 缓存..."

# 强制结束所有 Gradle 进程
pkill -9 -f gradle 2>/dev/null || true
pkill -9 -f "GradleDaemon" 2>/dev/null || true
pkill -9 -f "org.gradle.launcher.daemon.bootstrap.GradleDaemon" 2>/dev/null || true

# 等待进程完全结束
sleep 1

# 清理项目级 Gradle 缓存
rm -rf "$ANDROID_DIR/.gradle" 2>/dev/null || true
rm -rf "$ANDROID_DIR/app/build" 2>/dev/null || true
rm -rf "$ANDROID_DIR/build" 2>/dev/null || true

# 清理全局 Gradle 缓存中的锁文件
rm -rf ~/.gradle/caches/*/fileHashes 2>/dev/null || true
rm -rf ~/.gradle/caches/*/executionHistory 2>/dev/null || true
rm -rf ~/.gradle/caches/transforms-* 2>/dev/null || true
rm -rf ~/.gradle/daemon 2>/dev/null || true

# 清理 Rust 目标文件
rm -rf "$PROJECT_ROOT/src-tauri/target/aarch64-linux-android" 2>/dev/null || true
rm -rf "$PROJECT_ROOT/src-tauri/target/armv7-linux-androideabi" 2>/dev/null || true
rm -rf "$PROJECT_ROOT/src-tauri/target/i686-linux-android" 2>/dev/null || true
rm -rf "$PROJECT_ROOT/src-tauri/target/x86_64-linux-android" 2>/dev/null || true

success "缓存已清理"

# ============================================================================
# 开发模式特定步骤
# ============================================================================

if [ "$BUILD_MODE" = "dev" ]; then
    # 4a. 检查开发服务器
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    DEV_URL="http://${LOCAL_IP}:1420"
    
    info "开发服务器: $DEV_URL"
    if ! curl -s "$DEV_URL" > /dev/null 2>&1; then
        error "❌ 无法连接到开发服务器: $DEV_URL"
        error "❌ 请先运行: pnpm dev"
        exit 1
    else
        success "✅ 已连接到开发服务器"
    fi
    
    # 4b. 构建 APK（开发模式）
    info "构建 APK..."
    cd "$ANDROID_DIR"
    
    # 先进行前端构建
    info "前端资源已准备"
    
    # 使用 Gradle 构建，添加重试逻辑处理 npm 错误
    MAX_ATTEMPTS=3
    ATTEMPT=1
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        info "构建尝试 $ATTEMPT/$MAX_ATTEMPTS..."
        if ./gradlew clean assembleUniversalDebug --no-daemon --stacktrace; then
            success "构建成功"
            break
        fi
        
        if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
            warn "构建失败，30秒后重试..."
            sleep 30
            # 清理缓存
            pkill -9 -f gradle 2>/dev/null || true
            rm -rf ~/.gradle/daemon 2>/dev/null || true
        fi
        ATTEMPT=$((ATTEMPT + 1))
    done
    
    if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
        error "构建多次失败，放弃"
        exit 1
    fi
    
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/universal/debug/app-universal-debug.apk"
    
    # 5a. 卸载旧版本
    info "卸载旧版本..."
    adb uninstall com.express.app 2>/dev/null || true
    
    # 6a. 安装到设备
    info "安装到设备..."
    adb install -r "$APK_PATH"
    success "安装完成"
    
    # 7a. 启动应用
    info "启动应用..."
    adb shell am start -n com.express.app/.MainActivity
    success "应用已启动"
    
    echo ""
    echo "========================================="
    success "开发模式已启动！"
    echo "========================================="
    echo ""
    echo "🔥 开发服务器: $DEV_URL"
    echo "📱 设备: $DEVICE"
    echo "🔄 热重载: 已启用（修改代码后自动刷新）"
    echo "💡 提示: 修改 Vue 代码后，页面会自动更新"
    echo ""

# ============================================================================
# 生产模式特定步骤
# ============================================================================

else
    # 4b. 检查 apksigner
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
    
    # 5b. 移除 devUrl（硬打包模式）
    info "配置硬打包模式..."
    TAURI_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json"
    BACKUP_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json.backup"
    
    cp "$TAURI_CONF" "$BACKUP_CONF"
    sed -i '' '/"devUrl":/d' "$TAURI_CONF"
    
    # 设置脚本退出时恢复 tauri.conf.json
    cleanup_tauri_conf() {
        if [ -f "$BACKUP_CONF" ]; then
            mv "$BACKUP_CONF" "$TAURI_CONF"
            info "已恢复 tauri.conf.json"
        fi
    }
    trap cleanup_tauri_conf EXIT
    
    success "已移除 devUrl（强制使用本地资源）"
    
    # 6b. 使用 Tauri CLI 构建
    info "构建 APK..."
    cd "$PROJECT_ROOT"
    npx @tauri-apps/cli android build --apk true
    
    # 7b. 签名 APK
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
    
    # 8b. 卸载旧版本
    info "卸载旧版本..."
    adb uninstall com.express.app 2>/dev/null || true
    
    # 9b. 安装
    info "安装到手机..."
    adb install -r "$SIGNED_APK"
    success "安装完成"
    
    # 10b. 启动
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
fi

