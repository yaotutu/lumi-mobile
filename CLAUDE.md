# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个使用 Expo 和 React Native 构建的跨平台移动应用项目。该项目使用 Expo Router 进行文件路由,支持 iOS、Android 和 Web 平台。

## 开发命令

### 启动开发服务器
```bash
npm start                # 启动 Expo 开发服务器
npx expo start          # 等同于上面的命令
```

### 平台特定启动
```bash
npm run ios             # 在 iOS 模拟器中启动
npm run android         # 在 Android 模拟器中启动
npm run web             # 在浏览器中启动 Web 版本
```

### 代码质量
```bash
npm run lint            # 运行 ESLint 检查
```

### 项目重置
```bash
npm run reset-project   # 将示例代码移到 app-example 目录,创建空白 app 目录
```

## 项目架构

### 技术栈
- **框架**: Expo SDK ~54.0, React Native 0.81.5, React 19.1.0
- **路由**: Expo Router ~6.0 (文件路由系统)
- **导航**: React Navigation (底部标签导航)
- **语言**: TypeScript 5.9+ (启用严格模式)
- **动画**: React Native Reanimated ~4.1
- **手势**: React Native Gesture Handler ~2.28
- **图标**: Expo Symbols (iOS SF Symbols) 和 @expo/vector-icons
- **Lint**: ESLint 使用 eslint-config-expo

### 目录结构

- **app/**: Expo Router 文件路由目录
  - `_layout.tsx`: 根布局,配置主题和导航栈
  - `(tabs)/`: 标签导航组
    - `_layout.tsx`: 标签布局配置
    - `index.tsx`: 首页 (Home 标签)
    - `explore.tsx`: 探索页面
  - `modal.tsx`: 模态页面示例

- **components/**: 可复用的 React 组件
  - `ui/`: UI 基础组件
    - `icon-symbol.tsx`: 跨平台图标组件
    - `icon-symbol.ios.tsx`: iOS 平台特定图标实现
    - `collapsible.tsx`: 可折叠组件
  - `themed-*.tsx`: 主题化组件 (支持亮暗模式)
  - `haptic-tab.tsx`: 带触觉反馈的标签栏按钮

- **constants/**: 常量定义
  - `theme.ts`: 颜色主题和字体定义 (包含亮暗模式配置)

- **hooks/**: 自定义 React Hooks
  - `use-color-scheme.ts`: 颜色模式检测 hook
  - `use-color-scheme.web.ts`: Web 平台特定实现
  - `use-theme-color.ts`: 主题颜色 hook

- **assets/**: 静态资源 (图片、字体等)

- **scripts/**: 工具脚本
  - `reset-project.js`: 项目重置脚本

### 核心配置

- **TypeScript**:
  - 启用严格模式 (`strict: true`)
  - 路径别名: `@/*` 映射到项目根目录
  - 扩展 Expo 基础配置

- **Expo 配置** (app.json):
  - 启用新架构 (`newArchEnabled: true`)
  - 启用类型化路由 (`typedRoutes: true`)
  - 启用 React 编译器 (`reactCompiler: true`)
  - Android 启用边到边模式 (`edgeToEdgeEnabled: true`)

- **ESLint**: 使用 Expo 官方配置,忽略 dist 目录

### 路由系统

项目使用 Expo Router 文件路由:
- 文件名决定路由路径
- `_layout.tsx` 定义布局
- `(tabs)` 等括号包裹的目录是路由组,不影响 URL
- `modal.tsx` 等特殊页面可配置为模态显示

### 主题系统

- 支持亮暗双主题,定义在 `constants/theme.ts`
- 使用 React Navigation 的 ThemeProvider
- 组件通过 `useColorScheme()` hook 检测当前主题
- 主题颜色包括: text, background, tint, icon, tabIcon 等
- 字体系统针对 iOS、Web 和默认平台分别配置

### 平台特定代码

- 使用 `.ios.tsx`, `.android.tsx`, `.web.tsx` 后缀创建平台特定文件
- 示例: `icon-symbol.ios.tsx` 为 iOS 提供 SF Symbols 支持
- 使用 `Platform.select()` 或 `process.env.EXPO_OS` 进行平台判断

### 图标使用

- iOS: 优先使用 SF Symbols (通过 expo-symbols)
- 其他平台: 使用 @expo/vector-icons
- `IconSymbol` 组件提供跨平台抽象

## 开发注意事项

1. **路由**: 在 `app/` 目录添加新页面时,Expo Router 会自动生成路由
2. **类型安全**: 启用了类型化路由,使用 `href` 时会有类型提示
3. **生成文件**: `expo-env.d.ts` 和 `.expo/` 目录是自动生成的,已被 git 忽略
4. **原生目录**: `/ios` 和 `/android` 目录会在构建时生成,不要提交到版本控制
5. **主题化**: 新组件应考虑支持亮暗模式,使用 `useColorScheme()` 和 `Colors` 常量
6. **触觉反馈**: iOS 交互可使用 `expo-haptics` 提供反馈
