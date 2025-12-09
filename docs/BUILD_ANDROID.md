# Android 构建指南

## 快速构建

```bash
# 开发模式（连接 dev server）
npm run build:android:dev

# 生产模式（打包资源）
npm run build:android:prod
```

## 环境要求

```bash
# JDK 17+, Android SDK, NDK 29
# Rust Android 目标
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

## 调试

```bash
# 查看日志
adb logcat -c && adb logcat | grep -E "(MainActivity|Theme)"

# 卸载/重装
adb uninstall com.tvvb.app
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

## 常见问题

**Gradle 锁冲突：**
```bash
cd src-tauri/gen/android && ./gradlew --stop && ./gradlew clean
```

**设备未连接：**
```bash
adb devices  # 确保手机开启 USB 调试
```

## 重要文件

- `scripts/build-android.sh` - 构建脚本
- `scripts/templates/MainActivity/*.kt` - dev/release 模板
- `src-tauri/.cargo/config.toml` - NDK 配置
