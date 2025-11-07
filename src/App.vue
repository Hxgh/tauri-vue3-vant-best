<template>
  <div id="app">
    <!-- 路由视图：每个页面自己决定布局 -->
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
// App.vue 现在只是一个根容器
// 所有布局逻辑由各个页面自己决定
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>
