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

### Android 双向同步

**Web → Android：** JS Bridge 通知系统栏图标颜色变更  
**Android → Web：** 通过 `onConfigurationChanged` 和 `onResume` 注入 `window.__ANDROID_SYSTEM_THEME__` 并触发重新计算

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
