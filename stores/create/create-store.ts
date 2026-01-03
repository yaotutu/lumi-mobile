import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CreateState, GenerationTask, GeneratedImage, TaskStatus } from './types';
import { logger } from '@/utils/logger';
import { zustandStorage } from '@/utils/storage';
import {
  createTextToImageTask,
  fetchTaskStatus,
  selectImageForModel,
  type BackendGenerationTask,
  type ImageStatus as BackendImageStatus,
} from '@/services/api/tasks';

/**
 * 后端任务状态映射到前端任务状态
 */
function mapBackendStatus(backendStatus: BackendGenerationTask['status']): GenerationTask['status'] {
  // 根据后端状态映射到前端状态
  switch (backendStatus) {
    case 'IMAGE_PENDING':
    case 'IMAGE_GENERATING':
      return 'generating_images';
    case 'IMAGE_COMPLETED':
      return 'images_ready';
    case 'IMAGE_FAILED':
      return 'failed';
    case 'MODEL_PENDING':      // 模型队列中
    case 'MODEL_GENERATING':   // 模型生成中
      return 'generating_model';
    case 'MODEL_COMPLETED':    // 模型生成完成
    case 'COMPLETED':          // 整个任务完成（兼容后端可能返回的状态）
      return 'model_ready';
    case 'MODEL_FAILED':
      return 'failed';
    default:
      logger.warn('未知的后端任务状态:', backendStatus);
      return 'failed';
  }
}

/**
 * 计算图片生成进度（0-100）
 * 根据已完成的图片数量计算进度
 */
function calculateImageProgress(images: GeneratedImage[]): number {
  if (!images || images.length === 0) return 0;

  // 统计已完成的图片数量
  const completedCount = images.filter(img => img.imageStatus === 'COMPLETED').length;

  // 计算进度（0-100）
  return Math.floor((completedCount / 4) * 100);
}

/**
 * 计算 3D 模型生成进度（0-100）
 * 根据模型状态和 generationJob 计算进度
 */
function calculateModelProgress(model?: BackendGenerationTask['model']): number {
  if (!model) return 0;

  // 如果模型已完成，进度为 100
  if (model.completedAt) {
    return 100;
  }

  // 如果模型失败，进度为 0
  if (model.failedAt) {
    return 0;
  }

  // 如果有 generationJob，使用 Job 的进度
  if (model.generationJob) {
    const jobStatus = model.generationJob.status;
    const jobProgress = model.generationJob.progress || 0;

    // 如果 Job 已完成，进度为 100
    if (jobStatus === 'COMPLETED') {
      return 100;
    }

    // 如果 Job 失败或超时，进度为 0
    if (jobStatus === 'FAILED' || jobStatus === 'TIMEOUT') {
      return 0;
    }

    // 否则使用 Job 的实际进度
    return Math.min(Math.max(jobProgress, 0), 100);
  }

  // 默认返回 0
  return 0;
}

/**
 * 适配后端任务响应到前端任务格式
 */
function adaptBackendTask(backendTask: BackendGenerationTask): GenerationTask {
  logger.debug('[Store] adaptBackendTask 开始适配:', {
    taskId: backendTask.id,
    status: backendTask.status,
    phase: backendTask.phase,
    hasImages: !!backendTask.images,
    imageCount: backendTask.images?.length || 0,
    hasModel: !!backendTask.model,
    selectedImageIndex: backendTask.selectedImageIndex,
  });

  // 映射图片列表（创建任务时可能没有 images 字段）
  const images: GeneratedImage[] | undefined = backendTask.images?.map(img => ({
    id: img.id,
    index: img.index,
    imageStatus: img.imageStatus,
    imageUrl: img.imageUrl,
    imagePrompt: img.imagePrompt,
    // 兼容旧字段
    url: img.imageUrl || undefined,
    thumbnail: img.imageUrl || undefined,
  }));

  // 计算图片进度（如果没有图片，进度为 0）
  const imageProgress = images ? calculateImageProgress(images) : 0;

  // 查找选中的图片 ID
  let selectedImageId: string | undefined;
  if (backendTask.selectedImageIndex !== null && images) {
    const selectedImage = images.find(img => img.index === backendTask.selectedImageIndex);
    selectedImageId = selectedImage?.id;
  }

  // 计算 3D 模型进度
  const modelProgress = calculateModelProgress(backendTask.model);

  // 构建前端任务对象
  const frontendTask: GenerationTask = {
    id: backendTask.id,
    prompt: backendTask.originalPrompt,
    status: mapBackendStatus(backendTask.status),
    createdAt: new Date(backendTask.createdAt),
    updatedAt: new Date(backendTask.updatedAt),
    images,
    imageProgress,
    selectedImageId,
    selectedImageIndex: backendTask.selectedImageIndex ?? undefined,
    modelUrl: backendTask.model?.modelUrl ?? undefined,
    modelId: backendTask.model?.id,
    modelProgress,
    // 如果模型生成失败，记录错误信息
    error: backendTask.model?.errorMessage ?? undefined,
  };

  logger.debug('[Store] adaptBackendTask 适配完成:', {
    taskId: frontendTask.id,
    status: frontendTask.status,
    imageProgress: frontendTask.imageProgress,
    modelProgress: frontendTask.modelProgress,
    hasImages: !!frontendTask.images,
    imageCount: frontendTask.images?.length || 0,
    selectedImageId: frontendTask.selectedImageId,
    selectedImageIndex: frontendTask.selectedImageIndex,
    modelUrl: frontendTask.modelUrl,
    modelId: frontendTask.modelId,
    error: frontendTask.error,
  });

  return frontendTask;
}

// 轮询定时器引用（全局变量，确保只有一个定时器）
// 支持 Node.js 和浏览器环境的类型
let pollingIntervalId: ReturnType<typeof setInterval> | null = null;

export const useCreateStore = create<CreateState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        currentTask: null,
        tasks: [],

        // 创建新任务
        createTask: async (prompt: string) => {
          try {
            logger.info('[Store] 创建新任务:', { prompt });

            // 调用 API 创建任务
            const result = await createTextToImageTask(prompt);

            if (!result.success) {
              logger.error('[Store] 创建任务失败:', result.error.message);
              throw new Error(result.error.message);
            }

            // 适配后端响应到前端格式
            const newTask = adaptBackendTask(result.data);

            logger.info('[Store] 任务创建成功:', { taskId: newTask.id });

            // 更新状态
            set(state => {
              state.tasks.unshift(newTask);
              state.currentTask = newTask;

              // 限制任务列表数量，保留最近 20 条
              if (state.tasks.length > 20) {
                state.tasks = state.tasks.slice(0, 20);
              }
            });

            // 启动轮询
            get()._startPolling(newTask.id);

            return newTask.id;
          } catch (error) {
            logger.error('[Store] 创建任务异常:', error);
            throw error;
          }
        },

        // 选择图片（仅更新本地状态，不调用 API）
        selectImage: async (taskId: string, imageId: string) => {
          logger.info('[Store] 选择图片:', { taskId, imageId });

          set(state => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task && task.status === 'images_ready') {
              // 更新选中的图片 ID
              task.selectedImageId = imageId;
              // 查找对应的图片索引
              const selectedImage = task.images?.find(img => img.id === imageId);
              if (selectedImage) {
                task.selectedImageIndex = selectedImage.index;
              }
              task.updatedAt = new Date();
            }
          });
        },

        // 生成3D模型
        generateModel: async (taskId: string) => {
          try {
            logger.info('[Store] 开始生成3D模型:', taskId);

            // 获取任务并验证
            const task = get().tasks.find(t => t.id === taskId);
            if (!task) {
              logger.error('[Store] 任务不存在:', taskId);
              throw new Error('任务不存在');
            }

            if (task.selectedImageIndex === undefined) {
              logger.error('[Store] 未选择图片:', taskId);
              throw new Error('未选择图片');
            }

            logger.info('[Store] 任务验证通过:', {
              taskId,
              selectedImageIndex: task.selectedImageIndex,
              selectedImageId: task.selectedImageId,
            });

            // 先更新本地状态为生成中
            set(state => {
              const task = state.tasks.find(t => t.id === taskId);
              if (task) {
                task.status = 'generating_model';
                task.modelProgress = 0;
                task.updatedAt = new Date();
              }

              // 同步更新 currentTask
              if (state.currentTask?.id === taskId) {
                state.currentTask.status = 'generating_model';
                state.currentTask.modelProgress = 0;
                state.currentTask.updatedAt = new Date();
              }
            });

            logger.info('[Store] 本地状态已更新为 generating_model');

            // 调用 API 选择图片并生成 3D 模型
            logger.info('[Store] 调用 API selectImageForModel:', {
              taskId,
              imageIndex: task.selectedImageIndex,
            });

            const result = await selectImageForModel(taskId, task.selectedImageIndex);

            if (!result.success) {
              logger.error('[Store] API 调用失败:', {
                message: result.error.message,
                status: result.error.status,
                code: result.error.code,
              });

              // 更新为失败状态
              set(state => {
                const task = state.tasks.find(t => t.id === taskId);
                if (task) {
                  task.status = 'failed';
                  task.error = result.error.message;
                  task.updatedAt = new Date();
                }

                // 同步更新 currentTask
                if (state.currentTask?.id === taskId) {
                  state.currentTask.status = 'failed';
                  state.currentTask.error = result.error.message;
                  state.currentTask.updatedAt = new Date();
                }
              });

              // 不要 throw，让调用方处理
              return;
            }

            logger.info('[Store] API 调用成功，开始适配数据:', {
              modelId: result.data.model.id,
              taskStatus: result.data.task.status,
            });

            // 适配后端响应
            const updatedTask = adaptBackendTask(result.data.task);

            logger.info('[Store] 数据适配完成:', {
              modelId: updatedTask.modelId,
              status: updatedTask.status,
              modelProgress: updatedTask.modelProgress,
            });

            // 更新任务状态
            set(state => {
              const task = state.tasks.find(t => t.id === taskId);
              if (task) {
                Object.assign(task, updatedTask);
              }

              // 同步更新 currentTask
              if (state.currentTask?.id === taskId) {
                Object.assign(state.currentTask, updatedTask);
              }
            });

            logger.info('[Store] 任务状态已更新');

            // 🔄 重新启动轮询监听 3D 模型生成进度
            // （因为在 images_ready 状态时轮询已经停止）
            logger.info('[Store] 重新启动轮询监听 3D 模型生成进度');
            get()._startPolling(taskId);
          } catch (error) {
            logger.error('[Store] 生成3D模型异常:', error);

            // 更新为失败状态
            set(state => {
              const task = state.tasks.find(t => t.id === taskId);
              if (task) {
                task.status = 'failed';
                task.error = error instanceof Error ? error.message : '未知错误';
                task.updatedAt = new Date();
              }

              // 同步更新 currentTask
              if (state.currentTask?.id === taskId) {
                state.currentTask.status = 'failed';
                state.currentTask.error = error instanceof Error ? error.message : '未知错误';
                state.currentTask.updatedAt = new Date();
              }
            });

            // 重新 throw 以便上层捕获
            throw error;
          }
        },

        // 取消任务
        cancelTask: (taskId: string) => {
          logger.info('[Store] 取消任务:', taskId);

          // 停止轮询
          get()._stopPolling();

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
          logger.info('[Store] 删除任务:', taskId);

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

        // 启动轮询（内部方法）
        _startPolling: (taskId: string) => {
          logger.info('[Store] 启动轮询:', taskId);

          // 清除之前的定时器（确保只有一个轮询）
          get()._stopPolling();

          // 保存上次更新时间（用于 HTTP 304 优化）
          let lastUpdatedAt: string | undefined;

          // 定义轮询函数
          const pollTask = async () => {
            try {
              logger.debug('[Store] 执行轮询查询:', { taskId, lastUpdatedAt });

              const task = get().tasks.find(t => t.id === taskId);

              // 如果任务不存在或已取消，停止轮询
              if (!task || task.status === 'cancelled') {
                logger.info('[Store] 任务不存在或已取消，停止轮询:', {
                  taskExists: !!task,
                  status: task?.status,
                });
                get()._stopPolling();
                return;
              }

              logger.debug('[Store] 当前任务状态:', {
                taskId,
                status: task.status,
                imageProgress: task.imageProgress,
                modelProgress: task.modelProgress,
              });

              // 如果任务已完成（图片完成、模型完成、失败），停止轮询
              const finishedStatuses: TaskStatus[] = ['images_ready', 'model_ready', 'failed'];
              if (finishedStatuses.includes(task.status)) {
                logger.info('[Store] 任务已完成，停止轮询:', {
                  status: task.status,
                  reason: '任务状态为终止状态',
                });
                get()._stopPolling();
                return;
              }

              // 调用 API 查询任务状态
              logger.debug('[Store] 调用 fetchTaskStatus API:', { taskId, since: lastUpdatedAt });
              const result = await fetchTaskStatus(taskId, lastUpdatedAt);

              // 处理 HTTP 304 Not Modified
              if (!result.success && result.error.hasStatus(304)) {
                logger.debug('[Store] 任务状态未更新 (HTTP 304)');
                return;
              }

              if (!result.success) {
                logger.error('[Store] 查询任务状态失败:', {
                  message: result.error.message,
                  status: result.error.status,
                });
                return;
              }

              logger.debug('[Store] API 返回数据:', {
                taskId,
                status: result.data.status,
                phase: result.data.phase,
                updatedAt: result.data.updatedAt,
              });

              // 适配后端响应
              const updatedTask = adaptBackendTask(result.data);

              // 更新 lastUpdatedAt（用于下次轮询）
              lastUpdatedAt = result.data.updatedAt;

              logger.debug('[Store] 任务状态已更新:', {
                taskId,
                oldStatus: task.status,
                newStatus: updatedTask.status,
                imageProgress: updatedTask.imageProgress,
                modelProgress: updatedTask.modelProgress,
              });

              // 更新状态
              get()._updateTaskProgress(taskId, updatedTask);

              // 智能停止轮询：检查任务是否已完成
              if (finishedStatuses.includes(updatedTask.status)) {
                logger.info('[Store] 任务已完成，停止轮询:', {
                  status: updatedTask.status,
                  reason: '任务状态更新为终止状态',
                });
                get()._stopPolling();
              }
            } catch (error) {
              logger.error('[Store] 轮询异常:', error);
            }
          };

          // 立即执行一次
          logger.info('[Store] 立即执行首次轮询');
          pollTask();

          // 每 2 秒轮询一次
          logger.info('[Store] 设置定时器，每 2 秒轮询一次');
          pollingIntervalId = setInterval(pollTask, 2000);
        },

        // 停止轮询（内部方法）
        _stopPolling: () => {
          if (pollingIntervalId) {
            logger.info('[Store] 停止轮询');
            clearInterval(pollingIntervalId);
            pollingIntervalId = null;
          }
        },

        // 重置状态
        reset: () => {
          logger.info('[Store] 重置创作状态');

          // 停止轮询
          get()._stopPolling();

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

// 选择器 hooks，用于性能优化
export const useCurrentTask = () => useCreateStore(state => state.currentTask);
export const useTasks = () => useCreateStore(state => state.tasks);
export const useTaskById = (taskId: string) =>
  useCreateStore(state => state.tasks.find(t => t.id === taskId));

