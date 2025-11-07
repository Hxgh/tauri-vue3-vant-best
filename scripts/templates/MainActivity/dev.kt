package com.express.app

import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsetsController
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat

class MainActivity : TauriActivity() {
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
    
    // 开发模式：异步加载开发服务器（减少延迟）
    Thread {
      // 优化：减少延迟时间
      Thread.sleep(300)
      loadDevServer()
      // 设置 Bridge（带重试机制）
      setupThemeBridgeWithRetry()
    }.start()
  }

  private var isFirstResume = true

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
      
      webView?.loadUrl("http://192.168.3.81:1420")
    }
  }

  /**
   * 设置 JavaScript Bridge（带重试机制）
   */
  private fun setupThemeBridgeWithRetry(attempt: Int = 0) {
    runOnUiThread {
      val webView = findWebView()
      if (webView != null) {
        webView.addJavascriptInterface(ThemeBridge(), "AndroidTheme")
      } else if (attempt < 5) {
        // 如果 WebView 还未准备好，延迟重试
        Thread {
          Thread.sleep(100)
          setupThemeBridgeWithRetry(attempt + 1)
        }.start()
      }
    }
  }

  /**
   * 设置 JavaScript Bridge 用于主题同步
   */
  private fun setupThemeBridge() {
    runOnUiThread {
      val webView = findWebView()
      webView?.addJavascriptInterface(ThemeBridge(), "AndroidTheme")
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
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // Android 11+ 使用新 API
      window.insetsController?.let { controller ->
        if (isDark) {
          // 深色主题：使用浅色图标
          controller.setSystemBarsAppearance(
            0,
            WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or 
            WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
          )
        } else {
          // 浅色主题：使用深色图标
          controller.setSystemBarsAppearance(
            WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or 
            WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
            WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or 
            WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
          )
        }
      }
    } else {
      // Android 10 及以下使用旧 API
      val controller = WindowCompat.getInsetsController(window, window.decorView)
      controller.isAppearanceLightStatusBars = !isDark
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        controller.isAppearanceLightNavigationBars = !isDark
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
}
