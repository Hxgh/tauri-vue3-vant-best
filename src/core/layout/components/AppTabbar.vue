<template>
  <van-tabbar 
    :model-value="currentTab" 
    :border="false" 
    :fixed="false"
    @update:model-value="handleTabChange"
  >
    <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
    <van-tabbar-item icon="search" to="/discover">发现</van-tabbar-item>
    <van-tabbar-item icon="setting-o" to="/settings">设置</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 根据当前路由计算 activeTab
const currentTab = computed(() => {
  const tabIndex = route.meta?.tabIndex as number;
  return tabIndex ?? 0;
});

function handleTabChange(index: number) {
  // 路由切换由 van-tabbar-item 的 to 属性自动处理
}
</script>



