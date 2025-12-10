# Tauri Vue3 Vant 移动端模板

基于 Tauri 2 + Vue 3 + Vant 4 的跨平台移动应用模板。

## 核心能力

| 模块 | 说明 |
|------|------|
| `src/core/platform` | 平台检测、原生桥接、日志 |
| `src/core/theme` | 主题系统（深浅色/跟随系统） |
| `src/core/layout` | 布局系统（4种模式） |
| `src/core/scanner` | 扫码功能 |
| `src/core/map` | 地图导航 |
| `src/core/notification` | 系统通知 |
| `src/components/` | 工具组件 |
| `src-tauri/` | Android/iOS 原生能力 |
| `scripts/` | 构建脚本 |

## 使用模板

```bash
# 1. 克隆
git clone https://github.com/xxx/tauri-vue3-vant-best.git my-app
cd my-app && rm -rf .git && git init

# 2. 删除示例页面
rm -rf src/pages/test src/pages/Page*.vue

# 3. 修改配置
#    - package.json: name
#    - src-tauri/tauri.conf.json: productName, identifier
#    - .env: DEV_SERVER_HOST

# 4. 创建业务页面，修改路由
pnpm install && pnpm dev
```

## 页面示例

```vue
<template>
  <MainLayout
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="订单详情"
  >
    <!-- 业务内容 -->
  </MainLayout>
</template>

<script setup lang="ts">
import { MainLayout, HeaderMode, ContentStart, TabbarMode } from '@/core/layout';
</script>
```

## 命令

```bash
pnpm dev                 # 开发
pnpm build               # 构建
pnpm build:android:dev   # Android 开发（需先启动 dev）
pnpm build:android:prod  # Android 生产
```

## 文档

- [布局系统](docs/LAYOUT_SYSTEM.md)
- [主题系统](docs/THEME_SYSTEM.md)
- [Android 构建](docs/BUILD_ANDROID.md)

## License

MIT
