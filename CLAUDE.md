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
- **日志**: react-native-logs (统一日志管理)
- **Lint**: ESLint 使用 eslint-config-expo

### 目录结构

本项目采用"就近原则"(Colocation)组织代码,页面相关的组件放在页面目录下,只有全局共享的组件才放在 components 文件夹中。

- **app/**: Expo Router 文件路由目录
  - `_layout.tsx`: 根布局,配置主题和导航栈
  - `(tabs)/`: 标签导航组
    - `_layout.tsx`: 标签布局配置
    - `discover/`: 发现页面 (原 index.tsx)
      - `index.tsx`: 页面主文件
      - `_components/`: 页面专属组件 (下划线前缀避免被 Expo Router 识别为路由)
        - `model-card.tsx`: 模型卡片组件
    - `create/`: AI 创作页面
      - `index.tsx`: 页面主文件
      - `_components/`: 页面专属组件 (下划线前缀避免被 Expo Router 识别为路由)
        - `welcome-section.tsx`: 欢迎区域
        - `example-prompts.tsx`: 示例提示词
        - `prompt-input.tsx`: 输入框组件
        - `style-selector.tsx`: 风格选择器
        - `generation-button.tsx`: 生成按钮
    - `profile.tsx`: 个人中心页面
  - `modal.tsx`: 模态页面示例

- **components/**: 全局共享组件
  - `ui/`: UI 基础组件
    - `icon-symbol.tsx`: 跨平台图标组件
    - `icon-symbol.ios.tsx`: iOS 平台特定图标实现
    - `collapsible.tsx`: 可折叠组件
  - `error-boundary/`: 全局错误边界组件
    - `index.tsx`: 错误捕获逻辑
    - `types.ts`: 类型定义
  - `themed-*.tsx`: 主题化组件 (支持亮暗模式)
  - `search-bar.tsx`: 搜索栏组件
  - `haptic-tab.tsx`: 带触觉反馈的标签栏按钮

- **config/**: 配置文件
  - `env.ts`: 环境变量配置
  - `api.ts`: API 配置和端点定义

- **constants/**: 常量定义
  - `theme.ts`: 颜色主题和字体定义 (包含亮暗模式配置)
  - `mock-data.ts`: Mock 数据

- **hooks/**: 自定义 React Hooks
  - `use-color-scheme.ts`: 颜色模式检测 hook
  - `use-color-scheme.web.ts`: Web 平台特定实现
  - `use-theme-color.ts`: 主题颜色 hook

- **services/**: 服务层
  - `http/`: HTTP 客户端
    - `client.ts`: 统一的 HTTP 请求封装
  - `api/`: API 服务
    - `gallery.ts`: 画廊相关 API
  - `index.ts`: 服务统一导出

- **styles/**: 样式工具
  - `mixins.ts`: 可复用样式混入
  - `shadows.ts`: 阴影样式库

- **types/**: TypeScript 类型定义
  - `api/`: API 相关类型
    - `common.ts`: 通用 API 类型
    - `gallery.ts`: 画廊 API 类型
  - `models/`: 数据模型类型
    - `gallery.ts`: 画廊模型类型
  - `global.d.ts`: 全局类型声明
  - `index.ts`: 类型统一导出

- **utils/**: 工具函数
  - `platform.ts`: 平台检测工具
  - `logger.ts`: 统一日志模块

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

## 双UI开发规范

### 核心原则
- **逻辑统一，视觉分离** - 业务逻辑100%共享，UI样式平台化
- **交互一致，视觉差异** - 相同的功能逻辑，平台原生的视觉风格

### 开发模式
```typescript
// 1. 业务逻辑Hook (共享)
function useComponentLogic(props) {
  // 所有状态管理和业务逻辑
  return { state, handlers };
}

// 2. 平台特定实现
// component.ios.tsx - iOS风格
// component.android.tsx - Android风格
// index.tsx - Platform.select()自动选择
```

### 设计规范
- **iOS**: Apple HIG风格，毛玻璃效果，SF Symbols，细腻阴影
- **Android**: Material Design 3，Ripple效果，Material Icons，Elevation阴影

### 文件组织
```
components/
├── component-name/        # 组件专用文件夹
│   ├── index.tsx          # 统一入口 (Platform.select)
│   ├── android/           # Android 平台特定代码
│   │   └── component.tsx  # Android版本实现
│   ├── ios/               # iOS 平台特定代码
│   │   └── component.tsx  # iOS版本实现
│   └── types.ts           # 共享类型定义
```

### 组件命名规范

- **禁止下划线前缀**: 在 `components/` 目录中不允许使用下划线 `_` 开头的文件名
- **页面组件组织**: 页面专属组件应直接放在页面目录下的 `components/` 文件夹中（不使用下划线前缀）
- **推荐结构**: 使用 `android/` 和 `ios/` 文件夹组织平台特定代码，而非 `.ios.tsx` 和 `.android.tsx` 后缀

### 适配原则
- **小屏** (≤375px): 间距缩小10%，字体缩小5%
- **标准** (390px): 基准设计
- **大屏** (≥430px): 间距增大10%，保持内容密度

## 开发注意事项

1. **路由**: 在 `app/` 目录添加新页面时,Expo Router 会自动生成路由
2. **类型安全**: 启用了类型化路由,使用 `href` 时会有类型提示
3. **生成文件**: `expo-env.d.ts` 和 `.expo/` 目录是自动生成的,已被 git 忽略
4. **原生目录**: `/ios` 和 `/android` 目录会在构建时生成,不要提交到版本控制
5. **主题化**: 新组件应考虑支持亮暗模式,使用 `useColorScheme()` 和 `Colors` 常量
6. **触觉反馈**: iOS 交互可使用 `expo-haptics` 提供反馈
7. **平台差异**: 新组件必须提供iOS和Android两个版本，确保功能逻辑完全一致
8. **日志规范**: 禁止使用 `console.*`，必须使用 `logger` 模块（从 `@/utils/logger` 导入）。使用合适的日志级别：`debug` 用于调试信息、`info` 用于业务流程、`warn` 用于警告、`error` 用于错误。开发环境显示所有日志，生产环境仅输出 error 级别，ESLint 已配置强制检查（scripts 目录除外）

## UI 实现模式

### Stretchy Header（可拉伸头部）
**实现原理**：图片绝对定位在底层（zIndex: 1），透明 ScrollView 覆盖其上（zIndex: 2），导航栏固定在最顶层（zIndex: 100），通过监听 scrollY 并用 Animated.interpolate 动态调整图片高度，实现下拉时图片拉伸填充空白的效果。参考实现：`app/model/components/model-detail/ios/model-detail.tsx`

## 状态管理架构

**状态管理原则**：
- 页面状态：使用 `useState` 管理简单的UI状态
- 跨组件状态：使用 `use-immer` hook 管理复杂业务逻辑，避免 prop drilling
- 异步操作：使用 `useAsyncController` hook 处理取消操作，防止内存泄漏
- 错误处理：使用 `error-handler` 工具统一分类和记录错误

**Store 使用模式**：
```typescript
// 标准状态管理模式
export const useXxxStore = () => {
  const [state, updateState] = useImmer(initialState);

  const someAction = useCallback(async (...args) => {
    const controller = createController(); // 创建取消控制器

    try {
      updateState(draft => {
        draft.loading = true;
        draft.error = null;
      });

      const result = await apiCall(...args, controller);

      updateState(draft => {
        draft.data = result;
        draft.loading = false;
      });
    } catch (error) {
      const errorInfo = categorizeError(error);
      updateState(draft => {
        draft.loading = false;
        draft.error = errorInfo.message;
      });
      logError(error, 'XxxStore.someAction');
    }
  }, [createController, updateState]);

  return {
    ...state,
    someAction,
    // 其他 actions...
  };
};
```
