import { useCallback } from 'react';
import { useImmer } from 'use-immer';
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

// 初始状态
const initialCreateState: CreateState = {
  // 输入状态
  prompt: '',

  // 风格选择状态
  selectedStyle: null,
  showStyles: false,

  // 生成状态
  isGenerating: false,
  generationProgress: 0,
  currentGenerationId: null,

  // 历史记录
  generationHistory: [],

  // UI 状态
  showAdvancedOptions: false,

  // Actions（将在下面定义）
  setPrompt: () => {},
  selectStyle: () => {},
  showStyleSelector: () => {},
  hideStyleSelector: () => {},
  startGeneration: async () => {},
  cancelGeneration: () => {},
  setGenerationProgress: () => {},
  completeGeneration: () => {},
  failGeneration: () => {},
  updateGenerationStatus: () => {},
  addToHistory: () => {},
  clearHistory: () => {},
  toggleAdvancedOptions: () => {},
  reset: () => {},
};

export const useCreateStore = () => {
  const [state, updateState] = useImmer(initialCreateState);

  // 设置提示词
  const setPrompt = useCallback((prompt: string) => {
    logger.debug('设置提示词:', prompt);
    updateState(draft => {
      draft.prompt = prompt;
    });
  }, []);

  // 选择风格
  const selectStyle = useCallback((style: StyleOption | null) => {
    logger.debug('选择风格:', style);
    updateState(draft => {
      draft.selectedStyle = style;
    });
  }, []);

  // 显示风格选择器
  const showStyleSelector = useCallback(() => {
    if (!state.prompt.trim()) {
      logger.warn('提示词为空，不能显示风格选择器');
      return;
    }
    updateState(draft => {
      draft.showStyles = true;
    });
  }, [state.prompt]);

  // 隐藏风格选择器
  const hideStyleSelector = useCallback(() => {
    logger.debug('隐藏风格选择器');
    updateState(draft => {
      draft.showStyles = false;
      draft.selectedStyle = null;
    });
  }, []);

  // 开始生成
  const startGeneration = useCallback(
    async (abortController?: AbortController) => {
      if (!state.prompt.trim()) {
        throw new Error('请输入提示词');
      }

      if (!state.selectedStyle) {
        throw new Error('请选择一个风格');
      }

      const generationId = Date.now().toString();

      updateState(draft => {
        draft.isGenerating = true;
        draft.generationProgress = 0;
        draft.currentGenerationId = generationId;
      });

      // 添加到历史记录
      addToHistory({
        prompt: state.prompt,
        selectedStyle: state.selectedStyle,
        status: 'generating',
      });

      logger.info('开始生成3D模型:', {
        prompt: state.prompt,
        selectedStyle: state.selectedStyle.name,
      });

      // 模拟生成过程
      try {
        await simulateGeneration(generationId, setGenerationProgress, abortController);

        // 生成成功
        const resultUrl = `https://example.com/models/${generationId}.glb`;
        completeGeneration(resultUrl);
      } catch (error) {
        // 如果是取消错误，不设置失败状态
        if (error instanceof Error && error.name === 'AbortError') {
          logger.debug('生成被取消');
          return;
        }

        logger.error('生成失败:', error);
        failGeneration(error instanceof Error ? error.message : '生成失败');
      }
    },
    [state.prompt, state.selectedStyle]
  );

  // 取消生成
  const cancelGeneration = useCallback(() => {
    if (!state.currentGenerationId) {
      return;
    }

    logger.info('取消生成:', state.currentGenerationId);

    updateState(draft => {
      draft.isGenerating = false;
      draft.generationProgress = 0;
      draft.currentGenerationId = null;
    });

    // 更新历史记录中的状态
    updateGenerationStatus(state.currentGenerationId, 'failed', '用户取消');
  }, [state.currentGenerationId]);

  // 设置生成进度
  const setGenerationProgress = useCallback((progress: number) => {
    updateState(draft => {
      draft.generationProgress = Math.max(0, Math.min(100, progress));
    });
  }, []);

  // 完成生成
  const completeGeneration = useCallback(
    (resultUrl: string) => {
      if (!state.currentGenerationId) {
        return;
      }

      logger.info('生成完成:', { generationId: state.currentGenerationId, resultUrl });

      updateState(draft => {
        draft.isGenerating = false;
        draft.generationProgress = 100;
      });

      // 更新历史记录
      updateGenerationStatus(state.currentGenerationId, 'completed', undefined, resultUrl);
    },
    [state.currentGenerationId]
  );

  // 生成失败
  const failGeneration = useCallback(
    (error: string) => {
      if (!state.currentGenerationId) {
        return;
      }

      logger.error('生成失败:', error);

      updateState(draft => {
        draft.isGenerating = false;
        draft.generationProgress = 0;
        draft.currentGenerationId = null;
      });

      // 更新历史记录
      updateGenerationStatus(state.currentGenerationId, 'failed', error);
    },
    [state.currentGenerationId]
  );

  // 添加到历史记录
  const addToHistory = useCallback((generation: Omit<Generation, 'id' | 'generatedAt'>) => {
    const newGeneration: Generation = {
      ...generation,
      id: Date.now().toString(),
      generatedAt: new Date(),
    };

    updateState(draft => {
      draft.generationHistory.unshift(newGeneration);

      // 限制历史记录数量，保留最近50条
      if (draft.generationHistory.length > 50) {
        draft.generationHistory = draft.generationHistory.slice(0, 50);
      }
    });
  }, []);

  // 更新生成状态
  const updateGenerationStatus = useCallback(
    (id: string, status: Generation['status'], error?: string, resultUrl?: string) => {
      updateState(draft => {
        const generation = draft.generationHistory.find(g => g.id === id);
        if (generation) {
          generation.status = status;
          if (error) generation.error = error;
          if (resultUrl) generation.resultUrl = resultUrl;
        }
      });
    },
    []
  );

  // 清除历史记录
  const clearHistory = useCallback(() => {
    logger.info('清除生成历史记录');
    updateState(draft => {
      draft.generationHistory = [];
    });
  }, []);

  // 切换高级选项
  const toggleAdvancedOptions = useCallback(() => {
    updateState(draft => {
      draft.showAdvancedOptions = !draft.showAdvancedOptions;
    });
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    logger.info('重置创作状态');
    updateState(draft => {
      draft.prompt = '';
      draft.selectedStyle = null;
      draft.showStyles = false;
      draft.isGenerating = false;
      draft.generationProgress = 0;
      draft.currentGenerationId = null;
      draft.showAdvancedOptions = false;
    });
  }, []);

  return {
    ...state,
    setPrompt,
    selectStyle,
    showStyleSelector,
    hideStyleSelector,
    startGeneration,
    cancelGeneration,
    setGenerationProgress,
    completeGeneration,
    failGeneration,
    updateGenerationStatus,
    addToHistory,
    clearHistory,
    toggleAdvancedOptions,
    reset,
  };
};

// 模拟生成过程的辅助函数
async function simulateGeneration(
  generationId: string,
  setProgress: (progress: number) => void,
  abortController?: AbortController
) {
  const steps = [10, 25, 45, 70, 90];
  const delays = [1000, 1500, 2000, 1500, 1000];

  for (let i = 0; i < steps.length; i++) {
    // 检查是否被取消
    if (abortController?.signal.aborted) {
      throw new Error('生成被取消');
    }

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, delays[i]);

      // 监听取消信号
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('生成被取消'));
        });
      }
    });

    // 再次检查是否被取消
    if (abortController?.signal.aborted) {
      throw new Error('生成被取消');
    }

    setProgress(steps[i]);
  }
}

// 获取风格选项的辅助函数
export function getStyleOptions(): StyleOption[] {
  return mockStyleOptions;
}
