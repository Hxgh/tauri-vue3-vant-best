package com.express.app

import android.content.res.Configuration
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
    // 初始化时应用系统栏颜色
    updateSystemBars()
  }
  
  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    
    // 系统主题变化时更新系统栏颜色
    updateSystemBars()
  }
  
  private fun updateSystemBars() {
    val isDarkMode = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
    
    window?.let { window ->
      // 设置系统栏颜色为透明
      window.statusBarColor = android.graphics.Color.TRANSPARENT
      window.navigationBarColor = android.graphics.Color.TRANSPARENT
      
      // 根据主题设置系统栏图标颜色
      val insetsController = WindowCompat.getInsetsController(window, window.decorView)
      insetsController.isAppearanceLightStatusBars = !isDarkMode
      insetsController.isAppearanceLightNavigationBars = !isDarkMode
    }
  }
}
