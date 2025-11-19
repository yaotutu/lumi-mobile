export type { CreateState, StyleOption, Generation } from './types';
export {
  useCreateStore,
  getStyleOptions,
  useCreatePrompt,
  useCreateSelectedStyle,
  useCreateShowStyles,
  useCreateGenerating,
  useCreateHistory,
  useCreateAdvancedOptions,
} from './create-store';

// 使用 Zustand 全局状态管理，支持选择器优化性能
// 例如：const prompt = useCreatePrompt(); // 只订阅 prompt 变化
// 或者：const { prompt, selectedStyle } = useCreateStore(); // 订阅多个状态
