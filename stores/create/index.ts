export type { CreateState, StyleOption, Generation } from './types';
export { useCreateStore, getStyleOptions } from './use-create-store';

// 由于 use-immer 是 hook based，我们不能像 Zustand 那样创建独立的选择器
// 选择器功能已经在组件中直接通过解构 state 实现
// 例如：const { prompt, selectedStyle, isGenerating } = useCreateStore();
