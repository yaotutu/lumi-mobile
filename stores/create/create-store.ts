import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CreateState, StyleOption, Generation } from './types';
import { logger } from '@/utils/logger';

// 模拟的风格选项数据
const mockStyleOptions: StyleOption[] = [
  { id: 1, name: '写实风格', description: '高度逼真的现实效果', category: 'realistic' },
  { id: 2, name: '卡通风格', description: '可爱的卡通动画效果', category: 'cartoon' },
  { id: 3, name: '低多边形', description: '现代简约的低多边形风格', category: 'lowpoly' },
  { id: 4, name: '赛博朋克', description: '未来科技感的赛博朋克风格', category: 'cyberpunk' },
  { id: 5, name: '像素艺术', description: '复古的8位像素艺术风格', category: 'pixel' },
  { id: 6, name: '手绘风格', description: '温暖的手绘艺术效果', category: 'handdrawn' },
];

export const useCreateStore = create<CreateState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        prompt: '',
        selectedStyle: null,
        showStyles: false,
        isGenerating: false,
        generationProgress: 0,
        currentGenerationId: null,
        generationHistory: [],
        showAdvancedOptions: false,

        // 设置提示词
        setPrompt: (prompt) => {
          logger.debug('设置提示词:', prompt);
          set((state) => {
            state.prompt = prompt;
          });
        },

        // 选择风格
        selectStyle: (style) => {
          logger.debug('选择风格:', style);
          set((state) => {
            state.selectedStyle = style;
          });
        },

        // 显示风格选择器
        showStyleSelector: () => {
          const { prompt } = get();
          if (!prompt.trim()) {
            logger.warn('提示词为空，不能显示风格选择器');
            return;
          }
          set((state) => {
            state.showStyles = true;
          });
        },

        // 隐藏风格选择器
        hideStyleSelector: () => {
          logger.debug('隐藏风格选择器');
          set((state) => {
            state.showStyles = false;
            state.selectedStyle = null;
          });
        },

        // 开始生成
        startGeneration: async () => {
          const { prompt, selectedStyle } = get();

          if (!prompt.trim()) {
            throw new Error('请输入提示词');
          }

          if (!selectedStyle) {
            throw new Error('请选择一个风格');
          }

          const generationId = Date.now().toString();

          set((state) => {
            state.isGenerating = true;
            state.generationProgress = 0;
            state.currentGenerationId = generationId;
          });

          // 添加到历史记录
          get().addToHistory({
            prompt,
            selectedStyle,
            status: 'generating',
          });

          logger.info('开始生成3D模型:', { prompt, selectedStyle: selectedStyle.name });

          // 模拟生成过程
          try {
            await simulateGeneration(generationId, get().setGenerationProgress);

            // 生成成功
            const resultUrl = `https://example.com/models/${generationId}.glb`;
            get().completeGeneration(resultUrl);

          } catch (error) {
            logger.error('生成失败:', error);
            get().failGeneration(error instanceof Error ? error.message : '生成失败');
          }
        },

        // 取消生成
        cancelGeneration: () => {
          const { currentGenerationId } = get();

          if (!currentGenerationId) {
            return;
          }

          logger.info('取消生成:', currentGenerationId);

          set((state) => {
            state.isGenerating = false;
            state.generationProgress = 0;
            state.currentGenerationId = null;
          });

          // 更新历史记录中的状态
          get().updateGenerationStatus(currentGenerationId, 'failed', '用户取消');
        },

        // 设置生成进度
        setGenerationProgress: (progress) => {
          set((state) => {
            state.generationProgress = Math.max(0, Math.min(100, progress));
          });
        },

        // 完成生成
        completeGeneration: (resultUrl) => {
          const { currentGenerationId } = get();

          if (!currentGenerationId) {
            return;
          }

          logger.info('生成完成:', { generationId: currentGenerationId, resultUrl });

          set((state) => {
            state.isGenerating = false;
            state.generationProgress = 100;
          });

          // 更新历史记录
          get().updateGenerationStatus(currentGenerationId, 'completed', undefined, resultUrl);
        },

        // 生成失败
        failGeneration: (error) => {
          const { currentGenerationId } = get();

          if (!currentGenerationId) {
            return;
          }

          logger.error('生成失败:', error);

          set((state) => {
            state.isGenerating = false;
            state.generationProgress = 0;
            state.currentGenerationId = null;
          });

          // 更新历史记录
          get().updateGenerationStatus(currentGenerationId, 'failed', error);
        },

        // 添加到历史记录
        addToHistory: (generation) => {
          const newGeneration: Generation = {
            ...generation,
            id: Date.now().toString(),
            generatedAt: new Date(),
          };

          set((state) => {
            state.generationHistory.unshift(newGeneration);

            // 限制历史记录数量，保留最近50条
            if (state.generationHistory.length > 50) {
              state.generationHistory = state.generationHistory.slice(0, 50);
            }
          });
        },

        // 更新生成状态
        updateGenerationStatus: (id, status, error, resultUrl) => {
          set((state) => {
            const generation = state.generationHistory.find(g => g.id === id);
            if (generation) {
              generation.status = status;
              if (error) generation.error = error;
              if (resultUrl) generation.resultUrl = resultUrl;
            }
          });
        },

        // 清除历史记录
        clearHistory: () => {
          logger.info('清除生成历史记录');
          set((state) => {
            state.generationHistory = [];
          });
        },

        // 切换高级选项
        toggleAdvancedOptions: () => {
          set((state) => {
            state.showAdvancedOptions = !state.showAdvancedOptions;
          });
        },

        // 重置状态
        reset: () => {
          logger.info('重置创作状态');
          set((state) => {
            state.prompt = '';
            state.selectedStyle = null;
            state.showStyles = false;
            state.isGenerating = false;
            state.generationProgress = 0;
            state.currentGenerationId = null;
            state.showAdvancedOptions = false;
          });
        },
      })),
      {
        name: 'create-store',
        partialize: (state) => ({
          generationHistory: state.generationHistory,
          showAdvancedOptions: state.showAdvancedOptions,
        }),
      }
    ),
    {
      name: 'CreateStore',
    }
  )
);

// 模拟生成过程的辅助函数
async function simulateGeneration(generationId: string, setProgress: (progress: number) => void) {
  const steps = [10, 25, 45, 70, 90];
  const delays = [1000, 1500, 2000, 1500, 1000];

  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, delays[i]));
    setProgress(steps[i]);
  }
}

// 获取风格选项的辅助函数
export function getStyleOptions(): StyleOption[] {
  return mockStyleOptions;
}

// 选择器 hooks，用于性能优化
export const useCreatePrompt = () => useCreateStore((state) => state.prompt);
export const useCreateSelectedStyle = () => useCreateStore((state) => state.selectedStyle);
export const useCreateShowStyles = () => useCreateStore((state) => state.showStyles);
export const useCreateGenerating = () => useCreateStore((state) => ({
  isGenerating: state.isGenerating,
  generationProgress: state.generationProgress,
}));
export const useCreateHistory = () => useCreateStore((state) => state.generationHistory);
export const useCreateAdvancedOptions = () => useCreateStore((state) => state.showAdvancedOptions);