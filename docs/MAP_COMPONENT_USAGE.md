# MapNavigationButton 组件使用指南

## 概述

`MapNavigationButton` 是一个可复用的地图导航组件，允许用户用任意内容（按钮、文字等）包裹，点击时呼出地图应用选择列表。

## 特性

- ✅ 支持多个地图应用（高德、百度、腾讯）
- ✅ 自动 Fallback 到网页版（未安装时）
- ✅ 跨平台支持（Android / iOS / 桌面端）
- ✅ 灵活的插槽设计，支持自定义内容
- ✅ 使用 Vant ActionSheet 展示地图列表

## 基础用法

### 最简单的用法

```vue
<script setup lang="ts">
import MapNavigationButton from '@/components/MapNavigationButton.vue';
</script>

<template>
  <MapNavigationButton
    :lat="30.660479"
    :lng="104.065762"
    name="成都天府广场"
  >
    <button>打开地图</button>
  </MapNavigationButton>
</template>
```

### 使用 Vant 按钮

```vue
<MapNavigationButton
  :lat="30.660479"
  :lng="104.065762"
  name="成都天府广场"
>
  <van-button type="primary" size="small">
    导航
  </van-button>
</MapNavigationButton>
```

### 自定义内容

```vue
<MapNavigationButton
  :lat="30.660479"
  :lng="104.065762"
  name="成都天府广场"
>
  <span style="color: #1989fa; cursor: pointer;">
    点击查看地图 →
  </span>
</MapNavigationButton>
```

### 在列表中使用

```vue
<script setup lang="ts">
import MapNavigationButton from '@/components/MapNavigationButton.vue';

const locations = [
  { name: '成都天府广场', lat: 30.660479, lng: 104.065762 },
  { name: '西安钟楼', lat: 34.260493, lng: 108.944309 },
  { name: '北京天安门', lat: 39.904214, lng: 116.407394 },
];
</script>

<template>
  <van-cell-group inset title="位置列表">
    <van-cell
      v-for="location in locations"
      :key="location.name"
      :title="location.name"
    >
      <template #right-icon>
        <MapNavigationButton
          :lat="location.lat"
          :lng="location.lng"
          :name="location.name"
        >
          <van-button size="small" type="primary">
            导航
          </van-button>
        </MapNavigationButton>
      </template>
    </van-cell>
  </van-cell-group>
</template>
```

## Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| lat | number | ✅ | 目的地纬度 |
| lng | number | ✅ | 目的地经度 |
| name | string | ✅ | 目的地名称 |

## 工作流程

1. 用户点击组件包裹的内容
2. 弹出 ActionSheet 显示可用的地图应用列表
3. 用户选择一个地图应用
4. 组件调用 Tauri 后端的 `open_map_navigation` 命令
5. 后端尝试唤起原生地图应用
6. 如果未安装，自动打开网页版

## 后端支持

组件依赖于 Rust 后端的 `open_map_navigation` 命令，该命令：

- **Android**：使用 Intent 唤起地图应用
- **iOS**：使用 UIApplication 打开地图 Scheme
- **桌面端**：直接打开网页版

### 支持的地图应用

| 地图 | 原生 Scheme | 网页版 |
|------|-----------|--------|
| 高德地图 | `androidamap://` / `iosamap://` | https://uri.amap.com |
| 百度地图 | `baidumap://` | https://map.baidu.com |
| 腾讯地图 | `qqmap://` | https://apis.map.qq.com |

## Hook 使用

如果需要更细粒度的控制，可以直接使用 `useMapNavigation` Hook：

```vue
<script setup lang="ts">
import { useMapNavigation } from '@/composables/useMapNavigation';

const { loading, mapApps, handleMapSelect } = useMapNavigation(
  30.660479,  // lat
  104.065762, // lng
  '成都天府广场' // name
);

const selectMap = async (mapType: 'amap' | 'baidu' | 'tencent') => {
  await handleMapSelect(mapType);
};
</script>

<template>
  <div>
    <button
      v-for="app in mapApps"
      :key="app.value"
      @click="selectMap(app.value)"
      :disabled="loading"
    >
      {{ app.label }}
    </button>
  </div>
</template>
```

## 常见问题

### Q: 如何检查 Android 是否安装了某个地图应用？

A: 当前实现会在调用时自动检测。如果应用未安装，会自动 Fallback 到网页版。

### Q: 支持自定义地图应用吗？

A: 可以。修改 `useMapNavigation.ts` 中的 `MAP_APPS` 数组来添加新的地图应用。

### Q: 如何处理地图导航失败？

A: 组件会自动显示 Toast 提示。可以通过修改 `openMapNavigation` 函数来自定义错误处理。

## 技术实现

- **组件**：`src/components/MapNavigationButton.vue`
- **Hook**：`src/composables/useMapNavigation.ts`
- **后端**：`src-tauri/src/lib.rs` 中的 `open_map_navigation` 命令

## 相关文件

- 后端实现：`src-tauri/src/lib.rs`
- 类型定义：`src/types/tauri.d.ts`
- 原始测试页面：`src/pages/test/MapTestPage.vue`
