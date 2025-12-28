export type { CreateState, GenerationTask, GeneratedImage } from './types';
export { useCreateStore, useCurrentTask, useTasks, useTaskById } from './create-store';

// 使用 Zustand 全局状态管理，支持选择器优化性能
// 例如：const currentTask = useCurrentTask(); // 只订阅当前任务变化
// 或者：const { tasks } = useCreateStore(); // 订阅多个状态
