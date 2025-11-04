# CSS 变量快速参考

## 基础颜色

| 变量名 | 浅色模式 | 深色模式 | 用途 |
|--------|---------|---------|------|
| `--color-bg-primary` | `#ffffff` | `#1e1e1e` | 主背景色（卡片、组件） |
| `--color-bg-secondary` | `#f7f8fa` | `#141414` | 次级背景色（页面背景） |
| `--color-bg-tertiary` | `#f2f3f5` | `#2a2a2a` | 三级背景色（深层容器） |

## 文字颜色

| 变量名 | 浅色模式 | 深色模式 | 用途 |
|--------|---------|---------|------|
| `--color-text-primary` | `#323233` | `#e5e5e5` | 主文字 |
| `--color-text-secondary` | `#646566` | `#a8a8a8` | 次级文字 |
| `--color-text-tertiary` | `#969799` | `#707070` | 三级文字（提示、说明） |

## 边框颜色

| 变量名 | 浅色模式 | 深色模式 | 用途 |
|--------|---------|---------|------|
| `--color-border` | `#ebedf0` | `#3a3a3a` | 主边框 |
| `--color-border-light` | `#f2f3f5` | `#2a2a2a` | 浅色边框 |

## 品牌色

| 变量名 | 浅色模式 | 深色模式 | 用途 |
|--------|---------|---------|------|
| `--color-primary` | `#1989fa` | `#3a9eff` | 主色（按钮、链接） |
| `--color-success` | `#07c160` | `#34c759` | 成功色 |
| `--color-warning` | `#ff976a` | `#ff9f0a` | 警告色 |
| `--color-danger` | `#ee0a24` | `#ff453a` | 危险色 |

## 组件背景色

| 变量名 | 浅色模式 | 深色模式 | 用途 |
|--------|---------|---------|------|
| `--navbar-bg` | `#ffffff` | `#1e1e1e` | 导航栏背景 |
| `--tabbar-bg` | `#ffffff` | `#1e1e1e` | 标签栏背景 |
| `--card-bg` | `#ffffff` | `#2a2a2a` | 卡片背景 |

## 安全区域背景色

| 变量名 | 浅色模式 | 深色模式 | 用途 |
|--------|---------|---------|------|
| `--safe-area-top-bg` | `#ffffff` | `#1e1e1e` | 顶部安全区域背景（与 NavBar 一致） |
| `--safe-area-bottom-bg` | `#ffffff` | `#1e1e1e` | 底部安全区域背景（与 Tabbar 一致） |

## 阴影

| 变量名 | 浅色模式 | 深色模式 | 用途 |
|--------|---------|---------|------|
| `--shadow-light` | `rgba(100,101,102,0.12)` | `rgba(0,0,0,0.3)` | 浅阴影 |
| `--shadow-medium` | `rgba(100,101,102,0.15)` | `rgba(0,0,0,0.4)` | 中阴影 |

---

## 使用示例

```css
/* 基础使用 */
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* 按钮 */
.primary-button {
  background-color: var(--color-primary);
  color: #ffffff;
}

/* 卡片 */
.card {
  background-color: var(--card-bg);
  box-shadow: var(--shadow-light);
}

/* 安全区域 */
.safe-area-top {
  height: env(safe-area-inset-top, 0px);
  background-color: var(--safe-area-top-bg);
}
```

---

## 修改指南

如果需要自定义颜色，编辑 `src/styles/theme.css`：

```css
:root.light {
  /* 修改浅色模式的主色 */
  --color-primary: #your-color;
}

:root.dark {
  /* 修改深色模式的主色 */
  --color-primary: #your-color;
}
```

**重要：** 修改组件背景色时，记得同步修改对应的安全区域背景色！

```css
:root.dark {
  --navbar-bg: #1e1e1e;
  --safe-area-top-bg: #1e1e1e;  /* ⚠️ 保持一致 */
  
  --tabbar-bg: #1e1e1e;
  --safe-area-bottom-bg: #1e1e1e;  /* ⚠️ 保持一致 */
}
```

