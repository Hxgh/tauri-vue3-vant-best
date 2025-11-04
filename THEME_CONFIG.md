# 🎨 主题配置说明

## 概述

本应用支持深色模式，使用 Pinia 进行状态管理，localStorage 持久化用户设置。

---

## 主题优先级

1. **用户自定义设置**（localStorage 存储）- 最高优先级
2. **操作系统偏好**（`prefers-color-scheme`）- 第二优先级
3. **默认浅色模式** - 兜底

---

## 文件结构

```
src/
├── stores/
│   └── theme.ts              # 主题状态管理（Pinia）
├── styles/
│   ├── theme.css             # 主题 CSS 变量定义
│   ├── safe-area.css         # 安全区域适配
│   └── index.css             # 全局样式
└── App.vue                   # 使用主题变量
```

---

## CSS 变量命名规范

### 基础颜色
```css
--color-bg-primary       # 主背景色
--color-bg-secondary     # 次级背景色
--color-bg-tertiary      # 三级背景色
```

### 文字颜色
```css
--color-text-primary     # 主文字颜色
--color-text-secondary   # 次级文字颜色
--color-text-tertiary    # 三级文字颜色
```

### 品牌色
```css
--color-primary          # 主色
--color-success          # 成功色
--color-warning          # 警告色
--color-danger           # 危险色
```

### 组件背景色
```css
--navbar-bg              # 导航栏背景
--tabbar-bg              # 标签栏背景
--card-bg                # 卡片背景
```

### 安全区域背景色
```css
--safe-area-top-bg       # 顶部安全区域背景
--safe-area-bottom-bg    # 底部安全区域背景
```

---

## 使用方式

### 1. 在组件中使用主题 Store

```vue
<script setup lang="ts">
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()

// 初始化主题（通常在根组件）
onMounted(() => {
  themeStore.initTheme()
})

// 切换主题
function toggleTheme() {
  themeStore.toggleTheme()
}

// 设置特定模式
function setLightMode() {
  themeStore.setMode('light')
}

function setDarkMode() {
  themeStore.setMode('dark')
}

function setAutoMode() {
  themeStore.setMode('auto')
}
</script>
```

### 2. 在 CSS 中使用变量

```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

### 3. 安全区域适配

```css
/* 顶部安全区域占位 */
.safe-area-placeholder-top {
  height: constant(safe-area-inset-top, 0px);  /* iOS 11.0-11.2 */
  height: env(safe-area-inset-top, 0px);       /* 标准 */
  background-color: var(--safe-area-top-bg);   /* 跟随主题 */
}

/* 底部安全区域占位 */
.safe-area-placeholder-bottom {
  height: constant(safe-area-inset-bottom, 0px);
  height: env(safe-area-inset-bottom, 0px);
  min-height: 20px;  /* Android 兜底值 */
  background-color: var(--safe-area-bottom-bg);
}
```

---

## 自定义主题颜色

### 修改浅色模式

编辑 `src/styles/theme.css`：

```css
:root.light {
  --color-primary: #1989fa;      /* 改成你的品牌色 */
  --navbar-bg: #ffffff;          /* 改 NavBar 背景 */
  --tabbar-bg: #ffffff;          /* 改 Tabbar 背景 */
  --safe-area-top-bg: #ffffff;   /* 改顶部安全区域背景 */
  --safe-area-bottom-bg: #ffffff; /* 改底部安全区域背景 */
}
```

### 修改深色模式

```css
:root.dark {
  --color-primary: #3a9eff;      /* 深色模式品牌色 */
  --navbar-bg: #1e1e1e;          /* 深色 NavBar */
  --tabbar-bg: #1e1e1e;          /* 深色 Tabbar */
  --safe-area-top-bg: #1e1e1e;   /* 深色顶部安全区域 */
  --safe-area-bottom-bg: #1e1e1e; /* 深色底部安全区域 */
}
```

---

## Vant 组件适配

Vant 4.0+ 支持深色模式，通过覆盖 CSS 变量实现：

```css
.dark {
  --van-background: var(--color-bg-primary);
  --van-text-color: var(--color-text-primary);
  --van-nav-bar-background: var(--navbar-bg);
  --van-tabbar-background: var(--tabbar-bg);
  /* ... 更多 Vant 变量 */
}
```

完整变量列表：https://vant4.ylhtest.com/#/zh-CN/config-provider

---

## 调试技巧

### 1. 查看当前主题状态

```javascript
// 在浏览器控制台
const themeStore = useThemeStore()
console.log('模式：', themeStore.mode)          // 'light' | 'dark' | 'auto'
console.log('实际主题：', themeStore.resolvedTheme) // 'light' | 'dark'
```

### 2. 查看 localStorage

```javascript
// 在浏览器控制台
localStorage.getItem('app-theme-mode')  // 'light' | 'dark' | 'auto'
```

### 3. 测试系统主题切换

- **macOS**: 系统设置 → 外观 → 浅色/深色/自动
- **Android**: 设置 → 显示 → 深色主题
- **iOS**: 设置 → 显示与亮度 → 浅色/深色

---

## 注意事项

### ✅ 最佳实践

1. **所有颜色都使用 CSS 变量**，不要硬编码颜色值
2. **安全区域背景色与对应组件保持一致**
3. **新增颜色时同时定义浅色和深色两个版本**
4. **测试所有主题模式（light/dark/auto）**

### ⚠️ 避免的问题

1. ❌ 不要直接使用 `#ffffff` 等硬编码颜色
2. ❌ 不要忘记给安全区域占位设置背景色
3. ❌ 不要在 JS 中硬编码颜色（除非是品牌 logo 等固定颜色）
4. ❌ 不要忘记测试 Android 的兜底值（`min-height: 20px`）

---

## 常见问题

### Q: 为什么底部安全区域有 `min-height: 20px`？

A: 部分 Android 设备的 `env(safe-area-inset-bottom)` 返回 0，需要兜底值确保至少有安全距离。

### Q: 如何禁用深色模式？

A: 如果需要强制浅色模式，可以在 `initTheme()` 时设置：

```typescript
onMounted(() => {
  themeStore.setMode('light')  // 强制浅色
  themeStore.initTheme()
})
```

### Q: 为什么要同时写 `constant()` 和 `env()`？

A: `constant()` 是 iOS 11.0-11.2 的语法，`env()` 是标准语法（iOS 11.2+）。后写的会覆盖前面的，实现回退兼容。

---

## 更新日志

- **2024-11-04**: 初始版本，支持浅色/深色/自动三种模式
- **2024-11-04**: 添加安全区域背景色专用变量
- **2024-11-04**: 规整代码，统一管理所有颜色变量

---

## 参考资料

- [Vant 4 深色模式](https://vant4.ylhtest.com/#/zh-CN/config-provider)
- [CSS env() 函数](https://developer.mozilla.org/zh-CN/docs/Web/CSS/env)
- [Pinia 状态管理](https://pinia.vuejs.org/)
- [prefers-color-scheme](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-color-scheme)

