# 📱 移动端开发配置说明

本项目已完成 Vant UI + 安全区域适配配置，支持 iOS 和 Android 移动端开发。

## ✅ 已完成的配置

### 1. Vant UI 框架
- **版本**: Vant 4.9.21（最新版）
- **按需引入**: 已配置，使用 `unplugin-vue-components` 自动导入
- **全局样式**: 已引入 Vant 样式文件

### 2. 安全区域适配
- **viewport-fit**: 已在 `index.html` 中配置 `viewport-fit=cover`
- **CSS 变量**: 创建了 `src/styles/safe-area.css` 全局配置
- **组件支持**: NavBar 和 Tabbar 已启用 `safe-area-inset-*` 属性

### 3. Rsbuild 配置
- **自动导入**: 配置了 Vant 组件按需引入
- **端口**: 开发服务器运行在 `http://localhost:1420`

## 📁 项目结构

```
src/
├── App.vue                 # 主应用组件（已配置示例）
├── index.ts                # 入口文件
├── index.css               # 全局样式
└── styles/
    └── safe-area.css       # 安全区域适配样式
```

## 🎨 安全区域 CSS 变量

在 `src/styles/safe-area.css` 中定义了以下变量：

```css
:root {
  /* 安全区域基础变量 */
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
  --sar: env(safe-area-inset-right);
  
  /* Vant 组件高度 */
  --navbar-height: 46px;
  --tabbar-height: 50px;
  
  /* 包含安全区的总高度 */
  --navbar-total-height: calc(var(--navbar-height) + var(--sat));
  --tabbar-total-height: calc(var(--tabbar-height) + var(--sab));
  
  /* 内容区域高度 */
  --content-height-full: calc(100vh - var(--navbar-total-height) - var(--tabbar-total-height));
}
```

## 🚀 使用示例

### 1. 使用 NavBar（带顶部安全区）

```vue
<van-nav-bar
  title="标题"
  left-arrow
  fixed
  placeholder
  safe-area-inset-top
/>
```

### 2. 使用 Tabbar（带底部安全区）

```vue
<van-tabbar 
  v-model="active"
  fixed
  placeholder
  safe-area-inset-bottom
>
  <van-tabbar-item icon="home-o">首页</van-tabbar-item>
  <van-tabbar-item icon="search">搜索</van-tabbar-item>
</van-tabbar>
```

### 3. 内容区域适配

```vue
<template>
  <div class="page-content safe-area-horizontal">
    <!-- 内容会自动适配左右安全区 -->
  </div>
</template>
```

### 4. 使用工具类

```vue
<div class="safe-area-top">顶部安全区</div>
<div class="safe-area-bottom">底部安全区</div>
<div class="safe-area-horizontal">左右安全区</div>
<div class="safe-area-all">全部安全区</div>
```

## 🔧 开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm check

# 代码格式化
pnpm format
```

## 📱 移动端调试

### 在浏览器中测试
1. 打开 Chrome DevTools
2. 切换到移动设备模拟器（Toggle device toolbar）
3. 选择 iPhone X 或其他刘海屏设备
4. 访问 `http://localhost:1420`

### 在真机上测试
1. 确保手机和电脑在同一网络
2. 获取电脑的 IP 地址
3. 在手机浏览器访问 `http://[你的IP]:1420`

### Tauri 移动端开发

#### Android
```bash
# 初始化 Android 项目
npx @tauri-apps/cli android init

# 开发模式
npx @tauri-apps/cli android dev

# 构建 APK
npx @tauri-apps/cli android build
```

#### iOS（仅 macOS）
```bash
# 初始化 iOS 项目
npx @tauri-apps/cli ios init

# 开发模式
npx @tauri-apps/cli ios dev

# 构建
npx @tauri-apps/cli ios build
```

## 🎯 关键特性

### 1. 自动按需引入
无需手动导入 Vant 组件，直接在模板中使用即可：

```vue
<template>
  <!-- 自动导入，无需 import -->
  <van-button type="primary">按钮</van-button>
  <van-cell title="单元格" />
</template>
```

### 2. 安全区域自动适配
- ✅ 支持 iPhone X 及以上刘海屏
- ✅ 支持 iPhone 底部 Home Indicator
- ✅ 支持 Android 异形屏
- ✅ 自动计算内容区域高度

### 3. placeholder 占位
使用 `placeholder` 属性后，Vant 会自动生成占位元素，无需手动计算 margin：

```vue
<!-- 使用 placeholder，内容不会被遮挡 -->
<van-nav-bar title="标题" fixed placeholder />
<div>内容自动下移，不会被遮挡</div>
```

## 📚 参考文档

- [Vant 官方文档](https://vant-ui.github.io/vant/)
- [Rsbuild 官方文档](https://rsbuild.dev/)
- [CSS env() - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [Tauri 移动端开发](https://tauri.app/zh-cn/start/prerequisites/)

## ⚠️ 注意事项

1. **viewport-fit=cover** 是必须的，否则 `env()` 函数无效
2. **placeholder** 属性会自动生成占位元素，避免内容被遮挡
3. 在真机上测试效果最准确，模拟器可能不显示安全区
4. Android 设备对 `env()` 的支持在 Android 9+ 较好

## 🐛 故障排除

### 问题：安全区域不生效
- 检查 `index.html` 是否有 `viewport-fit=cover`
- 确认是否在支持的设备上测试（iOS 11.2+）
- 检查浏览器控制台是否有 CSS 错误

### 问题：Vant 组件不显示
- 确认已安装 Vant: `pnpm list vant`
- 检查是否正确引入全局样式
- 查看控制台是否有导入错误

### 问题：按需引入不生效
- 检查 `rsbuild.config.ts` 配置
- 确认已安装 `unplugin-vue-components`
- 重启开发服务器

---

**配置完成时间**: 2025-11-04
**Vant 版本**: 4.9.21
**配置人员**: AI Assistant

