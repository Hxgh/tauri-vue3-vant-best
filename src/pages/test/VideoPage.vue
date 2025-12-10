<template>
  <MainLayout 
    :header-mode="HeaderMode.None"
    :content-start="ContentStart.ScreenTop"
    :tabbar-mode="TabbarMode.Immersive"
  >
    <div class="video-page">
      <!-- 视频播放器占位 -->
      <div class="video-player">
        <van-icon name="play-circle-o" size="64" color="#fff" />
        <p>视频播放器</p>
      </div>

      <!-- 使用沉浸式导航栏（白色文字，适配视频深色背景） -->
      <ImmersiveNavbar>
        <template #left>
          <van-icon name="arrow-left" size="20" color="white" />
        </template>
        <template #title>
          <span style="color: white;">完全沉浸式布局</span>
        </template>
        <template #right>
          <van-icon name="ellipsis" size="20" color="white" />
        </template>
      </ImmersiveNavbar>

      <!-- 使用沉浸式底部栏 -->
      <ImmersiveBottomBar>
        <div class="bottom-controls-wrapper">
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${progress}%` }"></div>
          </div>
          
          <div class="control-buttons">
            <van-icon name="play" size="24" color="white" @click="togglePlay" />
            <span class="time">00:30 / 05:20</span>
            <van-icon name="volume-o" size="20" color="white" @click="showToast('音量')" />
            <van-icon name="full-screen" size="20" color="white" @click="showToast('全屏')" />
          </div>
        </div>
      </ImmersiveBottomBar>

      <!-- 信息面板 -->
      <van-popup
        v-model:show="showInfo"
        position="bottom"
        round
        :style="{ padding: '16px' }"
      >
        <div class="info-panel">
          <h3>布局配置</h3>
          <van-cell-group inset>
            <van-cell title="HeaderMode" value="None" />
            <van-cell title="ContentStart" value="ScreenTop" />
            <van-cell title="TabbarMode" value="Immersive" />
          </van-cell-group>

          <van-cell-group inset title="特性说明" style="margin-top: 12px;">
            <van-cell>
              <template #title>
                <div class="feature-text">
                  <p>✅ 内容从屏幕顶部(0,0)开始</p>
                  <p>✅ 内容延伸到屏幕底部</p>
                  <p>✅ 需要手动处理安全区域</p>
                  <p>✅ 适用于视频播放、游戏</p>
                </div>
              </template>
            </van-cell>
          </van-cell-group>

          <van-button type="primary" block @click="showInfo = false">
            关闭
          </van-button>
        </div>
      </van-popup>

      <!-- 悬浮信息按钮 -->
      <div class="info-button" @click="showInfo = true">
        <van-icon name="info-o" size="20" />
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { ref } from 'vue';
import ImmersiveBottomBar from '@/components/ImmersiveBottomBar.vue';
import ImmersiveNavbar from '@/components/ImmersiveNavbar.vue';
import {
  ContentStart,
  HeaderMode,
  MainLayout,
  TabbarMode,
} from '@/core/layout';

const progress = ref(30);
const showInfo = ref(false);

function togglePlay() {
  showToast('播放/暂停');
}
</script>

<style scoped>
.video-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.video-player p {
  margin-top: 16px;
  font-size: 18px;
  opacity: 0.8;
}

/* 顶部导航栏已使用 ImmersiveNavbar 组件 */
/* 底部控制栏已使用 ImmersiveBottomBar 组件 */

.bottom-controls-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: white;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #1989fa;
  transition: width 0.3s;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.time {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: white;
}

.info-button {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 99;
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}

.info-panel {
  padding: 8px;
}

.info-panel h3 {
  margin: 0 0 16px;
  font-size: 18px;
  text-align: center;
  color: var(--color-text-primary);
}

.feature-text p {
  margin: 8px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}
</style>




