#!/usr/bin/env node
/**
 * 跨平台 Android 构建脚本 (Core 模块)
 *
 * 用法：node src/core/scripts/build-android.mjs dev     - 开发模式（热更新）
 *      node src/core/scripts/build-android.mjs release  - 生产模式（硬打包）
 *
 * 配置来源：
 * - 包名: 从 src-tauri/tauri.conf.json 的 identifier 读取
 * - 开发服务器: 从 .env 的 DEV_SERVER_HOST/DEV_SERVER_PORT 读取
 *
 * @module core/scripts/build-android
 * @version 1.0.0
 */

import { execSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { platform } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ESM 下获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 路径配置（相对于 src/core/scripts/）
const CORE_DIR = resolve(__dirname, '..');
const PROJECT_ROOT = resolve(CORE_DIR, '..', '..');
const ANDROID_DIR = join(PROJECT_ROOT, 'src-tauri', 'gen', 'android');
const TEMPLATES_DIR = join(__dirname, 'templates', 'MainActivity');

const isWindows = platform() === 'win32';

// ============================================================================
// 配置读取
// ============================================================================

/**
 * 从 tauri.conf.json 读取项目配置
 */
function loadTauriConfig() {
  const confPath = join(PROJECT_ROOT, 'src-tauri', 'tauri.conf.json');
  if (!existsSync(confPath)) {
    error('未找到 src-tauri/tauri.conf.json');
    process.exit(1);
  }

  try {
    const content = readFileSync(confPath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    error(`解析 tauri.conf.json 失败: ${e.message}`);
    process.exit(1);
  }
}

/**
 * 加载 .env 文件
 */
function loadEnv() {
  const envPath = join(PROJECT_ROOT, '.env');
  const env = {};
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  }
  return env;
}

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
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || PROJECT_ROOT,
      shell: true,
      ...options,
    });
  } catch (e) {
    if (options.ignoreError) return '';
    throw e;
  }
}

// 静默执行命令
function execSilent(cmd, options = {}) {
  return exec(cmd, { ...options, silent: true, stdio: 'pipe' });
}

// 自动检测并设置 Android SDK 路径
function setupAndroidSDK() {
  const sdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

  // 如果已经设置，确保 platform-tools 在 PATH 中
  if (sdkPath) {
    info(`Android SDK 已配置: ${sdkPath}`);
    const platformTools = join(sdkPath, 'platform-tools');
    if (!process.env.PATH.includes(platformTools)) {
      process.env.PATH = `${platformTools}${isWindows ? ';' : ':'}${process.env.PATH}`;
      info(`已添加 platform-tools 到 PATH`);
    }
    return;
  }

  // 常见 Android SDK 位置
  const commonPaths = isWindows
    ? [
        'E:/SDK',
        'D:/SDK',
        'D:/Program Files/Android/SDK',
        'C:/Users/' +
          (process.env.USERNAME || '') +
          '/AppData/Local/Android/Sdk',
        join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk'),
        join(
          process.env.USERPROFILE || '',
          'AppData',
          'Local',
          'Android',
          'Sdk',
        ),
      ]
    : [
        join(process.env.HOME || '', 'Android', 'Sdk'),
        join(process.env.HOME || '', 'Library', 'Android', 'sdk'),
        '/usr/local/android-sdk',
      ];

  for (const path of commonPaths) {
    if (existsSync(path)) {
      const platformTools = join(path, 'platform-tools');
      const adbPath = join(platformTools, isWindows ? 'adb.exe' : 'adb');

      if (existsSync(adbPath)) {
        info(`自动检测到 Android SDK: ${path}`);
        process.env.ANDROID_HOME = path;
        process.env.ANDROID_SDK_ROOT = path;
        process.env.PATH = `${platformTools}${isWindows ? ';' : ':'}${process.env.PATH}`;
        return;
      }
    }
  }

  warn('未找到 Android SDK，请设置 ANDROID_HOME 环境变量');
}

// 递归删除目录（跨平台）
function rmDir(dirPath) {
  if (existsSync(dirPath)) {
    try {
      rmSync(dirPath, { recursive: true, force: true });
    } catch (e) {
      if (isWindows) {
        exec(`rmdir /s /q "${dirPath}"`, { ignoreError: true, silent: true });
      }
    }
  }
}

// 终止 Gradle 进程（跨平台）
function killGradleProcesses() {
  if (isWindows) {
    exec('taskkill /F /IM java.exe /FI "WINDOWTITLE eq *gradle*" 2>nul', {
      ignoreError: true,
      silent: true,
    });
    exec('taskkill /F /IM gradle.exe 2>nul', {
      ignoreError: true,
      silent: true,
    });
  } else {
    exec('pkill -9 -f gradle 2>/dev/null', { ignoreError: true, silent: true });
    exec('pkill -9 -f GradleDaemon 2>/dev/null', {
      ignoreError: true,
      silent: true,
    });
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

// 查找 apksigner
function findApksigner() {
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome) {
    error('未设置 ANDROID_HOME 或 ANDROID_SDK_ROOT 环境变量');
    process.exit(1);
  }

  const buildToolsDir = join(androidHome, 'build-tools');
  if (!existsSync(buildToolsDir)) {
    error('未找到 build-tools 目录');
    process.exit(1);
  }

  const versions = readdirSync(buildToolsDir)
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
    .sort((a, b) => {
      const [a1, a2, a3] = a.split('.').map(Number);
      const [b1, b2, b3] = b.split('.').map(Number);
      return b1 - a1 || b2 - a2 || b3 - a3;
    });

  if (versions.length === 0) {
    error('未找到任何 build-tools 版本');
    process.exit(1);
  }

  const apksignerName = isWindows ? 'apksigner.bat' : 'apksigner';
  return join(buildToolsDir, versions[0], apksignerName);
}

/**
 * 准备 MainActivity 模板
 * @param {string} mode - 'dev' 或 'release'
 * @param {object} config - 配置对象
 */
function prepareMainActivity(mode, config) {
  const templatePath = join(TEMPLATES_DIR, `${mode}.kt`);

  if (!existsSync(templatePath)) {
    error(`找不到 ${mode} 版本的 MainActivity 模板: ${templatePath}`);
    process.exit(1);
  }

  // 读取模板
  let content = readFileSync(templatePath, 'utf-8');

  // 替换占位符
  content = content.replace(/\{\{PACKAGE_NAME\}\}/g, config.packageName);
  content = content.replace(/\{\{DEV_URL\}\}/g, config.devUrl);

  // 计算目标路径
  const packagePath = config.packageName.replace(/\./g, '/');
  const mainActivityPath = join(
    ANDROID_DIR,
    'app',
    'src',
    'main',
    'java',
    packagePath,
    'MainActivity.kt',
  );

  return { content, mainActivityPath, templatePath };
}

// ============================================================================
// 主流程
// ============================================================================

async function main() {
  // 自动检测 Android SDK
  setupAndroidSDK();

  const args = process.argv.slice(2);
  const buildMode = args[0] || 'dev';

  if (!['dev', 'release', 'release-dev'].includes(buildMode)) {
    error(`无效的构建模式: ${buildMode}`);
    console.log('用法: node src/core/scripts/build-android.mjs [dev|release|release-dev]');
    console.log('');
    console.log('  dev         - 开发模式（热更新，连接本地开发服务器）');
    console.log('  release     - 生产模式（硬打包，使用生产 API）');
    console.log('  release-dev - 测试模式（硬打包，使用测试环境 API）');
    process.exit(1);
  }

  // 判断是否为硬打包模式
  const isReleaseMode = buildMode === 'release' || buildMode === 'release-dev';
  // 判断使用哪个环境的 API
  const useDevApi = buildMode === 'release-dev';

  // 加载配置
  const tauriConfig = loadTauriConfig();
  const env = loadEnv();

  const config = {
    packageName: tauriConfig.identifier || 'com.example.app',
    productName: tauriConfig.productName || 'App',
    devUrl: `http://${env.DEV_SERVER_HOST || '192.168.1.1'}:${env.DEV_SERVER_PORT || '1234'}`,
  };

  console.log('');
  console.log('=========================================');
  if (buildMode === 'dev') {
    console.log('   🔧 Android 开发模式（热更新）');
  } else if (buildMode === 'release-dev') {
    console.log('   🧪 Android 测试模式（硬打包 + 测试API）');
  } else {
    console.log('   📦 Android 生产模式（硬打包）');
  }
  console.log('=========================================');
  console.log('');
  info(`包名: ${config.packageName}`);
  info(`应用名: ${config.productName}`);
  if (useDevApi) {
    info(`API: 测试环境 (https://app.lbuy.top/dev/api)`);
  } else if (isReleaseMode) {
    info(`API: 生产环境 (https://app.lbuy.top/api)`);
  }

  // 检查设备连接
  info('检查设备连接...');
  let deviceOutput;
  let hasDevice = false;
  let device = '';
  try {
    deviceOutput = execSilent('adb devices');
    const devices = deviceOutput
      .split('\n')
      .filter((line) => line.includes('\tdevice'))
      .map((line) => line.split('\t')[0]);

    if (devices.length > 0) {
      hasDevice = true;
      device = devices[0];
      success(`设备: ${device}`);
    } else {
      warn('未检测到设备，将只构建 APK（跳过安装）');
    }
  } catch {
    warn('无法执行 adb 命令，将只构建 APK（跳过安装）');
  }

  // 准备 MainActivity（release 和 release-dev 都使用 release 模板）
  const mainActivityMode = isReleaseMode ? 'release' : 'dev';
  const { content: mainActivityContent, mainActivityPath } =
    prepareMainActivity(mainActivityMode, config);
  const backupPath = `${mainActivityPath}.bak`;

  info(`配置 ${buildMode} 模式...`);

  // 备份原文件
  if (existsSync(mainActivityPath)) {
    copyFileSync(mainActivityPath, backupPath);
  }
  // 写入处理后的模板
  writeFileSync(mainActivityPath, mainActivityContent);
  success(`已切换到 ${buildMode} 模式`);

  // 设置退出时恢复
  const cleanup = () => {
    if (existsSync(backupPath)) {
      try {
        copyFileSync(backupPath, mainActivityPath);
        unlinkSync(backupPath);
        info('已恢复原始 MainActivity');
      } catch {
        // 忽略清理错误
      }
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(1);
  });

  // 清理缓存
  info('清理 Gradle 和 Rust 缓存...');
  killGradleProcesses();
  await new Promise((r) => setTimeout(r, 1000));

  rmDir(join(ANDROID_DIR, '.gradle'));
  rmDir(join(ANDROID_DIR, 'app', 'build'));
  rmDir(join(ANDROID_DIR, 'build'));

  const gradleHome = isWindows
    ? join(process.env.USERPROFILE || '', '.gradle')
    : join(process.env.HOME || '', '.gradle');
  rmDir(join(gradleHome, 'daemon'));

  const rustTargets = [
    'aarch64-linux-android',
    'armv7-linux-androideabi',
    'i686-linux-android',
    'x86_64-linux-android',
  ];
  for (const target of rustTargets) {
    rmDir(join(PROJECT_ROOT, 'src-tauri', 'target', target));
  }

  success('缓存已清理');

  // 开发模式
  if (!isReleaseMode) {
    info(`开发服务器: ${config.devUrl}`);
    const serverOk = await checkUrl(config.devUrl);
    if (!serverOk) {
      error(`无法连接到开发服务器: ${config.devUrl}`);
      error('请先运行: pnpm dev');
      process.exit(1);
    }
    success('已连接到开发服务器');

    // 更新 tauri.conf.json 中的 devUrl
    const tauriConfPath = join(PROJECT_ROOT, 'src-tauri', 'tauri.conf.json');
    if (existsSync(tauriConfPath)) {
      info(`更新 devUrl: ${config.devUrl}`);
      let confContent = readFileSync(tauriConfPath, 'utf-8');
      confContent = confContent.replace(
        /"devUrl":\s*"[^"]*"/,
        `"devUrl": "${config.devUrl}"`,
      );
      writeFileSync(tauriConfPath, confContent);
      success('devUrl 已更新');
    }

    // 构建 APK
    info('构建 APK...');
    const maxAttempts = 3;
    let buildSuccess = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      info(`构建尝试 ${attempt}/${maxAttempts}...`);
      try {
        exec('npx @tauri-apps/cli android build --debug', {
          cwd: PROJECT_ROOT,
        });
        buildSuccess = true;
        success('构建成功');
        break;
      } catch {
        if (attempt < maxAttempts) {
          warn('构建失败，30秒后重试...');
          await new Promise((r) => setTimeout(r, 30000));
          killGradleProcesses();
          rmDir(join(gradleHome, 'daemon'));
        }
      }
    }

    if (!buildSuccess) {
      error('构建多次失败，放弃');
      process.exit(1);
    }

    // 查找 APK
    let apkPath = join(
      ANDROID_DIR,
      'app',
      'build',
      'outputs',
      'apk',
      'arm64',
      'debug',
      'app-arm64-debug.apk',
    );
    if (!existsSync(apkPath)) {
      apkPath = join(
        ANDROID_DIR,
        'app',
        'build',
        'outputs',
        'apk',
        'universal',
        'debug',
        'app-universal-debug.apk',
      );
    }
    if (!existsSync(apkPath)) {
      error('未找到 APK 文件');
      process.exit(1);
    }

    // 安装（如果有设备）
    if (hasDevice) {
      info('卸载旧版本...');
      exec(`adb uninstall ${config.packageName}`, {
        ignoreError: true,
        silent: true,
      });

      info('安装到设备...');
      exec(`adb install -r "${apkPath}"`);
      success('安装完成');

      info('启动应用...');
      exec(`adb shell am start -n ${config.packageName}/.MainActivity`);
      success('应用已启动');

      console.log('');
      console.log('=========================================');
      success('开发模式已启动！');
      console.log('=========================================');
      console.log('');
      console.log(`🔥 开发服务器: ${config.devUrl}`);
      console.log(`📱 设备: ${device}`);
      console.log('🔄 热重载: 已启用');
      console.log('');
    } else {
      console.log('');
      console.log('=========================================');
      success('开发模式 APK 构建完成！');
      console.log('=========================================');
      console.log('');
      console.log(`📦 APK: ${apkPath}`);
      console.log(`🔥 开发服务器: ${config.devUrl}`);
      console.log('');
      warn('请手动安装 APK 到设备');
      console.log('');
    }
  }

  // 生产模式（包括 release 和 release-dev）
  else {
    const apksigner = findApksigner();
    info(`使用 apksigner: ${apksigner}`);

    // 先构建前端（根据模式选择不同的环境配置）
    // 设置 TAURI_ENV_PLATFORM 确保 vite.config.ts 使用正确的 base 路径 "/"
    const viteMode = useDevApi ? 'production.dev' : 'production';
    info(`构建前端 (mode: ${viteMode})...`);
    exec(`npx vite build --mode ${viteMode}`, {
      cwd: PROJECT_ROOT,
      env: { ...process.env, TAURI_ENV_PLATFORM: 'android' },
    });
    success('前端构建完成');

    info('构建 APK...');
    exec('npx @tauri-apps/cli android build', { cwd: PROJECT_ROOT });

    // 查找 APK
    let apkPath = join(
      ANDROID_DIR,
      'app',
      'build',
      'outputs',
      'apk',
      'arm64',
      'release',
      'app-arm64-release-unsigned.apk',
    );
    if (!existsSync(apkPath)) {
      apkPath = join(
        ANDROID_DIR,
        'app',
        'build',
        'outputs',
        'apk',
        'universal',
        'release',
        'app-universal-release-unsigned.apk',
      );
    }
    if (!existsSync(apkPath)) {
      error('APK 文件不存在');
      process.exit(1);
    }
    success(`APK 构建完成: ${apkPath}`);

    // 签名
    info('签名 APK...');
    const keystorePath = isWindows
      ? join(process.env.USERPROFILE || '', '.android', 'debug.keystore')
      : join(process.env.HOME || '', '.android', 'debug.keystore');

    try {
      exec(
        `"${apksigner}" sign --ks "${keystorePath}" --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android "${apkPath}"`,
      );
      success('APK 签名成功');
    } catch {
      error('APK 签名失败');
      process.exit(1);
    }

    const stats = statSync(apkPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

    // 安装（如果有设备）
    if (hasDevice) {
      info('卸载旧版本...');
      exec(`adb uninstall ${config.packageName}`, {
        ignoreError: true,
        silent: true,
      });
      await new Promise((r) => setTimeout(r, 1000));

      info('安装到手机...');
      exec(`adb install -r "${apkPath}"`);
      success('安装完成');

      info('启动应用...');
      exec(`adb shell am start -n ${config.packageName}/.MainActivity`);
      success('应用已启动');

      console.log('');
      console.log('=========================================');
      if (useDevApi) {
        success('测试模式构建完成！');
      } else {
        success('生产模式构建完成！');
      }
      console.log('=========================================');
      console.log('');
      console.log(`📦 APK: ${apkPath}`);
      console.log(`📱 设备: ${device}`);
      console.log(`💾 大小: ${sizeMB} MB`);
      if (useDevApi) {
        console.log(`🧪 API: 测试环境`);
      } else {
        console.log(`🚀 API: 生产环境`);
      }
      console.log('');
    } else {
      console.log('');
      console.log('=========================================');
      if (useDevApi) {
        success('测试模式 APK 构建完成！');
      } else {
        success('生产模式 APK 构建完成！');
      }
      console.log('=========================================');
      console.log('');
      console.log(`📦 APK: ${apkPath}`);
      console.log(`💾 大小: ${sizeMB} MB`);
      if (useDevApi) {
        console.log(`🧪 API: 测试环境`);
      } else {
        console.log(`🚀 API: 生产环境`);
      }
      console.log('');
      warn('请手动安装 APK 到设备: adb install -r "' + apkPath + '"');
      console.log('');
    }
  }
}

main().catch((e) => {
  error(e.message);
  process.exit(1);
});
