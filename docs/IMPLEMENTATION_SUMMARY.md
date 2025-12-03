# 地图导航组件化实现总结

## 问题背景

原始实现中，地图调用逻辑写死在 `MapTestPage.vue` 中，使用者需要：
1. 直接调用 Tauri 的 `invoke` 命令
2. 手动处理地图应用选择
3. 无法复用地图导航功能

## 解决方案

### 核心改进

将地图导航功能拆分为两个可复用的部分：

#### 1. **useMapNavigation Hook** (`src/composables/useMapNavigation.ts`)

提供地图导航的核心逻辑，包括：

- `getMapApps()` - 获取支持的地图应用列表
- `openMapNavigation(lat, lng, name, mapType)` - 打开地图导航
- `checkMapInstalled(mapType)` - 检查地图应用是否安装
- `useMapNavigation(lat, lng, name)` - Vue 3 Composition API Hook

**特性：**
- ✅ 支持高德、百度、腾讯三个地图应用
- ✅ 自动 Fallback 到网页版（未安装时）
- ✅ 跨平台支持（Android/iOS/桌面端）
- ✅ 自动显示 Toast 提示

#### 2. **MapNavigationButton 组件** (`src/components/MapNavigationButton.vue`)

可复用的地图导航按钮组件，特点：

- 接收 `lat`, `lng`, `name` 三个 Props
- 使用 Vue 3 `<slot>` 支持自定义内容
- 点击时呼出 Vant `ActionSheet` 显示地图列表
- 用户选择后自动调用导航逻辑

### 使用示例

#### 最简单的用法

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

#### 在列表中使用

```vue
<van-cell-group>
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
```

#### 自定义内容

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

## 文件结构

```
src/
├── components/
│   └── MapNavigationButton.vue      # 地图导航按钮组件
├── composables/
│   └── useMapNavigation.ts          # 地图导航 Hook
├── pages/test/
│   └── MapTestPage.vue              # 更新了使用示例
└── types/
    └── tauri.d.ts                   # Tauri 命令类型定义

docs/
└── MAP_COMPONENT_USAGE.md           # 详细使用文档

src-tauri/
└── src/lib.rs                       # 后端实现（无需修改）
```

## 工作流程

```
用户点击组件内容
    ↓
弹出 ActionSheet 显示地图列表
    ↓
用户选择地图应用
    ↓
调用 Tauri 后端 open_map_navigation 命令
    ↓
后端尝试唤起原生地图应用
    ├─ 成功 → 打开地图导航
    └─ 失败 → 自动打开网页版
    ↓
显示 Toast 提示用户
```

## 支持的地图应用

| 地图 | 原生 Scheme | 网页版 |
|------|-----------|--------|
| 高德地图 | `androidamap://` / `iosamap://` | https://uri.amap.com |
| 百度地图 | `baidumap://` | https://map.baidu.com |
| 腾讯地图 | `qqmap://` | https://apis.map.qq.com |

## 优势对比

### 原始实现
- ❌ 逻辑写死在页面中
- ❌ 无法复用
- ❌ 使用者需要了解 Tauri 细节
- ❌ 难以维护

### 改进后
- ✅ 组件化设计，易于复用
- ✅ 使用者只需关心地点信息
- ✅ 自动处理地图应用选择和 Fallback
- ✅ 易于维护和扩展
- ✅ 支持自定义内容

## 后续优化方向

1. **地图应用检测**
   - 当前：尝试调用，失败则 Fallback
   - 优化：提前检测应用是否安装，未安装则禁用按钮

2. **自定义配置**
   - 支持动态添加/删除地图应用
   - 支持自定义 ActionSheet 样式

3. **增强功能**
   - 添加地点收藏功能
   - 支持多个目的地同时导航
   - 集成地图搜索功能

4. **性能优化**
   - 缓存地图应用检测结果
   - 预加载地图应用列表

## 测试

已在 `MapTestPage.vue` 中添加了使用示例，可以：

1. 运行 `npm run dev` 启动开发服务器
2. 导航到地图测试页面
3. 查看"MapNavigationButton 组件示例"部分
4. 点击各个地点的"导航"按钮测试功能

## 相关文档

- 详细使用指南：`docs/MAP_COMPONENT_USAGE.md`
- 原始设计文档：`todo/地图跳转能力支持.md`
- 后端实现：`src-tauri/src/lib.rs`
