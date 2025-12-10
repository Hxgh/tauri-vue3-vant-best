<template>
  <MainLayout
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="键盘抬起测试"
  >
    <template #header-left>
      <van-icon name="arrow-left" @click="goBack" />
    </template>

    <div class="keyboard-test-page">
      <div class="hero safe-area-horizontal">
        <div class="hero-title">
          <div class="hero-label">键盘 & 安全区域</div>
          <h2>键盘抬起测试</h2>
          <p>聚焦输入框时，观察底部 padding 是否跟随键盘高度 (--skb)。</p>
        </div>
        <van-tag :type="keyboardVisible ? 'success' : 'primary'">
          {{ keyboardVisible ? '键盘已弹出' : '等待键盘' }}
        </van-tag>
      </div>

      <div class="section">
        <van-cell-group inset title="实时状态">
          <van-cell title="键盘高度 (--skb)" :value="keyboardHeightDisplay" />
          <van-cell
            title="键盘状态"
            :value="keyboardVisible ? '已弹出' : '未弹出'"
            label="由原生注入 CSS 变量并驱动 MainLayout padding"
          />
          <van-cell title="当前焦点" :value="activeField" />
        </van-cell-group>
      </div>

      <div class="section">
        <van-cell-group inset title="控制选项">
          <van-cell title="启用粘性底部输入">
            <template #right-icon>
              <van-switch v-model="stickyEnabled" size="20px" />
            </template>
          </van-cell>
        </van-cell-group>

        <van-cell-group inset title="模式说明" class="section-top-gap">
          <van-cell>
            <template #title>
              <div class="info-list">
                <p>粘性模式：底部区域随 --skb 抬起，适合底部操作栏</p>
                <p>流式模式：随内容滚动，scrollIntoView 辅助保持可见</p>
                <p>键盘高度由原生注入 `--skb`，内容 padding 统一处理</p>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <div class="section">
        <van-cell-group inset title="表单输入（滚动区域）">
          <van-field
            v-model="form.receiver"
            label="收件人"
            placeholder="聚焦看看底部是否抬起"
            @focus="handleFocus('收件人', $event)"
            @blur="handleBlur"
          />
          <van-field
            v-model="form.phone"
            type="digit"
            label="手机号"
            placeholder="键盘弹出不应遮挡输入"
            @focus="handleFocus('手机号', $event)"
            @blur="handleBlur"
          />
          <van-field
            v-model="form.note"
            type="textarea"
            rows="1"
            autosize
            label="备注"
            placeholder="长文输入体验"
            @focus="handleFocus('备注', $event)"
            @blur="handleBlur"
          />
        </van-cell-group>
      </div>

      <div class="section">
        <van-cell-group inset title="滚动列表">
          <van-cell
            v-for="i in 8"
            :key="i"
            :title="`条目 ${i}`"
            label="键盘弹出时仍可滚动"
          />
        </van-cell-group>
      </div>

      <div
        class="panel safe-area-horizontal"
        :class="stickyEnabled ? 'sticky-panel' : 'flow-panel'"
      >
        <div class="panel-header">
          <div class="panel-title">底部输入区域</div>
          <span class="panel-tip">
            {{ stickyEnabled ? '粘性模式' : '随内容滚动' }}
          </span>
        </div>
        <van-field
          v-model="quickMessage"
          type="textarea"
          rows="1"
          autosize
          placeholder="键盘弹出时，这块区域会随 --skb 上移"
          @focus="handleFocus('底部输入框', $event)"
          @blur="handleBlur"
        />
        <van-button type="primary" block @click="sendMessage">
          发送
        </van-button>
        <p class="panel-desc">
          {{ stickyEnabled
            ? '模式：粘性，底部间距由安全区处理（--skb 由 MainLayout 统一抬起）'
            : '模式：常规，随列表滚动，可测试非粘性场景'
          }}
        </p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ContentStart,
  HeaderMode,
  MainLayout,
  TabbarMode,
} from '@/core/layout';

const router = useRouter();
const form = reactive({
  receiver: '',
  phone: '',
  note: '',
});
const quickMessage = ref('');
const activeField = ref('无');
const keyboardHeight = ref('0px');
const keyboardObserver = ref<MutationObserver | null>(null);
const stickyEnabled = ref(true);

const keyboardHeightDisplay = computed(
  () => keyboardHeight.value?.trim() || '0px',
);
const keyboardVisible = computed(
  () => Number.parseFloat(keyboardHeightDisplay.value) > 0,
);

function goBack() {
  router.back();
}

function updateKeyboardHeight() {
  if (typeof window === 'undefined') return;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--skb')
    .trim();
  keyboardHeight.value = value || '0px';
}

function handleFocus(field: string, event?: FocusEvent) {
  activeField.value = field;
  updateKeyboardHeight();

  // 流式模式下，确保当前输入滚动到可视区域（避免被键盘遮挡）
  if (!stickyEnabled.value && event?.target instanceof HTMLElement) {
    const target = event.target as HTMLElement;
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }
}

function handleBlur() {
  activeField.value = '无';
  setTimeout(updateKeyboardHeight, 50);
}

function sendMessage() {
  if (!quickMessage.value.trim()) {
    showToast('请输入要发送的文字');
    return;
  }
  showToast(`发送成功：${quickMessage.value}`);
  quickMessage.value = '';
}

function handleGlobalFocusChange() {
  updateKeyboardHeight();
}

onMounted(() => {
  updateKeyboardHeight();

  keyboardObserver.value = new MutationObserver(updateKeyboardHeight);
  keyboardObserver.value.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
  });

  window.addEventListener('resize', updateKeyboardHeight);
  window.addEventListener('focusin', handleGlobalFocusChange);
  window.addEventListener('focusout', handleGlobalFocusChange);
});

onUnmounted(() => {
  keyboardObserver.value?.disconnect();
  window.removeEventListener('resize', updateKeyboardHeight);
  window.removeEventListener('focusin', handleGlobalFocusChange);
  window.removeEventListener('focusout', handleGlobalFocusChange);
});
</script>

<style scoped>
.keyboard-test-page {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
  padding: 16px 0 24px;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-primary);
  margin: 0 0 16px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: var(--shadow-light);
  gap: 12px;
}

.hero-title h2 {
  margin: 4px 0 8px;
  font-size: 22px;
  color: var(--color-text-primary);
}

.hero-title p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.hero-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  letter-spacing: 0.2px;
}

.section {
  margin: 12px 16px 0;
}

.section-top-gap {
  margin-top: 12px;
}

.info-list p {
  margin: 6px 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.keyboard-test-page :deep(.van-cell-group) {
  margin-bottom: 16px;
}

.panel {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-light);
}

.sticky-panel {
  position: sticky;
  bottom: 0;
  margin: 16px 0 0;
  /* 底部间距只跟随安全区域，--skb 已由 MainLayout 内容 padding 统一处理，避免双重抬升 */
  padding-bottom: calc(12px + max(env(safe-area-inset-bottom), 20px));
  z-index: 10;
}

.flow-panel {
  position: relative;
  margin: 16px 0 24px;
  padding-bottom: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-weight: 600;
  color: var(--color-text-primary);
}

.panel-tip {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.panel-desc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}
</style>
