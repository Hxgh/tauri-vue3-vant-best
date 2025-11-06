# 🔧 构建脚本说明

## 统一构建脚本

### 用法

```bash
./build-android.sh [dev|release]
```

### 参数

| 参数 | 说明 |
|------|------|
| `dev` | 开发模式 - 加载开发服务器，支持热更新 |
| `release` | 生产模式 - 硬打包资源，无需服务器 |

### 示例

```bash
# 开发模式（推荐日常开发）
./build-android.sh dev

# 生产模式（发布前测试）
./build-android.sh release
```

## 工作流程

### 开发模式流程

1. ✅ 检查开发服务器连接
2. ✅ 切换到 dev 版本的 MainActivity
3. ✅ 清理 Gradle 和 Rust 缓存
4. ✅ 构建 APK（连接 `http://YOUR_IP:1420`）
5. ✅ 卸载旧版本
6. ✅ 安装新版本
7. ✅ 启动应用
8. ✅ 恢复原始 MainActivity

**特点**：APK 启动时加载开发服务器代码，修改前端代码后自动刷新

### 生产模式流程

1. ✅ 切换到 release 版本的 MainActivity
2. ✅ 清理 Gradle 和 Rust 缓存
3. ✅ 移除 devUrl 配置
4. ✅ 构建 APK（包含所有资源）
5. ✅ 签名 APK
6. ✅ 卸载旧版本
7. ✅ 安装新版本
8. ✅ 启动应用
9. ✅ 恢复配置和 MainActivity

**特点**：APK 包含所有资源，不依赖开发服务器

## 构建模板

### `templates/MainActivity/`

两个 MainActivity 模板文件，脚本会根据模式自动选择：

- **`dev.kt`** - 开发模式
  - 延迟加载 `http://192.168.3.81:1420`
  - 允许混合内容（http + https）
  - 支持热重载

- **`release.kt`** - 生产模式
  - 加载硬打包资源（默认行为）
  - 不加载外部服务器
  - 最小化依赖

## 常见用法

### 日常开发

```bash
# 启动开发服务器（终端 1）
pnpm dev

# 打包并安装（终端 2）
./scripts/build-android.sh dev

# 修改代码后，手机会自动刷新（无需重新打包）
```

### 发布前测试

```bash
# 生产模式构建
./scripts/build-android.sh release

# 在手机上测试生产版本的行为
```

### 故障排除

```bash
# 检查环境
./scripts/android-check.sh

# 清理构建（手动清理）
rm -rf src-tauri/gen/android/app/build
rm -rf src-tauri/target/aarch64-linux-android
```

## 技术细节

### 动态 MainActivity 切换

脚本在构建前后自动切换 MainActivity 版本：

```bash
# 构建前
cp templates/MainActivity/dev.kt → src-tauri/gen/android/.../MainActivity.kt

# 构建后
恢复原始版本
```

这样可以：
- ✅ 避免代码库中混合两个版本
- ✅ 确保开发版本使用最新模板
- ✅ 防止意外提交 dev 版本到 git

### 智能缓存清理

脚本会清理：
- Gradle 锁文件和缓存
- Rust 编译产物（强制重新编译）
- 进程锁（防止"Blocking waiting for file lock"）

这确保：
- ✅ 每次构建都是干净的
- ✅ 避免文件锁冲突
- ✅ 减少诡异的构建错误

## 环境检查脚本

### 用法

```bash
./scripts/android-check.sh
```

### 检查项

1. Java 环境
2. Android SDK/NDK
3. ADB 工具
4. 手机连接状态
5. Rust 编译目标
6. 开发服务器

## 扩展

如果需要支持更多构建模式（如 staging、testing），可以：

1. 创建对应的模板文件：
   ```
   templates/MainActivity/staging.kt
   templates/MainActivity/testing.kt
   ```

2. 更新脚本参数处理

3. 添加对应的构建逻辑

---

**脚本版本**: v2.0  
**最后更新**: 2025-11-06
