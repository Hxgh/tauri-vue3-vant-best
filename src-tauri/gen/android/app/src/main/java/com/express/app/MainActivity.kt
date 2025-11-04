package com.express.app

import android.content.res.Configuration
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat

class MainActivity : TauriActivity() {
  companion object {
    private const val CHECK_INTERVAL_MS = 500L
  }
  
  private var isAutoMode = true
  private val handler = Handler(Looper.getMainLooper())
  private var lastCheckedMode: String? = null
  private var lastCheckedTheme: String? = null
  private var webView: WebView? = null
  
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
    // 延迟获取 WebView 并注入 Bridge
    handler.postDelayed({
      webView = findWebView(window.decorView)
      webView?.addJavascriptInterface(ThemeBridge(), "AndroidTheme")
      startThemeMonitoring()
    }, 500)
  }
  
  private fun findWebView(view: android.view.View): WebView? {
    if (view is WebView) return view
    if (view is android.view.ViewGroup) {
      for (i in 0 until view.childCount) {
        val found = findWebView(view.getChildAt(i))
        if (found != null) return found
      }
    }
    return null
  }
  
  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    if (isAutoMode) {
      updateSystemBars()
    }
  }
  
  private fun updateSystemBars() {
    val isDarkMode = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
    updateSystemBars(isDarkMode)
  }
  
  private fun updateSystemBars(isDarkMode: Boolean) {
    runOnUiThread {
      window?.let { window ->
        window.statusBarColor = android.graphics.Color.TRANSPARENT
        window.navigationBarColor = android.graphics.Color.TRANSPARENT
        
        val insetsController = WindowCompat.getInsetsController(window, window.decorView)
        insetsController.isAppearanceLightStatusBars = !isDarkMode
        insetsController.isAppearanceLightNavigationBars = !isDarkMode
      }
    }
  }
  
  private fun startThemeMonitoring() {
    handler.post(object : Runnable {
      override fun run() {
        checkThemeChanges()
        handler.postDelayed(this, CHECK_INTERVAL_MS)
      }
    })
  }
  
  private fun checkThemeChanges() {
    webView?.evaluateJavascript(
      "(function() { return JSON.stringify({ mode: localStorage.getItem('app-theme-mode'), theme: localStorage.getItem('app-theme-resolved') }); })()"
    ) { result ->
      try {
        val jsonStr = result?.trim('"')?.replace("\\\"", "\"") ?: return@evaluateJavascript
        val json = org.json.JSONObject(jsonStr)
        val mode = json.optString("mode", "auto")
        val theme = json.optString("theme", null)
        
        if (mode != lastCheckedMode || theme != lastCheckedTheme) {
          lastCheckedMode = mode
          lastCheckedTheme = theme
          isAutoMode = (mode == "auto")
          
          when {
            !isAutoMode && theme != null -> {
              val isDark = theme == "dark"
              updateSystemBars(isDark)
            }
            else -> updateSystemBars()
          }
        }
      } catch (e: Exception) {
        // 静默失败
      }
    }
  }
  
  inner class ThemeBridge {
    @JavascriptInterface
    fun setTheme(theme: String, mode: String) {
      isAutoMode = (mode == "auto")
      runOnUiThread {
        val isDark = theme == "dark"
        updateSystemBars(isDark)
      }
    }
  }
  
  override fun onDestroy() {
    super.onDestroy()
    handler.removeCallbacksAndMessages(null)
    webView = null
  }
}
