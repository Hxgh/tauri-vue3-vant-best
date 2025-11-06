package com.express.app

import android.os.Bundle
import android.webkit.WebSettings
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
    // 开发模式：延迟加载开发服务器的最新代码（支持热更新）
    Thread {
      Thread.sleep(1000)
      loadDevServer()
    }.start()
  }

  private fun loadDevServer() {
    runOnUiThread {
      val webView = findWebView()
      webView?.settings?.apply {
        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
      }
      webView?.loadUrl("http://192.168.3.81:1420")
    }
  }

  private fun findWebView(): android.webkit.WebView? {
    return findWebView(window.decorView)
  }

  private fun findWebView(view: android.view.View): android.webkit.WebView? {
    if (view is android.webkit.WebView) {
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

