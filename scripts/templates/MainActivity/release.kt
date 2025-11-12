package com.express.app

import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsetsController
import android.webkit.JavascriptInterface
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
    
    // 生产模式：使用打包的本地资源（无热更新）
    // Tauri 会自动加载 dist 目录中的资源
    
    // 异步设置 Bridge（带重试机制，减少延迟）
    Thread {
      Thread.sleep(200)
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
        val mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or 
                   WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
        
        if (isDark) {
          // 深色主题：使用浅色图标（清除 LIGHT 标志）
          android.util.Log.d("MainActivity", "Setting system bars to dark theme (light icons)")
          controller.setSystemBarsAppearance(0, mask)
        } else {
          // 浅色主题：使用深色图标（设置 LIGHT 标志）
          android.util.Log.d("MainActivity", "Setting system bars to light theme (dark icons)")
          controller.setSystemBarsAppearance(mask, mask)
        }
      }
    } else {
      // Android 10 及以下使用旧 API
      val controller = WindowCompat.getInsetsController(window, window.decorView)
      controller.isAppearanceLightStatusBars = !isDark
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        controller.isAppearanceLightNavigationBars = !isDark
      }
      android.util.Log.d("MainActivity", "Setting system bars (legacy API): isDark=$isDark")
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
