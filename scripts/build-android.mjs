#!/usr/bin/env node
/**
 * 跨平台 Android 构建脚本
 * 用法：node scripts/build-android.mjs dev     - 开发模式（热更新）
 *      node scripts/build-android.mjs release  - 生产模式（硬打包）
 */

import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, copyFileSync, rmSync, unlinkSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";

// ESM 下获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");
const ANDROID_DIR = join(PROJECT_ROOT, "src-tauri", "gen", "android");

const isWindows = platform() === "win32";

// ============================================================================
// 工具函数
// ============================================================================

// 颜色输出
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
};

const info = (msg) => console.log(colors.blue(`ℹ️  ${msg}`));
const success = (msg) => console.log(colors.green(`✅ ${msg}`));
const warn = (msg) => console.log(colors.yellow(`⚠️  ${msg}`));
const error = (msg) => console.log(colors.red(`❌ ${msg}`));

// 执行命令并返回输出
function exec(cmd, options = {}) {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      stdio: options.silent ? "pipe" : "inherit",
      cwd: options.cwd || PROJECT_ROOT,
      shell: true,
      ...options,
    });
  } catch (e) {
    if (options.ignoreError) return "";
    throw e;
  }
}

// 静默执行命令
function execSilent(cmd, options = {}) {
  return exec(cmd, { ...options, silent: true, stdio: "pipe" });
}

// 加载 .env 文件
function loadEnv() {
  const envPath = join(PROJECT_ROOT, ".env");
  const env = {};
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    }
  }
  return env;
}

// 自动检测并设置 Android SDK 路径（Windows）
function setupAndroidSDK() {
  let sdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

  // 如果已经设置，确保 platform-tools 在 PATH 中
  if (sdkPath) {
    info(`Android SDK 已配置: ${sdkPath}`);
    const platformTools = join(sdkPath, "platform-tools");
    // 检查 PATH 中是否已包含 platform-tools
    if (!process.env.PATH.includes(platformTools)) {
      process.env.PATH = `${platformTools}${isWindows ? ";" : ":"}${process.env.PATH}`;
      info(`已添加 platform-tools 到 PATH`);
    }
    return;
  }

  // Windows 常见 Android SDK 位置
  const commonPaths = [
    "E:/SDK",
    "D:/Program Files/Android/SDK",
    "C:/Users/" + (process.env.USERNAME || "") + "/AppData/Local/Android/Sdk",
    join(process.env.LOCALAPPDATA || "", "Android", "Sdk"),
    join(process.env.USERPROFILE || "", "AppData", "Local", "Android", "Sdk"),
  ];

  for (const sdkPath of commonPaths) {
    if (existsSync(sdkPath)) {
      const platformTools = join(sdkPath, "platform-tools");
      const adbPath = join(platformTools, isWindows ? "adb.exe" : "adb");

      if (existsSync(adbPath)) {
        info(`自动检测到 Android SDK: ${sdkPath}`);
        process.env.ANDROID_HOME = sdkPath;
        process.env.ANDROID_SDK_ROOT = sdkPath;

        // 添加 platform-tools 到 PATH
        process.env.PATH = `${platformTools}${isWindows ? ";" : ":"}${process.env.PATH}`;
        return;
      }
    }
  }

  // 如果没有找到，显示警告
  warn("未找到 Android SDK，请设置 ANDROID_HOME 环境变量");
}

// 递归删除目录（跨平台）
function rmDir(dirPath) {
  if (existsSync(dirPath)) {
    try {
      rmSync(dirPath, { recursive: true, force: true });
    } catch (e) {
      // Windows 下可能需要重试
      if (isWindows) {
        exec(`rmdir /s /q "${dirPath}"`, { ignoreError: true, silent: true });
      }
    }
  }
}

// 终止 Gradle 进程（跨平台）
function killGradleProcesses() {
  if (isWindows) {
    // Windows: 使用 taskkill
    exec('taskkill /F /IM java.exe /FI "WINDOWTITLE eq *gradle*" 2>nul', { ignoreError: true, silent: true });
    exec("taskkill /F /IM gradle.exe 2>nul", { ignoreError: true, silent: true });
  } else {
    // Unix: 使用 pkill
    exec("pkill -9 -f gradle 2>/dev/null", { ignoreError: true, silent: true });
    exec("pkill -9 -f GradleDaemon 2>/dev/null", { ignoreError: true, silent: true });
  }
}

// 检查 URL 是否可访问
async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

// 查找 apksigner（跨平台）
function findApksigner() {
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome) {
    error("未设置 ANDROID_HOME 或 ANDROID_SDK_ROOT 环境变量");
    process.exit(1);
  }

  const buildToolsDir = join(androidHome, "build-tools");
  if (!existsSync(buildToolsDir)) {
    error("未找到 build-tools 目录");
    process.exit(1);
  }

  // 读取目录，找到最新版本
  const versions = readdirSync(buildToolsDir)
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
    .sort((a, b) => {
      const [a1, a2, a3] = a.split(".").map(Number);
      const [b1, b2, b3] = b.split(".").map(Number);
      return b1 - a1 || b2 - a2 || b3 - a3;
    });

  if (versions.length === 0) {
    error("未找到任何 build-tools 版本");
    process.exit(1);
  }

  const apksignerName = isWindows ? "apksigner.bat" : "apksigner";
  const apksignerPath = join(buildToolsDir, versions[0], apksignerName);

  if (!existsSync(apksignerPath)) {
    error(`未找到 apksigner: ${apksignerPath}`);
    process.exit(1);
  }

  return apksignerPath;
}

// 获取文件大小
function getFileSize(filePath) {
  const stats = statSync(filePath);
  const bytes = stats.size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================================================
// 主流程
// ============================================================================

async function main() {
  // 自动检测并设置 Android SDK（必须在最开始）
  setupAndroidSDK();

  const args = process.argv.slice(2);
  const buildMode = args[0] || "dev";

  if (!["dev", "release"].includes(buildMode)) {
    error(`无效的构建模式: ${buildMode}`);
    console.log("用法: node scripts/build-android.mjs [dev|release]");
    process.exit(1);
  }

  console.log("");
  console.log("=========================================");
  if (buildMode === "dev") {
    console.log("   🔧 Android 开发模式（热更新）");
  } else {
    console.log("   📦 Android 生产模式（硬打包）");
  }
  console.log("=========================================");
  console.log("");

  // 加载环境变量
  const env = loadEnv();
  const DEV_SERVER_HOST = env.DEV_SERVER_HOST || "192.168.3.81";
  const DEV_SERVER_PORT = env.DEV_SERVER_PORT || "1234";
  const DEV_URL = `http://${DEV_SERVER_HOST}:${DEV_SERVER_PORT}`;

  // ========================================
  // 1. 检查设备连接
  // ========================================
  info("检查设备连接...");
  let deviceOutput;
  try {
    deviceOutput = execSilent("adb devices");
  } catch {
    error("无法执行 adb 命令，请确保 Android SDK 已正确配置");
    process.exit(1);
  }

  const devices = deviceOutput
    .split("\n")
    .filter((line) => line.includes("\tdevice"))
    .map((line) => line.split("\t")[0]);

  if (devices.length === 0) {
    error("未检测到设备");
    process.exit(1);
  }
  const device = devices[0];
  success(`设备: ${device}`);

  // ========================================
  // 2. 切换 MainActivity 模板
  // ========================================
  const mainActivityPath = join(ANDROID_DIR, "app", "src", "main", "java", "com", "tvvb", "app", "MainActivity.kt");
  const templatePath = join(__dirname, "templates", "MainActivity", `${buildMode}.kt`);
  const backupPath = `${mainActivityPath}.bak`;

  info(`配置 ${buildMode} 模式...`);

  if (!existsSync(templatePath)) {
    error(`找不到 ${buildMode} 版本的 MainActivity 模板`);
    process.exit(1);
  }

  // 备份原文件
  if (existsSync(mainActivityPath)) {
    copyFileSync(mainActivityPath, backupPath);
  }
  // 复制模板
  copyFileSync(templatePath, mainActivityPath);
  success(`已切换到 ${buildMode} 模式`);

  // 设置退出时恢复
  const cleanup = () => {
    if (existsSync(backupPath)) {
      try {
        copyFileSync(backupPath, mainActivityPath);
        unlinkSync(backupPath);
        info("已恢复原始 MainActivity");
      } catch {
        // 忽略清理错误
      }
    }
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(1);
  });

  // ========================================
  // 3. 清理缓存
  // ========================================
  info("清理 Gradle 和 Rust 缓存...");

  // 终止 Gradle 进程
  killGradleProcesses();

  // 等待进程结束
  await new Promise((r) => setTimeout(r, 1000));

  // 清理项目级缓存
  rmDir(join(ANDROID_DIR, ".gradle"));
  rmDir(join(ANDROID_DIR, "app", "build"));
  rmDir(join(ANDROID_DIR, "build"));

  // 清理全局 Gradle 缓存
  const gradleHome = isWindows ? join(process.env.USERPROFILE || "", ".gradle") : join(process.env.HOME || "", ".gradle");

  rmDir(join(gradleHome, "daemon"));

  // 清理 Rust Android 目标
  const rustTargets = ["aarch64-linux-android", "armv7-linux-androideabi", "i686-linux-android", "x86_64-linux-android"];
  for (const target of rustTargets) {
    rmDir(join(PROJECT_ROOT, "src-tauri", "target", target));
  }

  success("缓存已清理");

  // ========================================
  // 开发模式
  // ========================================
  if (buildMode === "dev") {
    // 检查开发服务器
    info(`开发服务器: ${DEV_URL}`);
    const serverOk = await checkUrl(DEV_URL);
    if (!serverOk) {
      error(`无法连接到开发服务器: ${DEV_URL}`);
      error("请先运行: pnpm dev");
      process.exit(1);
    }
    success("已连接到开发服务器");

    // 更新 tauri.conf.json 中的 devUrl
    const tauriConfPath = join(PROJECT_ROOT, "src-tauri", "tauri.conf.json");
    if (existsSync(tauriConfPath)) {
      info(`更新 devUrl: ${DEV_URL}`);
      let content = readFileSync(tauriConfPath, "utf-8");
      content = content.replace(/"devUrl":\s*"[^"]*"/, `"devUrl": "${DEV_URL}"`);
      writeFileSync(tauriConfPath, content);
      success("devUrl 已更新");
    }

    // 构建 APK
    info("构建 APK...");
    const maxAttempts = 3;
    let buildSuccess = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      info(`构建尝试 ${attempt}/${maxAttempts}...`);
      try {
        exec("npx @tauri-apps/cli android build --debug", { cwd: PROJECT_ROOT });
        buildSuccess = true;
        success("构建成功");
        break;
      } catch {
        if (attempt < maxAttempts) {
          warn("构建失败，30秒后重试...");
          await new Promise((r) => setTimeout(r, 30000));
          killGradleProcesses();
          rmDir(join(gradleHome, "daemon"));
        }
      }
    }

    if (!buildSuccess) {
      error("构建多次失败，放弃");
      process.exit(1);
    }

    // 查找 APK
    let apkPath = join(ANDROID_DIR, "app", "build", "outputs", "apk", "arm64", "debug", "app-arm64-debug.apk");
    if (!existsSync(apkPath)) {
      apkPath = join(ANDROID_DIR, "app", "build", "outputs", "apk", "universal", "debug", "app-universal-debug.apk");
    }
    if (!existsSync(apkPath)) {
      error("未找到 APK 文件");
      process.exit(1);
    }

    // 卸载旧版本
    info("卸载旧版本...");
    exec("adb uninstall com.tvvb.app", { ignoreError: true, silent: true });

    // 安装
    info("安装到设备...");
    exec(`adb install -r "${apkPath}"`);
    success("安装完成");

    // 启动应用
    info("启动应用...");
    exec("adb shell am start -n com.tvvb.app/.MainActivity");
    success("应用已启动");

    console.log("");
    console.log("=========================================");
    success("开发模式已启动！");
    console.log("=========================================");
    console.log("");
    console.log(`🔥 开发服务器: ${DEV_URL}`);
    console.log(`📱 设备: ${device}`);
    console.log("🔄 热重载: 已启用（修改代码后自动刷新）");
    console.log("💡 提示: 修改 Vue 代码后，页面会自动更新");
    console.log("");
  }

  // ========================================
  // 生产模式
  // ========================================
  else {
    // 查找 apksigner
    const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
    if (!androidHome) {
      error("未设置 ANDROID_HOME 或 ANDROID_SDK_ROOT 环境变量");
      process.exit(1);
    }

    const buildToolsDir = join(androidHome, "build-tools");
    const versions = readdirSync(buildToolsDir)
      .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
      .sort((a, b) => {
        const [a1, a2, a3] = a.split(".").map(Number);
        const [b1, b2, b3] = b.split(".").map(Number);
        return b1 - a1 || b2 - a2 || b3 - a3;
      });

    const apksignerName = isWindows ? "apksigner.bat" : "apksigner";
    const apksigner = join(buildToolsDir, versions[0], apksignerName);
    info(`使用 apksigner: ${apksigner}`);

    // 构建
    info("构建 APK...");
    exec("npx @tauri-apps/cli android build", { cwd: PROJECT_ROOT });

    // 查找 APK
    let apkPath = join(ANDROID_DIR, "app", "build", "outputs", "apk", "arm64", "release", "app-arm64-release-unsigned.apk");
    if (!existsSync(apkPath)) {
      apkPath = join(ANDROID_DIR, "app", "build", "outputs", "apk", "universal", "release", "app-universal-release-unsigned.apk");
    }
    if (!existsSync(apkPath)) {
      error("APK 文件不存在");
      process.exit(1);
    }
    success(`APK 构建完成: ${apkPath}`);

    // 签名
    info("签名 APK...");
    const keystorePath = isWindows ? join(process.env.USERPROFILE || "", ".android", "debug.keystore") : join(process.env.HOME || "", ".android", "debug.keystore");

    try {
      exec(`"${apksigner}" sign --ks "${keystorePath}" --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android "${apkPath}"`);
      success("APK 签名成功");
    } catch {
      error("APK 签名失败");
      process.exit(1);
    }

    // 卸载旧版本
    info("卸载旧版本...");
    exec("adb uninstall com.tvvb.app", { ignoreError: true, silent: true });
    await new Promise((r) => setTimeout(r, 1000));

    // 安装
    info("安装到手机...");
    exec(`adb install -r "${apkPath}"`);
    success("安装完成");

    // 启动
    info("启动应用...");
    exec("adb shell am start -n com.tvvb.app/.MainActivity");
    success("应用已启动");

    // 获取文件大小
    const stats = statSync(apkPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

    console.log("");
    console.log("=========================================");
    success("生产模式构建完成！");
    console.log("=========================================");
    console.log("");
    console.log(`📦 APK: ${apkPath}`);
    console.log(`📱 设备: ${device}`);
    console.log(`💾 大小: ${sizeMB} MB`);
    console.log("💡 提示: 此版本包含所有前端资源，无需开发服务器");
    console.log("");
  }
}

main().catch((e) => {
  error(e.message);
  process.exit(1);
});
