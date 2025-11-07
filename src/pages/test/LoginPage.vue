<template>
  <MainLayout 
    :header-mode="HeaderMode.None"
    :content-start="ContentStart.ScreenTop"
    :tabbar-mode="TabbarMode.Immersive"
  >
    <div class="login-page">
      <!-- 使用沉浸式导航栏（白色文字，适配紫色渐变背景） -->
      <ImmersiveNavbar>
        <template #left>
          <van-icon name="arrow-left" size="20" color="white" />
        </template>
        <template #title>
          <span style="color: white;">登录</span>
        </template>
      </ImmersiveNavbar>

      <div class="login-header">
        <div class="logo-placeholder">
          <van-icon name="user-circle-o" size="80" />
        </div>
        <h1>登录页示例</h1>
        <p class="subtitle">无 Header + 无 Tabbar</p>
      </div>

      <div class="login-form safe-area-horizontal">
        <van-cell-group inset title="布局配置" style="margin-bottom: 16px;">
          <van-cell title="HeaderMode" value="None" />
          <van-cell title="ContentStart" value="ScreenTop" />
          <van-cell title="TabbarMode" value="Immersive" label="完全沉浸式" />
        </van-cell-group>

        <van-cell-group inset title="特性说明" style="margin-bottom: 24px;">
          <van-cell>
            <template #title>
              <div class="feature-text">
                <p>✅ 无导航栏，完全自定义</p>
                <p>✅ 背景延伸到屏幕顶部</p>
                <p>✅ 关键元素遵守安全区域</p>
                <p>✅ 适用于登录、引导、错误页</p>
              </div>
            </template>
          </van-cell>
        </van-cell-group>

        <van-cell-group inset>
          <van-field
            v-model="username"
            label="用户名"
            placeholder="请输入用户名"
            left-icon="user-o"
          />
          <van-field
            v-model="password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            left-icon="lock"
          />
        </van-cell-group>

        <div class="login-actions">
          <van-button type="primary" block @click="handleLogin">
            登录
          </van-button>
          <van-button block @click="showToast('注册功能')">
            注册账号
          </van-button>
        </div>

        <div class="other-login">
          <p>其他登录方式</p>
          <div class="social-icons">
            <van-icon name="wechat" size="32" @click="showToast('微信登录')" />
            <van-icon name="qq" size="32" @click="showToast('QQ登录')" />
            <van-icon name="weibo" size="32" @click="showToast('微博登录')" />
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';
import MainLayout from '@/layouts/MainLayout.vue';
import ImmersiveNavbar from '@/components/ImmersiveNavbar.vue';
import { HeaderMode, ContentStart, TabbarMode } from '@/types/layout';

const username = ref('');
const password = ref('');

function handleLogin() {
  if (!username.value || !password.value) {
    showToast('请输入用户名和密码');
    return;
  }
  showToast('登录成功');
  setTimeout(() => {
    router.back();
  }, 1000);
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 0 24px;
}

.login-header {
  text-align: center;
  padding: 40px 0;
  color: white;
}

.logo-placeholder {
  margin-bottom: 24px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 8px 0;
}

.login-form {
  background: var(--color-bg-primary);
  border-radius: 24px 24px 0 0;
  padding: 24px 16px;
  min-height: 50vh;
  /* LoginPage 使用完全沉浸式（Immersive），需要手动处理底部安全区域 */
  padding-bottom: calc(24px + max(env(safe-area-inset-bottom), 20px));
}

.feature-text p {
  margin: 8px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.login-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.other-login {
  margin-top: 40px;
  text-align: center;
}

.other-login p {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 32px;
  color: var(--color-text-primary);
}

.social-icons .van-icon {
  cursor: pointer;
}
</style>




