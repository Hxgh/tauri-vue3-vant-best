<template>
  <MainLayout 
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="详情页示例"
  >
    <template #header-left>
      <van-icon name="arrow-left" @click="goBack" />
    </template>

    <div class="detail-page">
      <div class="header-info">
        <van-tag type="primary">测试页面</van-tag>
        <h2>标准详情页布局</h2>
        <p class="subtitle">有 Header + 无 Tabbar</p>
      </div>

      <van-cell-group inset title="布局配置">
        <van-cell title="HeaderMode" value="Standard" />
        <van-cell title="ContentStart" value="BelowHeader" />
        <van-cell title="TabbarMode" value="None" label="二级页面标准配置" />
      </van-cell-group>

      <van-cell-group inset title="特性说明">
        <van-cell>
          <template #title>
            <div class="feature-text">
              <p>✅ 内容从 Header 下方开始</p>
              <p>✅ 底部留出安全区域</p>
              <p>✅ 没有 Tabbar</p>
              <p>✅ 适用于详情页、表单页、编辑页</p>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="示例内容">
        <van-cell title="商品名称" value="测试商品" />
        <van-cell title="价格" value="¥299.00" />
        <van-cell title="库存" value="999" />
        <van-cell title="销量" value="1234" />
      </van-cell-group>

      <van-cell-group inset title="滚动测试">
        <van-cell 
          v-for="i in 15" 
          :key="i" 
          :title="`列表项 ${i}`" 
          :value="`值 ${i}`"
        />
      </van-cell-group>

      <FixedBottom>
        <div class="action-buttons safe-area-horizontal">
          <van-button type="primary" block @click="showToast('加入购物车')">
            加入购物车
          </van-button>
          <van-button type="danger" block @click="showToast('立即购买')">
            立即购买
          </van-button>
        </div>
      </FixedBottom>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { useRouter } from 'vue-router';
import FixedBottom from '@/components/FixedBottom.vue';
import {
  ContentStart,
  HeaderMode,
  MainLayout,
  TabbarMode,
} from '@/core/layout';

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<style scoped>
.detail-page {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
  /* 底部留出 FixedBottom 组件的空间 */
  padding-bottom: 76px;
}

.header-info {
  background: var(--color-bg-primary);
  padding: 24px;
  text-align: center;
}

.header-info h2 {
  margin: 12px 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 4px 0;
}

.feature-text p {
  margin: 8px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 12px;
}
</style>




