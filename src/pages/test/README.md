# 测试页面

## 布局测试

### DetailPage - 标准详情页
- **路径：** `/test/detail`
- **配置：** `Standard` Header + `BelowHeader` + `None` Tabbar
- **特点：** 使用 `<FixedBottom>` 组件自动处理固定按钮安全区域

### LoginPage - 完全沉浸式（登录页）
- **路径：** `/test/login`
- **配置：** `None` Header + `ScreenTop` + `Immersive` Tabbar
- **特点：** 渐变背景覆盖整个屏幕，使用 `<ImmersiveNavbar>` 返回按钮

### VideoPage - 完全沉浸式（视频页）
- **路径：** `/test/video`
- **配置：** `None` Header + `ScreenTop` + `Immersive` Tabbar
- **特点：** 视频覆盖全屏，使用 `<ImmersiveNavbar>` 和 `<ImmersiveBottomBar>` 处理控制栏

### ThemeTestPage - 主题测试
- **路径：** `/test/theme`
- **配置：** `Standard` Header + `BelowHeader` + `None` Tabbar
- **特点：** 测试主题切换功能，预览颜色变量

## 功能测试

### MapTestPage - 地图跳转测试
- **路径：** `/test/map`
- **配置：** `Standard` Header + `BelowHeader` + `None` Tabbar
- **特点：** 
  - 支持高德/百度/腾讯地图
  - 原生唤起地图 App（Android/iOS）
  - 未安装自动 Fallback 到网页版
  - 桌面端直接打开网页版

## 快速访问

首页 (Page1) → 点击测试页面入口
