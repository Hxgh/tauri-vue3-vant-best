package {{PACKAGE_NAME}}

import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsetsController
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  // 当前键盘高度（像素）
  private var currentKeyboardHeight = 0

  private var isFirstResume = true

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    // 禁用 Android 自动添加的对比度保护层（半透明 scrim）
    // 这是浅色模式下导航栏出现毛玻璃效果的根本原因
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.isNavigationBarContrastEnforced = false
      window.isStatusBarContrastEnforced = false
    }

    // 设置初始的系统栏颜色（跟随系统主题）
    updateSystemBarsForTheme(isSystemDarkMode())

    // ⚠️ 关键修复：必须在 WebView 加载 JavaScript 之前设置 Bridge
    // 不能延迟，否则 JavaScript 会检测到 window.AndroidTheme 不存在并缓存该结果
    setupThemeBridgeWithRetry(maxAttempts = 30, delayMs = 50)

    // 设置键盘高度监听
    setupKeyboardListener()

    // 开发模式：异步加载开发服务器
    Thread {
      Thread.sleep(300)
      loadDevServer()
    }.start()
  }

  /**
   * 应用恢复到前台时，重新检查主题
   */
  override fun onResume() {
    super.onResume()

    // 只在从后台返回时通知（跳过首次启动）
    if (!isFirstResume) {
      notifyWebViewRefreshTheme()
    }
    isFirstResume = false
  }

  /**
   * 通知 WebView 重新应用当前主题
   */
  private fun notifyWebViewRefreshTheme() {
    val webView = findWebView()
    webView?.evaluateJavascript(
      """
      (function() {
        try {
          // 如果 Vue 应用已加载，重新应用主题
          if (window.__VUE_APP__) {
            const event = new CustomEvent('app-resume');
            window.dispatchEvent(event);
          }
        } catch (e) {
          console.error('Failed to refresh theme:', e);
        }
      })();
      """.trimIndent(),
      null
    )
  }

  /**
   * 监听系统配置变化（包括深浅色模式切换）
   */
  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)

    // 检测系统主题是否变化
    val isNightMode = (newConfig.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
                      Configuration.UI_MODE_NIGHT_YES

    val themeInfo = if (isNightMode) "dark" else "light"
    android.util.Log.d("MainActivity", "Configuration changed, new theme: $themeInfo")

    // 更新系统栏颜色
    updateSystemBarsForTheme(isNightMode)

    // 通知 WebView 系统主题已变化
    val webView = findWebView()
    webView?.evaluateJavascript(
      """
      (function() {
        window.__ANDROID_SYSTEM_THEME__ = '$themeInfo';
        console.log('[Android] System theme changed:', '$themeInfo');

        // 触发强制检查
        if (window.__FORCE_THEME_CHECK__) {
          window.__FORCE_THEME_CHECK__();
        }
      })();
      """.trimIndent(),
      null
    )
  }

  private fun loadDevServer() {
    runOnUiThread {
      val webView = findWebView()
      webView?.settings?.apply {
        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        // 启用 JavaScript（确保 Bridge 可用）
        javaScriptEnabled = true
      }

      // 设置 WebViewClient 以在页面加载完成后注入主题
      webView?.webViewClient = object : android.webkit.WebViewClient() {
        override fun onPageFinished(view: android.webkit.WebView?, url: String?) {
          super.onPageFinished(view, url)

          // 页面加载完成后，立即注入系统主题
          val isDark = isSystemDarkMode()
          val themeInfo = if (isDark) "dark" else "light"
          android.util.Log.d("MainActivity", "Page loaded, injecting system theme: $themeInfo")

          view?.evaluateJavascript(
            """
            (function() {
              window.__ANDROID_SYSTEM_THEME__ = '$themeInfo';
              console.log('[Android] System theme injected on page load:', '$themeInfo');

              // 如果 theme store 已经初始化，强制重新检查
              setTimeout(function() {
                if (window.__FORCE_THEME_CHECK__) {
                  window.__FORCE_THEME_CHECK__();
                }
              }, 100);
            })();
            """.trimIndent(),
            null
          )
        }
      }

      webView?.loadUrl("{{DEV_URL}}")
    }
  }

  /**
   * 设置 WebView Console 输出到 Logcat（用于调试）
   */
  private fun setupWebViewConsole() {
    runOnUiThread {
      val webView = findWebView()
      webView?.webChromeClient = object : android.webkit.WebChromeClient() {
        override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
          consoleMessage?.let {
            android.util.Log.d("WebView", "[JS] ${it.message()}")
          }
          return true
        }
      }
    }
  }

  /**
   * 设置 JavaScript Bridge（带重试机制）
   * ⚠️ 关键：必须在 WebView 加载 JavaScript 之前完成设置
   */
  private fun setupThemeBridgeWithRetry(attempt: Int = 0, maxAttempts: Int = 30, delayMs: Long = 50) {
    runOnUiThread {
      val webView = findWebView()
      if (webView != null) {
        webView.addJavascriptInterface(ThemeBridge(), "AndroidTheme")
        webView.addJavascriptInterface(MapBridge(), "AndroidMap")
        setupWebViewConsole()
      } else if (attempt < maxAttempts) {
        Thread {
          Thread.sleep(delayMs)
          setupThemeBridgeWithRetry(attempt + 1, maxAttempts, delayMs)
        }.start()
      } else {
        android.util.Log.e("MainActivity", "Failed to setup AndroidTheme Bridge after $maxAttempts attempts")
      }
    }
  }

  /**
   * JavaScript Bridge：接收来自 Web 的主题变化通知
   */
  inner class ThemeBridge {
    @JavascriptInterface
    fun setTheme(theme: String, mode: String) {
      runOnUiThread {
        val isDark = when {
          mode == "auto" -> isSystemDarkMode()
          else -> theme == "dark"
        }
        updateSystemBarsForTheme(isDark)
      }
    }
  }

  /**
   * JavaScript Bridge：检查地图应用是否安装
   */
  inner class MapBridge {
    @JavascriptInterface
    fun isAppInstalled(packageName: String): Boolean {
      return try {
        packageManager.getPackageInfo(packageName, 0)
        true
      } catch (e: Exception) {
        false
      }
    }
  }

  /**
   * 更新系统栏（状态栏和导航栏）的图标颜色
   * @param isDark 是否为深色主题
   *
   * 深浅色配置一致性原则：
   * - 深色主题 = 浅色图标
   * - 浅色主题 = 深色图标
   *
   * 注意：enableEdgeToEdge() 已经处理了系统栏透明度，
   * 这里只需要设置图标颜色即可
   */
  private fun updateSystemBarsForTheme(isDark: Boolean) {
    // 设置图标颜色（深浅色相反）
    var success = false

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // Android 11+ 优先使用新 API
      val controller = window.insetsController
      if (controller != null) {
        try {
          val mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or
                     WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
          // 深色主题：使用浅色图标（清除 LIGHT 标志）
          // 浅色主题：使用深色图标（设置 LIGHT 标志）
          controller.setSystemBarsAppearance(if (isDark) 0 else mask, mask)
          success = true
        } catch (e: Exception) {
          android.util.Log.e("MainActivity", "Failed to update system bars (New API)", e)
        }
      }
    }

    // 如果新 API 失败或不可用，使用兼容 API 作为回退
    if (!success) {
      try {
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.isAppearanceLightStatusBars = !isDark
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          controller.isAppearanceLightNavigationBars = !isDark
        }
      } catch (e: Exception) {
        android.util.Log.e("MainActivity", "Failed to update system bars (Compat API)", e)
      }
    }
  }

  /**
   * 检测系统是否处于深色模式
   */
  private fun isSystemDarkMode(): Boolean {
    val nightMode = resources.configuration.uiMode and
                   android.content.res.Configuration.UI_MODE_NIGHT_MASK
    return nightMode == android.content.res.Configuration.UI_MODE_NIGHT_YES
  }

  private fun findWebView(): WebView? {
    return findWebView(window.decorView)
  }

  private fun findWebView(view: View): WebView? {
    if (view is WebView) {
      return view
    }
    if (view is android.view.ViewGroup) {
      for (i in 0 until view.childCount) {
        val webView = findWebView(view.getChildAt(i))
        if (webView != null) return webView
      }
    }
    return null
  }

  /**
   * 设置键盘高度监听
   * 使用 WindowInsets API 监听 IME（输入法）的显示/隐藏
   */
  private fun setupKeyboardListener() {
    ViewCompat.setOnApplyWindowInsetsListener(window.decorView) { view, insets ->
      val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
      val navBarInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars())

      // 键盘高度 = IME 底部 inset - 导航栏高度
      // 因为 IME insets 包含了导航栏的高度
      val keyboardHeight = if (imeInsets.bottom > navBarInsets.bottom) {
        imeInsets.bottom - navBarInsets.bottom
      } else {
        0
      }

      if (keyboardHeight != currentKeyboardHeight) {
        currentKeyboardHeight = keyboardHeight
        notifyKeyboardChange(keyboardHeight)
      }

      ViewCompat.onApplyWindowInsets(view, insets)
    }
  }

  /**
   * 通知 WebView 键盘高度变化
   * @param heightPx 键盘高度（像素）
   */
  private fun notifyKeyboardChange(heightPx: Int) {
    val webView = findWebView() ?: return
    val density = resources.displayMetrics.density
    val heightDp = (heightPx / density).toInt()

    webView.evaluateJavascript(
      """
      (function() {
        document.documentElement.style.setProperty('--skb', '${heightDp}px');
        window.__KEYBOARD_HEIGHT__ = $heightDp;
        if (window.__ON_KEYBOARD_CHANGE__) {
          window.__ON_KEYBOARD_CHANGE__($heightDp);
        }
      })();
      """.trimIndent(),
      null
    )
  }
}
