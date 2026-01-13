<script setup lang="ts">
/**
 * 图片选择器测试页面
 * 演示 useImagePicker 的基础用法和压缩功能
 */
import { useRouter } from 'vue-router';
import { MainLayout, HeaderMode, ContentStart, TabbarMode } from '@/core/layout';
import { useImagePicker } from '@/core/image-picker';

const router = useRouter();

// 基础用法（不压缩）
const basicPicker = useImagePicker({ maxCount: 3 });

// 带压缩（默认 300KB）
const compressPicker = useImagePicker({ maxCount: 3, compress: true });

// 格式化文件大小
const formatSize = (size: number) =>
  size > 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(2)} MB`
    : `${(size / 1024).toFixed(1)} KB`;
</script>

<template>
  <MainLayout
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="图片选择器"
  >
    <template #header-left>
      <van-icon name="arrow-left" size="20" @click="router.back()" />
    </template>

    <div class="page-content safe-area-horizontal">
      <!-- 基础用法 -->
      <van-cell-group inset title="基础用法（不压缩）">
        <van-cell>
          <van-uploader v-bind="basicPicker.uploaderProps.value" />
        </van-cell>
        <van-cell
          v-for="(item, i) in basicPicker.fileList.value"
          :key="i"
          :title="item.file?.name || '未知'"
          :value="formatSize(item.file?.size || 0)"
        />
      </van-cell-group>

      <!-- 带压缩 -->
      <van-cell-group inset title="带压缩（目标 300KB）" style="margin-top: 16px">
        <van-cell>
          <van-uploader v-bind="compressPicker.uploaderProps.value" />
        </van-cell>
        <van-cell
          v-for="(item, i) in compressPicker.fileList.value"
          :key="i"
          :title="item.file?.name || '未知'"
          :value="formatSize(item.file?.size || 0)"
        />
      </van-cell-group>

      <!-- 操作 -->
      <div style="margin-top: 24px">
        <van-button
          type="primary"
          block
          @click="basicPicker.reset(); compressPicker.reset()"
        >
          清空所有图片
        </van-button>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.page-content {
  padding: 16px;
}
</style>
