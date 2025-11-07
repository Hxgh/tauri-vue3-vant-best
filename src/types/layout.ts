/**
 * Layout 布局配置枚举
 * 用于精确控制 MainLayout 的布局行为
 */

/**
 * Header 模式
 */
export enum HeaderMode {
  /** 标准 Header - 在安全区域下方，Header 本身不延伸 */
  Standard = 0,
  /** 沉浸式 Header - 延伸到屏幕顶部，覆盖状态栏区域 */
  Immersive = 1,
  /** 无 Header */
  None = 2,
}

/**
 * 内容起点位置
 */
export enum ContentStart {
  /** 从 Header 下方开始（需要有 Header） */
  BelowHeader = 0,
  /** 从安全区域内开始（顶部留出状态栏高度） */
  SafeArea = 1,
  /** 从屏幕真正顶部开始（页面自行处理安全区域） */
  ScreenTop = 2,
}

/**
 * Tabbar 模式
 */
export enum TabbarMode {
  /** 标准 Tabbar - 自动处理底部安全区域（Home Indicator） */
  Standard = 0,
  /** 无 Tabbar - 内容在安全区域内结束（底部留出安全高度） */
  None = 1,
  /** 沉浸式 - 无 Tabbar，内容延伸到屏幕底部（页面自行处理） */
  Immersive = 2,
}

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  headerMode: HeaderMode;
  contentStart: ContentStart;
  tabbarMode: TabbarMode;
}

/**
 * 预设布局配置（可选使用，三个维度可以任意组合）
 * 
 * 注意：这些只是常见场景的快捷方式，
 * 你完全可以自由组合三个维度来满足任何需求！
 */
export const LayoutPresets = {
  /** 标准页面：有 Header + 有 Tabbar */
  Standard: {
    headerMode: HeaderMode.Standard,
    contentStart: ContentStart.BelowHeader,
    tabbarMode: TabbarMode.Standard,
  } as LayoutConfig,

  /** 详情页：有 Header + 无 Tabbar */
  Detail: {
    headerMode: HeaderMode.Standard,
    contentStart: ContentStart.BelowHeader,
    tabbarMode: TabbarMode.None,
  } as LayoutConfig,

  /** 无 Header 页面：无 Header + 有 Tabbar */
  NoHeader: {
    headerMode: HeaderMode.None,
    contentStart: ContentStart.SafeArea,
    tabbarMode: TabbarMode.Standard,
  } as LayoutConfig,

  /** 沉浸式 Header：Header 延伸 + 有 Tabbar */
  ImmersiveHeader: {
    headerMode: HeaderMode.Immersive,
    contentStart: ContentStart.BelowHeader,
    tabbarMode: TabbarMode.Standard,
  } as LayoutConfig,

  /** 沉浸式详情页：Header 延伸 + 无 Tabbar */
  ImmersiveDetail: {
    headerMode: HeaderMode.Immersive,
    contentStart: ContentStart.BelowHeader,
    tabbarMode: TabbarMode.None,
  } as LayoutConfig,

  /** 全屏页面：无 Header + 无 Tabbar + 内容在安全区域内 */
  SafeFullscreen: {
    headerMode: HeaderMode.None,
    contentStart: ContentStart.SafeArea,
    tabbarMode: TabbarMode.None,
  } as LayoutConfig,

  /** 完全沉浸式：从屏幕顶部到底部，页面自行处理所有安全区域 */
  FullImmersive: {
    headerMode: HeaderMode.None,
    contentStart: ContentStart.ScreenTop,
    tabbarMode: TabbarMode.Immersive,
  } as LayoutConfig,
} as const;

