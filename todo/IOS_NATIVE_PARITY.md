# iOS 原生能力对齐方案

目标：让 iOS 端具备与 Android 相同行为（主题同步、系统栏控制、安全区域注入、原生 Bridge 能力），前端无需区分平台即可复用逻辑。

> ✅ 已在 `src-tauri/gen/apple/` 初始化 Xcode 工程，可直接按照下列步骤扩展 Bridge 能力。

## 1. 工程准备

1. 生成或导入 WKWebView 宿主（建议放在 `src-tauri/gen/apple/ios`，结构与 Android 模板一致）。
2. 在 Xcode 工程中创建以下文件：
   - `MainViewController.swift`（或复用 Tauri 默认控制器）
   - `ThemeBridge.swift`
   - `SafeAreaManager.swift`
   - 可选：`MapBridge.swift` 等其他桥接
3. 确保所有自定义 bridge 在 WebView 加载 URL 之前注册。

## 2. 主题同步

### Web → iOS

```swift
class ThemeBridge: NSObject, WKScriptMessageHandler {
  func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
    guard message.name == "iOSTheme",
          let payload = message.body as? [String: Any],
          let theme = payload["theme"] as? String,
          let mode = payload["mode"] as? String else { return }

    let isDark: Bool
    if mode == "auto" {
      isDark = UITraitCollection.current.userInterfaceStyle == .dark
    } else {
      isDark = (theme == "dark")
    }
    applyTheme(isDark: isDark)
  }
}
```

`applyTheme` 中需要：
- 设置 `overrideUserInterfaceStyle`、`statusBarStyle`
- 配合 `UINavigationBarAppearance` / `UITabBarAppearance`，维持透明背景、正确图标颜色

### iOS → Web

在 `viewDidLoad`、`traitCollectionDidChange`、`sceneDidBecomeActive` 等位置执行：

```swift
func pushSystemThemeToWeb(isDark: Bool) {
  let script = """
    window.__IOS_SYSTEM_THEME__ = '\(isDark ? "dark" : "light")';
    if (window.__FORCE_THEME_CHECK__) window.__FORCE_THEME_CHECK__();
  """
  webView.evaluateJavaScript(script, completionHandler: nil)
}
```

并在应用初始化时注入 `app-resume` 事件：

```swift
webView.evaluateJavaScript("""
  window.dispatchEvent(new CustomEvent('app-resume'));
""")
```

## 3. 安全区域与系统栏

1. 启用沉浸式布局：
   - `view.insetsLayoutMarginsFromSafeArea = false`
   - `webView.scrollView.contentInsetAdjustmentBehavior = .never`
   - 状态栏显示由 `UIViewController.prefersStatusBarHidden`/`preferredStatusBarStyle` 控制
2. 将 `safeAreaInsets` 注入 CSS 变量（对齐 Android 的 `--sat`/`--sab` 等）：

```swift
func syncSafeAreaInsets() {
  let insets = view.safeAreaInsets
  let bottom = max(insets.bottom, 20) // Android 同步逻辑
  let js = """
    document.documentElement.style.setProperty('--sat', '\(insets.top)px');
    document.documentElement.style.setProperty('--sab', '\(bottom)px');
    document.documentElement.style.setProperty('--sal', '\(insets.left)px');
    document.documentElement.style.setProperty('--sar', '\(insets.right)px');
  """
  webView.evaluateJavaScript(js, completionHandler: nil)
}
```

在 `viewSafeAreaInsetsDidChange`、旋转、键盘出现等情况下重新调用。

## 4. 其他 Bridge（示例：地图）

Android 侧存在 `window.AndroidMap.isAppInstalled` 等接口，iOS 需对齐：

```swift
class MapBridge: NSObject, WKScriptMessageHandler {
  func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
    guard message.name == "iOSMap",
          let payload = message.body as? [String: Any],
          let urlString = payload["url"] as? String,
          let url = URL(string: urlString) else { return }

    UIApplication.shared.open(url, options: [:]) { success in
      let callback = payload["callback"] as? String ?? ""
      if !callback.isEmpty {
        let result = success ? "true" : "false"
        controller.webView?.evaluateJavaScript("\(callback)(\(result))", completionHandler: nil)
      }
    }
  }
}
```

前端根据 `isIOS()`/`isAndroid()` 切换到对应 handler，保持统一 API。

## 5. 验证清单

- [ ] app 首次启动：主题与系统一致、系统栏透明、safe-area 正常
- [ ] 切换系统深浅色：两端都能立即刷新
- [ ] 前后台切换：`app-resume` 生效，主题/SafeArea 无异常
- [ ] 横竖屏切换：CSS 变量刷新，内容不被遮挡
- [ ] 地图等 Bridge 功能：Android/iOS 结果一致

## 6. 维护约束

- 新增原生能力必须同时提供 Android/iOS 实现，PR 模板注明 `Native parity ✅`
- 文档（README、docs/THEME_SYSTEM.md、.cursor/rules）更新 iOS 路径和注意事项
- 保持日志一致（`[Theme] Synced to iOS` / `[Theme] Synced to Android`），方便排查
- 若某端尚未发布，前端通过 `window.__NATIVE_CAPS__`（可选）声明能力版本，避免调用不存在的 handler

落实以上步骤即可让 iOS 拥有与 Android 等价的主题、导航、安全区域与桥接能力。
