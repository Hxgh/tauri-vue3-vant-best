<template>
  <MainLayout
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="通知测试"
  >
    <template #header-left>
      <van-icon name="arrow-left" @click="goBack" />
    </template>

    <div class="notification-test-page">
      <van-cell-group inset title="权限状态">
        <van-cell title="通知权限" :value="permissionGranted ? '已授权' : '未授权'" />
        <van-cell
          title="检查权限"
          is-link
          @click="handleCheckPermission"
        />
        <van-cell
          title="请求权限"
          is-link
          :loading="loading"
          @click="handleRequestPermission"
        />
      </van-cell-group>

      <van-cell-group inset title="发送通知" style="margin-top: 16px;">
        <van-cell
          title="简单通知（仅标题）"
          is-link
          @click="sendSimple"
        />
        <van-cell
          title="完整通知（标题+内容）"
          is-link
          @click="sendWithBody"
        />
      </van-cell-group>

      <van-cell-group inset title="功能说明" style="margin-top: 16px;">
        <van-cell title="支持平台" value="Android / iOS / Desktop" />
        <van-cell title="权限要求" value="需用户授权" />
        <van-cell title="点击通知" value="打开应用" />
      </van-cell-group>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import MainLayout from '@/layouts/MainLayout.vue';
import { useNotification } from '@/composables/useNotification';
import { ContentStart, HeaderMode, TabbarMode } from '@/types/layout';

const router = useRouter();
const { permissionGranted, loading, checkPermission, requestPermission, send } = useNotification();

onMounted(() => {
  checkPermission();
});

function goBack() {
  router.back();
}

async function handleCheckPermission() {
  const granted = await checkPermission();
  showToast(granted ? '已授权' : '未授权');
}

async function handleRequestPermission() {
  const granted = await requestPermission();
  showToast(granted ? '授权成功' : '授权失败');
}

async function sendSimple() {
  try {
    await send({ title: '测试通知' });
    showToast('通知已发送');
  } catch (error) {
    showToast('发送失败: ' + (error as Error).message);
  }
}

async function sendWithBody() {
  try {
    await send({
      title: '测试通知',
      body: '这是一条来自 Tauri 应用的通知消息'
    });
    showToast('通知已发送');
  } catch (error) {
    showToast('发送失败: ' + (error as Error).message);
  }
}
</script>

<style scoped>
.notification-test-page {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
  padding: 16px;
  padding-bottom: calc(16px + max(env(safe-area-inset-bottom), 20px));
}
</style>
