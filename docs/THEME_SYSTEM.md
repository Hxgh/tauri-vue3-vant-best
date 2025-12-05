# 主题系统

## 三种模式

```typescript
themeStore.setMode('auto');   // 跟随系统（推荐）
themeStore.setMode('dark');   // 强制深色
themeStore.setMode('light');  // 强制浅色
```

## 核心机制

### CSS 层

- `auto`：不设置 `[data-theme]`，让 `@media (prefers-color-scheme: dark)` 自动切换
- `light/dark`：设置 `[data-theme]`，用 `!important` 强制覆盖
- `.van-theme-dark`：始终根据最终主题添加/移除，确保 Vant 组件正确显示

### 原生双向同步（Android/iOS）

**Web → 原生：**
- Android：`window.AndroidTheme.setTheme(theme, mode)` → 更新系统栏图标/背景
- iOS：`window.webkit.messageHandlers.iOSTheme.postMessage({ action: 'setTheme', theme, mode })`

**原生 → Web：**
- Android：`onConfigurationChanged` / `onResume` 注入 `window.__ANDROID_SYSTEM_THEME__`
- iOS：原生注入 `window.__IOS_SYSTEM_THEME__`
- 两端都可调用 `window.__FORCE_THEME_CHECK__?.()` 触发 Pinia Store 重新解析

## 一致性原则

深色/浅色只是颜色相反，其他处理完全一致：

| 配置 | 深色 | 浅色 |
|------|------|------|
| 背景色 | `#141414` | `#f7f8fa` |
| 文本色 | `#e5e5e5` | `#323233` |
| 状态栏图标 | 浅色 | 深色 |
| 导航栏图标 | 浅色 | 深色 |
| 系统栏透明 | ✅ | ✅ |
| Contrast 强制 | 禁用 | 禁用 |

## 相关文件

- `src/stores/theme.ts` - 主题状态管理
- `src/styles/theme.css` - 主题 CSS 变量
- `src-tauri/gen/android/.../MainActivity.kt` - Android 同步逻辑
- `src-tauri/gen/apple/Sources/app/NativeBridge.mm` - iOS 主题/安全区 Bridge（注入 `__IOS_SYSTEM_THEME__`、`window.webkit.messageHandlers.iOSTheme`）
