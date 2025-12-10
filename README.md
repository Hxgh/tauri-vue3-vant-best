# Tauri Vue3 Vant 模板工程

基于 Tauri 2 + Vue 3 + Vant 4 的跨平台移动应用模板，为 Android/iOS 提供框架级解决方案。

## 项目结构

```
src/
├── core/                    # 🔒 核心能力（业务项目复用）
│   ├── platform/            # 平台检测、桥接、日志
│   ├── theme/               # 主题系统（深浅色/跟随系统）
│   ├── layout/              # 布局系统 + 组件
│   ├── scanner/             # 扫码功能
│   ├── map/                 # 地图导航
│   ├── notification/        # 系统通知
│   └── index.ts             # 统一导出 + 版本号
│
├── demo/                    # 📝 示例页面（业务项目删除）
│   ├── routes.ts            # 示例路由
│   └── test/                # 功能测试页
│
├── router/                  # 路由配置
└── App.vue                  # 应用入口
```

## 使用模板

```bash
# 1. 克隆项目
git clone https://github.com/xxx/tauri-vue3-vant-best.git my-app
cd my-app && rm -rf .git && git init

# 2. 删除示例代码
rm -rf src/demo

# 3. 修改配置
#    - package.json: name
#    - src-tauri/tauri.conf.json: productName, identifier
#    - .env: DEV_SERVER_HOST

# 4. 创建业务页面和路由
pnpm install && pnpm dev
```

**⚠️ 注意：** `index.html` 中包含防止深色模式闪白屏的脚本，业务项目必须保留。详见 [CLAUDE.md](CLAUDE.md#主题系统-三模式架构)。

## 核心能力

| 模块 | 导入方式 | 说明 |
|------|----------|------|
| platform | `import { logger, isTauriEnv } from '@/core/platform'` | 平台检测、桥接、日志 |
| theme | `import { useThemeStore } from '@/core/theme'` | 主题系统 |
| layout | `import { MainLayout, HeaderMode } from '@/core/layout'` | 布局系统 |
| scanner | `import { useBarcodeScanner } from '@/core/scanner'` | 扫码功能 |
| map | `import { useMapNavigation } from '@/core/map'` | 地图导航 |
| notification | `import { useNotification } from '@/core/notification'` | 系统通知 |

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

## 开发命令

```bash
pnpm dev                   # 启动开发服务器
pnpm build                 # 构建生产版本
pnpm build:android:dev     # Android 开发（需先启动 dev）
pnpm build:android:prod    # Android 生产 APK
```

## 升级核心模块

```bash
# Git Subtree 方式
git remote add template https://github.com/xxx/tauri-vue3-vant-best.git
git subtree pull --prefix=src/core template main --squash

# 或手动复制 src/core/ 目录
```

## 文档

详细文档见 [CLAUDE.md](CLAUDE.md)

## License

MIT
