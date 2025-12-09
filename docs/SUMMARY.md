# tvvb App - 功能总结

## 核心原则

**完全沉浸式（`Immersive`）** = 不处理安全区域，内容覆盖整屏  
**其他情况** = 内容都在安全区域内

---

## 5 种布局模式

| 模式 | 配置 | 示例 | 自动 Padding |
|------|------|------|-------------|
| 1 | Header + Tabbar | Page2 | 顶部 + 底部 |
| 2 | SafeArea + Tabbar | Page3 | 固定占位 + 底部 |
| 3 | Header + 固定按钮 | DetailPage | 顶部 + 底部 |
| 4 | 完全沉浸式 | LoginPage/VideoPage | 无 |

---

## 工具组件

### FixedBottom

固定底部按钮容器（有背景），用于详情页。

```vue
<FixedBottom>
  <van-button type="primary">提交</van-button>
</FixedBottom>
```

### ImmersiveNavbar / ImmersiveBottomBar

沉浸式透明导航栏（无背景），用于完全沉浸式页面。

```vue
<!-- 顶部导航栏 -->
<ImmersiveNavbar>
  <template #left>
    <van-icon name="arrow-left" color="white" />
  </template>
  <template #title>
    <span style="color: white;">标题</span>
  </template>
</ImmersiveNavbar>

<!-- 底部控制栏 -->
<ImmersiveBottomBar>
  <van-icon name="play" color="white" />
  <span style="color: white;">00:30 / 05:20</span>
</ImmersiveBottomBar>
```

---

## 主题系统

### 三种模式

```typescript
themeStore.setMode('auto');   // 跟随系统
themeStore.setMode('dark');   // 强制深色
themeStore.setMode('light');  // 强制浅色
```

### Android 双向同步

- **Web → Android**：`window.ThemeBridge.onThemeChanged(theme)`
- **Android → Web**：`window.__ANDROID_SYSTEM_THEME__` + `app-resume` 事件

### 一致性原则

深色/浅色只是颜色相反，其他处理完全一致。

---

## 构建脚本

```bash
# 开发模式（热更新）
npm run build:android:dev

# 生产模式（硬打包）
npm run build:android:prod
```

---

## 关键文件

| 文件 | 说明 |
|------|------|
| `src/layouts/MainLayout.vue` | 统一布局管理 |
| `src/components/FixedBottom.vue` | 固定底部容器（有背景） |
| `src/components/ImmersiveNavbar.vue` | 沉浸式顶部导航栏（透明） |
| `src/components/ImmersiveBottomBar.vue` | 沉浸式底部控制栏（透明） |
| `src/stores/theme.ts` | 主题状态管理 |
| `scripts/build-android.sh` | Android 构建脚本 |
| `docs/LAYOUT_SYSTEM.md` | 布局系统详解 |
| `docs/THEME_SYSTEM.md` | 主题系统详解 |

---

## 已解决的问题

1. ✅ Tabbar 深色模式显示浅色 → 动态添加 `.van-theme-dark`
2. ✅ 系统切换主题不联动 → `onConfigurationChanged` + 注入主题信息
3. ✅ 应用恢复主题不刷新 → `onResume` + `app-resume` 事件
4. ✅ 浅色模式导航栏有半透明层 → 禁用 `ContrastEnforced`
5. ✅ Page3 内容滚到安全区域 → 固定占位元素 + padding
6. ✅ 无 Tabbar 安全区域不一致 → `TabbarMode.None` 自动添加底部安全区域
7. ✅ 固定按钮繁琐 → `FixedBottom` 组件封装
8. ✅ 沉浸式导航栏繁琐 → `ImmersiveNavbar` 组件封装

---

## 总结

tvvb App 提供了：

- **5 种布局模式**，覆盖所有场景
- **3 个工具组件**，简化开发
- **3 种主题模式**，支持自动跟随系统
- **完善的安全区域适配**，遵循一致性原则
- **Android 原生集成**，主题与系统栏完美同步
- **开发/生产构建脚本**，一键构建安装
