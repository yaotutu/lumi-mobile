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
npm run lint:fix        # 自动修复 ESLint 问题
npm run format          # 使用 Prettier 格式化代码
npm run format:check    # 检查代码格式是否符合规范
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
- **图标**: Ionicons (来自 @expo/vector-icons，跨平台统一)
- **日志**: react-native-logs (统一日志管理)
- **状态管理**: Zustand 5.0+ (全局状态) + Immer 11.1+ (不可变更新)
- **3D渲染**: Three.js ~0.166 + expo-three ~8.0
- **键盘处理**: react-native-keyboard-controller ~1.20
- **持久化**: @react-native-async-storage/async-storage ~2.2
- **代码格式化**: Prettier 3.6+
- **Lint**: ESLint 9.25+ 使用 eslint-config-expo

### 目录结构

本项目采用"就近原则"(Colocation)组织代码,页面相关的组件放在页面目录下,只有全局共享的组件才放在 components 文件夹中。

- **app/**: Expo Router 文件路由目录
  - `_layout.tsx`: 根布局,配置主题和导航栈 (使用 `screenOptions={{ headerShown: false }}` 全局隐藏导航栏)
  - `index.tsx`: 应用入口页面 (重定向到初始路由)
  - `(tabs)/`: 标签导航组
    - `_layout.tsx`: 标签布局配置
    - `discover/`: 发现页面
      - `index.tsx`: 页面主文件
    - `create/`: AI 创作页面
      - `index.tsx`: 页面主文件
    - `task/`: AI 创作任务详情页面
      - `[id].tsx`: 动态路由页面 (配置 `href: null` 隐藏在 Tab 栏中但保持底部 Tab 可见)
    - `printer/`: 打印页面
      - `index.tsx`: 页面主文件
    - `profile.tsx`: 个人中心页面
  - `model/`: 模型详情页面
    - `[id].tsx`: 动态路由页面
  - `model-viewer/`: 3D 模型查看器页面
    - `[id].tsx`: 动态路由页面

- **components/**: 全局共享组件
  - `3d-viewer/`: 3D 模型查看器组件
    - `index.tsx`: 平台选择入口
    - `native/`: 原生平台实现 (expo-three)
    - `web/`: Web 平台实现 (WebView)
    - `components/`: 共享子组件
    - `types.ts`: 类型定义
  - `error-boundary/`: 全局错误边界组件
    - `index.tsx`: 错误捕获逻辑
    - `types.ts`: 类型定义
  - `haptic-tab/`: 带触觉反馈的标签栏按钮
    - `index.tsx`: 组件导出
    - `haptic-tab.tsx`: 统一实现
    - `types.ts`: 类型定义
  - `model-card/`: 模型卡片组件
    - `index.tsx`: 组件导出
    - `model-card.tsx`: 统一实现（使用 BlurView）
    - `card-content.tsx`: 卡片内容子组件
    - `card-actions.tsx`: 卡片操作子组件
    - `types.ts`: 类型定义
  - `model-detail/`: 模型详情组件
    - `index.tsx`: 组件导出
    - `model-detail.tsx`: 统一实现
    - `types.ts`: 类型定义
  - `search-bar/`: 搜索栏组件
    - `index.tsx`: 组件导出
    - `search-bar.tsx`: 统一实现（使用 BlurView）
    - `types.ts`: 类型定义
  - `themed-text/`: 主题化文本组件
    - `index.tsx`: 组件导出
    - `themed-text.tsx`: 统一实现
    - `types.ts`: 类型定义
  - `themed-view/`: 主题化视图组件
    - `index.tsx`: 组件导出
    - `themed-view.tsx`: 统一实现
    - `types.ts`: 类型定义
  - `menu-group/`: 菜单分组组件
    - `index.tsx`: 组件导出
    - `menu-group.tsx`: 统一实现
    - `types.ts`: 类型定义
  - `menu-item/`: 菜单项组件
    - `index.tsx`: 组件导出
    - `menu-item.tsx`: 统一实现
    - `types.ts`: 类型定义
  - `pages/`: 页面级组件
    - `create/`: 创作页面组件
      - `image-generating.tsx`: 图片生成中页面
      - `image-selector.tsx`: 图片选择页面
      - `model-generating.tsx`: 模型生成中页面
      - `model-complete.tsx`: 模型生成完成页面
  - `screen-wrapper/`: 安全区域包裹组件
    - `index.tsx`: ScreenWrapper 组件 (统一处理 Safe Area)
  - `ui/`: UI 基础组件
    - `icon-symbol.tsx`: 跨平台图标组件（统一实现，使用 Ionicons）

- **config/**: 配置文件
  - `env.ts`: 环境变量配置
  - `env.d.ts`: 环境变量类型定义
  - `api.ts`: API 配置和端点定义
  - `3d-viewer.ts`: 3D 查看器配置

- **constants/**: 常量定义
  - `theme.ts`: 颜色主题和字体定义 (包含亮暗模式配置)
  - `mock-data.ts`: Mock 数据

- **hooks/**: 自定义 React Hooks
  - `use-color-scheme.ts`: 颜色模式检测 hook
  - `use-color-scheme.web.ts`: Web 平台特定实现
  - `use-theme-color.ts`: 主题颜色 hook
  - `use-model-loader.ts`: 3D 模型加载 hook
  - `use-safe-area-spacing.ts`: 安全区域间距 hook
  - `useAsyncController.ts`: 异步操作控制器 hook

- **services/**: 服务层
  - `http/`: HTTP 客户端
    - `client.ts`: 统一的 HTTP 请求封装
  - `api/`: API 服务
    - `gallery.ts`: 画廊相关 API
  - `image-proxy.ts`: 图片代理服务
  - `index.ts`: 服务统一导出

- **stores/**: 全局状态管理 (Zustand)
  - `gallery/`: 画廊状态
    - `gallery-store.ts`: 画廊 Store 实现
    - `types.ts`: 类型定义
    - `index.ts`: 导出
  - `create/`: 创作状态
    - `create-store.ts`: 创作 Store 实现
    - `types.ts`: 类型定义
    - `index.ts`: 导出
  - `style/`: 风格状态
    - `index.ts`: 风格 Store 实现
  - `index.ts`: 所有 Store 统一导出

- **styles/**: 样式工具
  - `mixins.ts`: 可复用样式混入
  - `shadows.ts`: 阴影样式库
  - `buttons.ts`: 按钮样式库
  - `cards.ts`: 卡片样式库

- **types/**: TypeScript 类型定义
  - `api/`: API 相关类型
    - `common.ts`: 通用 API 类型
    - `gallery.ts`: 画廊 API 类型
  - `models/`: 数据模型类型
    - `gallery.ts`: 画廊模型类型
    - `3d-viewer.ts`: 3D 查看器类型
  - `index.ts`: 类型统一导出

- **utils/**: 工具函数
  - `platform.ts`: 平台检测工具
  - `logger.ts`: 统一日志模块
  - `error-handler.ts`: 错误处理工具
  - `storage.ts`: 本地存储工具 (AsyncStorage 封装)
  - `url.ts`: URL 处理工具

- **assets/**: 静态资源
  - `images/`: 图片资源 (图标、启动屏等)
  - `models/`: 3D 模型文件

- **scripts/**: 工具脚本
  - `reset-project.js`: 项目重置脚本

- **docs/**: 文档
  - `api.yaml`: API 文档 (OpenAPI 规范)

- **app-example/**: 示例代码备份目录

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

#### 路由配置最佳实践

**根布局配置** (`app/_layout.tsx`):
```typescript
// 使用 screenOptions 全局隐藏导航栏,避免启动时闪现
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="(tabs)" />
</Stack>
```

**入口重定向** (`app/index.tsx`):
```typescript
// 明确指定应用启动时的初始路由,防止 Expo Router 选择错误的入口
export default function Index() {
  return <Redirect href="/(tabs)/discover" />;
}
```

**重要说明:**
- `app/index.tsx` 是必需的,作为应用的根入口
- 使用 `screenOptions={{ headerShown: false }}` 在根 Stack 中全局隐藏导航栏
- 这样可以避免从 `index.tsx` 重定向到 `(tabs)` 时出现导航栏闪现
- `(tabs)` 路由组不能直接作为入口,因为它不是可访问的路由路径
- 这是 Expo Router 官方推荐的最佳实践

### 主题系统

- 支持亮暗双主题,定义在 `constants/theme.ts`
- 使用 React Navigation 的 ThemeProvider
- 组件通过 `useColorScheme()` hook 检测当前主题
- 主题颜色包括: text, background, tint, icon, tabIcon 等
- 字体系统使用统一的系统默认字体，确保跨平台一致性

### 图标使用

项目统一使用 **Ionicons** (来自 @expo/vector-icons) 作为图标库：
- 跨平台一致的图标样式
- `IconSymbol` 组件提供统一的图标抽象
- 通过映射表支持原有的 SF Symbols 图标名称

### 平台特定代码

仅在必要时使用平台特定代码：
- **3D Viewer**: Native 使用 expo-three，Web 使用 WebView
- 其他组件优先使用统一实现，确保跨平台一致性
- 使用 `Platform.select()` 或 `process.env.EXPO_OS` 进行平台判断

### 组件开发规范

- **组件文件夹结构**: 全局组件统一放在 `components/` 目录下，每个组件一个文件夹
- **文件组织**:
  - `index.tsx` 作为统一入口，导出组件
  - `component-name.tsx` 组件主文件（统一实现）
  - `types.ts` 定义组件的 Props 和内部类型
  - 复杂组件可拆分多个子组件文件
- **页面组件**: 页面专属的小组件可直接放在 `components/pages/[页面名]/` 下

### UI 设计原则

- **统一体验**: 两端使用相同的 UI 组件和样式，确保视觉一致性
- **毛玻璃效果**: 使用 BlurView 提供现代化的视觉效果（SearchBar、ModelCard 等）
- **阴影系统**: 统一使用 iOS 的 shadow 属性 + Android 的 elevation
- **触觉反馈**: 统一使用 Medium 强度的触觉反馈
- **动画**: 优先使用 Animated.spring 提供流畅的交互动画

## 开发注意事项

1. **路由配置**:
   - 在 `app/` 目录添加新页面时,Expo Router 会自动生成路由
   - 必须在根 `_layout.tsx` 中配置所有路由的 Screen,否则会使用默认配置
   - 使用 `screenOptions` 全局配置避免重复,例如 `screenOptions={{ headerShown: false }}`
   - `app/index.tsx` 是必需的应用入口,通常用于重定向到初始页面
2. **类型安全**: 启用了类型化路由,使用 `href` 时会有类型提示
3. **生成文件**: `expo-env.d.ts` 和 `.expo/` 目录是自动生成的,已被 git 忽略
4. **原生目录**: `/ios` 和 `/android` 目录会在构建时生成,不要提交到版本控制
5. **主题化**: 新组件应考虑支持亮暗模式,使用 `useColorScheme()` 和 `Colors` 常量
6. **触觉反馈**: iOS 交互可使用 `expo-haptics` 提供反馈
7. **平台差异**: 新组件必须提供iOS和Android两个版本,确保功能逻辑完全一致
8. **日志规范**: 禁止使用 `console.*`,必须使用 `logger` 模块（从 `@/utils/logger` 导入）。使用合适的日志级别：`debug` 用于调试信息、`info` 用于业务流程、`warn` 用于警告、`error` 用于错误。开发环境显示所有日志,生产环境仅输出 error 级别,ESLint 已配置强制检查（scripts 目录除外）
9. **代码格式化**: 使用 Prettier 统一代码风格,提交前应运行 `npm run format`
10. **环境变量**: 通过 `config/env.ts` 管理,使用 TypeScript 提供类型安全
11. **图片处理**: 使用 `expo-image` 组件以获得更好的性能,支持图片代理服务避免 CORS 问题
12. **Safe Area 处理**:
    - 使用 `ScreenWrapper` 组件统一处理安全区域
    - Tab 页面使用 `edges={['top']}` (底部由 Tab Bar 处理)
    - 有导航栏的页面不需要 ScreenWrapper (Stack.Screen 自动处理)
    - 全屏页面使用 `edges={[]}` 让内容延伸到边缘
    - 参考 `docs/safe-area-guide.md` 了解详细说明

## API 接口规范

### HTTP 客户端
项目使用统一封装的 API 客户端 (`services/api-client.ts`),基于 `fetch` API。

**特性**:
- 自动拦截 401 并跳转登录
- 自动添加 Bearer Token
- 统一错误处理和日志记录
- 支持请求取消 (AbortController)
- 支持 JSend 响应格式
- 自动转换相对路径为完整 URL

**使用示例**:
```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api-client';

// GET 请求
const result = await apiGet<DataType>('/api/endpoint');
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}

// POST 请求
const result = await apiPost<ResponseType>('/api/endpoint', {
  body: JSON.stringify({ key: 'value' })
});

// 带取消控制器的请求
const controller = new AbortController();
const result = await apiGet<DataType>('/api/endpoint', {
  signal: controller.signal
});

// Token 管理
import { tokenManager } from '@/services/api-client';
await tokenManager.setToken('your-token');
const token = await tokenManager.getToken();
await tokenManager.removeToken();
```

### API 服务层
所有 API 调用都封装在 `services/api/` 目录下,按业务模块组织:

```typescript
// services/api/gallery.ts
import { apiGet, apiPost } from '@/services/api-client';
import { API_ENDPOINTS } from '@/config/api';

export async function fetchGalleryModels(params) {
  const result = await apiGet<GalleryListResponse>(
    `${API_ENDPOINTS.gallery.models}?${query.toString()}`,
    { signal: options?.signal }
  );

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

export async function fetchModelDetail(id: string) {
  const result = await apiGet<GalleryModel>(
    API_ENDPOINTS.gallery.modelDetail(id)
  );

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}
```

### JSend 响应格式
后端 API 遵循 JSend 标准:

```typescript
// 成功响应
{
  status: 'success',
  data: { /* 响应数据 */ }
}

// 失败响应 (客户端错误)
{
  status: 'fail',
  data: { /* 错误详情 */ }
}

// 错误响应 (服务器错误)
{
  status: 'error',
  message: '错误信息'
}
```

## 构建与发布

### EAS Build 配置
项目使用 EAS (Expo Application Services) 进行构建和发布。

**配置文件**: `eas.json`

**构建命令**:
```bash
# 开发构建 (包含开发工具)
eas build --profile development --platform ios
eas build --profile development --platform android

# 预览构建 (用于测试)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# 生产构建
eas build --profile production --platform ios
eas build --profile production --platform android
```

### 应用标识符
- **iOS Bundle ID**: `com.yaotutu.lumi`
- **Android Package**: `com.yaotutu.lumi`
- **应用名称**: Lumi (原 laf,已更新)

### 版本管理
在 `app.json` 中维护版本信息:
```json
{
  "version": "1.0.0",
  "ios": { "buildNumber": "1" },
  "android": { "versionCode": 1 }
}
```

## UI 实现模式

### Stretchy Header（可拉伸头部）
**实现原理**：图片绝对定位在底层（zIndex: 1），透明 ScrollView 覆盖其上（zIndex: 2），导航栏固定在最顶层（zIndex: 100），通过监听 scrollY 并用 Animated.interpolate 动态调整图片高度，实现下拉时图片拉伸填充空白的效果。

**参考实现**：`components/model-detail/model-detail.ios.tsx`

### 3D 模型查看器
**技术实现**：
- **Web 平台**: 使用 Three.js + React Three Fiber 实现
- **原生平台**: 使用 expo-three + expo-gl 实现 WebGL 渲染
- **模型格式**: 支持 GLB/GLTF 格式的 3D 模型
- **交互功能**: 旋转、缩放、平移

**组件位置**: `components/3d-viewer/`

**使用示例**:
```typescript
import { ModelViewer } from '@/components/3d-viewer';

<ModelViewer
  modelUrl="https://example.com/model.glb"
  onLoad={() => logger.info('模型加载完成')}
  onError={(error) => logger.error('模型加载失败', error)}
/>
```

### 键盘处理
使用 `react-native-keyboard-controller` 库统一处理键盘行为,确保输入框在键盘弹出时的正确显示。

**关键配置**:
- 在 Android 上配置 `adjustResize` 模式
- 使用 `KeyboardAvoidingView` 包裹输入区域
- 使用 `useKeyboardHandler` hook 监听键盘事件

## 状态管理架构

本项目使用 **Zustand** 进行全局状态管理,配合 **Immer** 进行不可变更新。

### 状态管理原则
- **页面状态**: 使用 `useState` 管理简单的 UI 状态
- **全局状态**: 使用 Zustand Store 管理跨页面共享的业务状态
- **不可变更新**: 使用 Immer 的 `produce` 函数确保状态更新的不可变性
- **异步操作**: 使用 `useAsyncController` hook 处理取消操作,防止内存泄漏
- **错误处理**: 使用 `error-handler` 工具统一分类和记录错误
- **持久化**: 使用 AsyncStorage 持久化关键状态 (通过 `storage.ts` 工具)

### Store 组织结构
```
stores/
├── gallery/          # 画廊相关状态
│   ├── gallery-store.ts
│   ├── types.ts
│   └── index.ts
├── create/           # 创作相关状态
│   ├── create-store.ts
│   ├── types.ts
│   └── index.ts
├── style/            # 风格选择状态
│   └── index.ts
└── index.ts          # 统一导出所有 Store
```

### Store 使用模式
```typescript
import { create } from 'zustand';
import { produce } from 'immer';

// 定义 Store 的状态接口
interface XxxState {
  data: SomeData | null;
  loading: boolean;
  error: string | null;
}

// 定义 Store 的操作接口
interface XxxActions {
  someAction: (...args) => Promise<void>;
  reset: () => void;
}

// 创建 Store
export const useXxxStore = create<XxxState & XxxActions>((set) => ({
  // 初始状态
  data: null,
  loading: false,
  error: null,

  // 异步操作
  someAction: async (...args) => {
    // 设置加载状态
    set(
      produce((state) => {
        state.loading = true;
        state.error = null;
      })
    );

    try {
      // 调用 API
      const result = await apiCall(...args);

      // 更新状态
      set(
        produce((state) => {
          state.data = result;
          state.loading = false;
        })
      );
    } catch (error) {
      // 错误处理
      const errorInfo = categorizeError(error);
      set(
        produce((state) => {
          state.loading = false;
          state.error = errorInfo.message;
        })
      );
      logError(error, 'XxxStore.someAction');
    }
  },

  // 重置状态
  reset: () =>
    set(
      produce((state) => {
        state.data = null;
        state.loading = false;
        state.error = null;
      })
    ),
}));
```

### 在组件中使用 Store
```typescript
import { useXxxStore } from '@/stores';

function MyComponent() {
  // 选择性订阅状态 (性能优化)
  const data = useXxxStore((state) => state.data);
  const loading = useXxxStore((state) => state.loading);
  const someAction = useXxxStore((state) => state.someAction);

  // 或者订阅整个 Store
  const { data, loading, someAction } = useXxxStore();

  // 使用状态和操作
  useEffect(() => {
    someAction();
  }, [someAction]);

  return (
    <View>
      {loading && <ActivityIndicator />}
      {data && <Text>{data.title}</Text>}
    </View>
  );
}
```

### 持久化 Store
```typescript
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePersistedStore = create(
  persist<State & Actions>(
    (set) => ({
      // Store 定义
    }),
    {
      name: 'persisted-store', // 存储键名
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```
# 重要提示
- 优先使用函数式编程
- 代码注释需详尽,尤其是复杂逻辑部分
- 每一行代码都要有详细的中文注释说明
- 避免使用+=,-=等复合赋值运算符,可读性放在首位
- 前后端交互遵循jsend标准
- 遇到解决不了的问题,应该去查阅官方文档或者去网上搜索解决方案

## 常见问题

### 1. Metro bundler 缓存问题
如果遇到奇怪的构建错误,尝试清除缓存:
```bash
npx expo start -c
# 或
npm start -- --clear
```

### 2. iOS 模拟器无法启动
确保已安装 Xcode 和 Command Line Tools:
```bash
xcode-select --install
```

### 3. Android 模拟器无法连接
确保 Android SDK 和 emulator 已正确配置,检查 `ANDROID_HOME` 环境变量。

### 4. TypeScript 类型错误
重新生成类型文件:
```bash
npx expo customize tsconfig.json
```

### 5. 3D 模型加载失败
- 检查模型 URL 是否可访问
- 确认模型格式为 GLB/GLTF
- 查看控制台日志了解详细错误信息
- Web 平台注意 CORS 问题

### 6. 图片加载 CORS 错误
使用图片代理服务:
```typescript
import { getProxiedImageUrl } from '@/services/image-proxy';

const proxiedUrl = getProxiedImageUrl(originalUrl);
```

### 7. AsyncStorage 数据丢失
- 开发环境下卸载应用会清空数据
- 生产环境确保正确使用持久化中间件
- 使用 `storage.ts` 工具类进行错误处理

## 性能优化建议

### 1. 图片优化
- 使用 `expo-image` 替代 `Image` 组件
- 设置合适的 `contentFit` 和 `placeholder`
- 使用图片代理服务优化加载速度

### 2. 列表渲染优化
- 使用 `FlashList` 替代 `FlatList` (长列表场景)
- 设置 `keyExtractor` 和 `getItemLayout`
- 避免在 `renderItem` 中创建匿名函数

### 3. 状态管理优化
- 使用 Zustand 的选择器订阅,避免不必要的重渲染
- 合理拆分 Store,避免单个 Store 过大
- 使用 `useCallback` 和 `useMemo` 缓存函数和计算结果

### 4. 动画性能
- 优先使用 `react-native-reanimated` 实现动画
- 避免在主线程执行复杂计算
- 使用 `worklet` 将动画逻辑移至 UI 线程

### 5. 3D 渲染优化
- 压缩模型文件大小
- 使用合适的纹理分辨率
- 限制场景中的灯光和多边形数量

## 调试技巧

### 1. React DevTools
```bash
npx react-devtools
```

### 2. Flipper (原生调试)
安装 Flipper 桌面应用,可以:
- 查看网络请求
- 检查 AsyncStorage 数据
- 查看应用性能指标

### 3. 日志调试
使用 logger 模块的不同级别:
```typescript
logger.debug('调试信息', { data });
logger.info('业务流程');
logger.warn('警告信息');
logger.error('错误信息', error);
```

### 4. 远程调试
开发服务器启动后,按 `j` 打开调试器,可以:
- 在浏览器中查看控制台
- 使用断点调试
- 查看网络请求

### 5. 性能分析
使用 React Native Performance Monitor:
```bash
# iOS 模拟器: Cmd+D
# Android 模拟器: Cmd+M
# 选择 "Perf Monitor"
```

## 最佳实践总结

1. **代码组织**: 遵循就近原则,全局共享的放 `components/`,页面特定的放页面目录
2. **类型安全**: 充分利用 TypeScript,为所有函数和组件定义类型
3. **平台适配**: 为 iOS 和 Android 提供不同的 UI 实现,确保原生体验
4. **错误处理**: 使用 `error-handler` 统一处理,记录日志
5. **性能优化**: 关注首屏加载时间,优化列表和图片渲染
6. **状态管理**: 使用 Zustand + Immer,保持状态更新的可预测性
7. **代码质量**: 提交前运行 `npm run lint:fix` 和 `npm run format`
8. **测试覆盖**: 为关键业务逻辑编写单元测试
9. **文档维护**: 及时更新 CLAUDE.md 和代码注释
10. **版本控制**: 使用语义化版本,保持 changelog 更新

<!--以下内容为用户自行填写，禁止修改-->
# 参考
/Users/yaotutu/Desktop/code/tope-lumi/lumi-server	 这是我们的服务端代码
/Users/yaotutu/Desktop/code/tope-lumi/lumi-web-next 这是我们的web页面代码

# 重要提示
- 禁止私自运行项目，如需要运行项目，让用户自行运行
- 项目稳定性可靠性优先，不需要炫酷的技巧，优先保证的功能的实现。


## Rules
- [2025-01-29] Expo Router/React Navigation：如果页面从 Tabs 导航器跳转到外部 Stack 页面（即app/(tabs) 之外的页面），必须在 Stack.Screen 的 options 中自定义headerLeft返回按钮并明确绑定 router.back()，不能依赖默认的 header 返回按钮