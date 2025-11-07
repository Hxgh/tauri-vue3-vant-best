# 公共组件

## FixedBottom - 固定底部容器

用于详情页底部固定按钮，自动处理安全区域。

**使用示例：**
```vue
<FixedBottom>
  <van-button type="primary">提交</van-button>
</FixedBottom>
```

**特点：**
- ✅ 自动 `position: fixed` 固定在底部
- ✅ 自动处理底部安全区域
- ✅ 自动添加边框和背景色

---

## ImmersiveNavbar - 沉浸式导航栏

用于完全沉浸式页面的透明导航栏（顶部）。

**使用示例：**

```vue
<ImmersiveNavbar>
  <template #left>
    <van-icon name="arrow-left" size="20" color="white" />
  </template>
  <template #title>
    <span style="color: white;">标题</span>
  </template>
  <template #right>
    <van-icon name="ellipsis" size="20" color="white" />
  </template>
</ImmersiveNavbar>
```

**Props：**
- `title?: string` - 标题文字
- `onLeftClick?: () => void` - 左侧点击事件（默认返回）
- `onRightClick?: () => void` - 右侧点击事件

**Slots：**
- `left` - 左侧内容（默认返回图标）
- `title` - 标题内容
- `right` - 右侧内容

**特点：**
- ✅ 完全透明背景
- ✅ 自动处理顶部安全区域（刘海）
- ✅ 固定在屏幕顶部
- ✅ 通过 slot 自定义颜色和内容

**适用场景：** 登录页、视频页、图片查看器

---

## ImmersiveBottomBar - 沉浸式底部栏

用于完全沉浸式页面的透明底部栏（底部）。

**使用示例：**

```vue
<ImmersiveBottomBar>
  <div class="controls">
    <van-icon name="play" size="24" color="white" />
    <span style="color: white;">00:30 / 05:20</span>
    <van-icon name="volume-o" size="20" color="white" />
  </div>
</ImmersiveBottomBar>
```

**Slots：**
- `default` - 底部栏内容

**特点：**
- ✅ 完全透明背景
- ✅ 自动处理底部安全区域（Home 键）
- ✅ 固定在屏幕底部
- ✅ 通过 slot 自定义颜色和内容

**适用场景：** 视频页控制栏、图片查看器底部工具栏

