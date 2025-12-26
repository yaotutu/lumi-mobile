import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CreateState, GenerationTask, GeneratedImage } from './types';
import { logger } from '@/utils/logger';
import { zustandStorage } from '@/utils/storage';

// 模拟生成的假图片数据
const MOCK_IMAGES: GeneratedImage[] = [
  {
    id: '1',
    url: 'https://picsum.photos/seed/warrior1/800/800',
    thumbnail: 'https://picsum.photos/seed/warrior1/200/200',
  },
  {
    id: '2',
    url: 'https://picsum.photos/seed/warrior2/800/800',
    thumbnail: 'https://picsum.photos/seed/warrior2/200/200',
  },
  {
    id: '3',
    url: 'https://picsum.photos/seed/warrior3/800/800',
    thumbnail: 'https://picsum.photos/seed/warrior3/200/200',
  },
  {
    id: '4',
    url: 'https://picsum.photos/seed/warrior4/800/800',
    thumbnail: 'https://picsum.photos/seed/warrior4/200/200',
  },
];

// 模拟的3D模型URL
const MOCK_MODEL_URL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

export const useCreateStore = create<CreateState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        currentTask: null,
        tasks: [],

        // 创建新任务
        createTask: async (prompt: string) => {
          const taskId = Date.now().toString();
          const newTask: GenerationTask = {
            id: taskId,
            prompt,
            status: 'generating_images',
            createdAt: new Date(),
            updatedAt: new Date(),
            imageProgress: 0,
          };

          logger.info('创建新任务:', { taskId, prompt });

          // 添加到任务列表
          set(state => {
            state.tasks.unshift(newTask);
            state.currentTask = newTask;

            // 限制任务列表数量，保留最近20条
            if (state.tasks.length > 20) {
              state.tasks = state.tasks.slice(0, 20);
            }
          });

          // 模拟图片生成过程
          simulateImageGeneration(taskId, get()._updateTaskProgress);

          return taskId;
        },

        // 选择图片
        selectImage: async (taskId: string, imageId: string) => {
          logger.info('选择图片:', { taskId, imageId });

          set(state => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task && task.status === 'images_ready') {
              task.selectedImageId = imageId;
              task.updatedAt = new Date();
            }
          });
        },

        // 生成3D模型
        generateModel: async (taskId: string) => {
          logger.info('开始生成3D模型:', taskId);

          set(state => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task && task.selectedImageId) {
              task.status = 'generating_model';
              task.modelProgress = 0;
              task.updatedAt = new Date();
            }
          });

          // 模拟3D模型生成过程
          simulateModelGeneration(taskId, get()._updateTaskProgress);
        },

        // 取消任务
        cancelTask: (taskId: string) => {
          logger.info('取消任务:', taskId);

          set(state => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
              task.status = 'cancelled';
              task.updatedAt = new Date();
            }

            // 如果是当前任务，清除引用
            if (state.currentTask?.id === taskId) {
              state.currentTask = null;
            }
          });
        },

        // 删除任务
        deleteTask: (taskId: string) => {
          logger.info('删除任务:', taskId);

          set(state => {
            state.tasks = state.tasks.filter(t => t.id !== taskId);

            // 如果是当前任务，清除引用
            if (state.currentTask?.id === taskId) {
              state.currentTask = null;
            }
          });
        },

        // 获取任务
        getTask: (taskId: string) => {
          return get().tasks.find(t => t.id === taskId);
        },

        // 更新任务进度（内部方法）
        _updateTaskProgress: (taskId: string, progress: Partial<GenerationTask>) => {
          set(state => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
              Object.assign(task, progress);
              task.updatedAt = new Date();

              // 同步更新当前任务
              if (state.currentTask?.id === taskId) {
                Object.assign(state.currentTask, progress);
                state.currentTask.updatedAt = new Date();
              }
            }
          });
        },

        // 重置状态
        reset: () => {
          logger.info('重置创作状态');
          set(state => {
            state.currentTask = null;
            // 保留历史任务
          });
        },
      })),
      {
        name: 'create-store',
        storage: zustandStorage,
        partialize: state => ({
          tasks: state.tasks, // 持久化所有任务
        }),
      }
    ),
    {
      name: 'CreateStore',
    }
  )
);

// 模拟图片生成过程
async function simulateImageGeneration(
  taskId: string,
  updateProgress: (taskId: string, progress: Partial<GenerationTask>) => void
) {
  const steps = [20, 40, 60, 80, 100];
  const delays = [1000, 1000, 1000, 1000, 500];

  try {
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delays[i]));

      updateProgress(taskId, {
        imageProgress: steps[i],
      });
    }

    // 生成完成，设置图片
    updateProgress(taskId, {
      status: 'images_ready',
      images: MOCK_IMAGES,
      imageProgress: 100,
    });

    logger.info('图片生成完成:', taskId);
  } catch (error) {
    logger.error('图片生成失败:', error);
    updateProgress(taskId, {
      status: 'failed',
      error: error instanceof Error ? error.message : '图片生成失败',
    });
  }
}

// 模拟3D模型生成过程
async function simulateModelGeneration(
  taskId: string,
  updateProgress: (taskId: string, progress: Partial<GenerationTask>) => void
) {
  const steps = [15, 30, 50, 70, 85, 100];
  const delays = [1500, 1500, 2000, 2000, 1500, 1000];

  try {
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delays[i]));

      updateProgress(taskId, {
        modelProgress: steps[i],
      });
    }

    // 生成完成，设置模型URL
    updateProgress(taskId, {
      status: 'model_ready',
      modelUrl: MOCK_MODEL_URL,
      modelProgress: 100,
    });

    logger.info('3D模型生成完成:', taskId);
  } catch (error) {
    logger.error('3D模型生成失败:', error);
    updateProgress(taskId, {
      status: 'failed',
      error: error instanceof Error ? error.message : '3D模型生成失败',
    });
  }
}

// 选择器 hooks，用于性能优化
export const useCurrentTask = () => useCreateStore(state => state.currentTask);
export const useTasks = () => useCreateStore(state => state.tasks);
export const useTaskById = (taskId: string) =>
  useCreateStore(state => state.tasks.find(t => t.id === taskId));
