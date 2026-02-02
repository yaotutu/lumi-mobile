/**
 * Interaction Store 类型定义
 */

import type { ModelInteractionStatus } from '@/types';

/**
 * 交互状态映射
 * key: 模型 ID
 * value: 交互状态（isLiked, isFavorited）
 */
export type InteractionStatusMap = Record<string, ModelInteractionStatus>;

/**
 * Interaction Store 状态接口
 */
export interface InteractionState {
  /** 交互状态映射 { modelId: { isLiked, isFavorited } } */
  statusMap: InteractionStatusMap;

  /** 正在操作的模型 ID 集合（用于防止重复点击） */
  loadingIds: Set<string>;

  /**
   * 批量加载交互状态
   * @param modelIds 模型 ID 数组
   */
  fetchBatchStatus: (modelIds: string[]) => Promise<void>;

  /**
   * 获取单个模型的交互状态
   * @param modelId 模型 ID
   * @returns 交互状态，如果未加载则返回默认值
   */
  getStatus: (modelId: string) => ModelInteractionStatus;

  /**
   * 切换点赞状态
   * @param modelId 模型 ID
   * @param currentLikes 当前点赞数
   * @returns 返回最新的状态和计数
   */
  toggleLike: (
    modelId: string,
    currentLikes: number
  ) => Promise<{ isLiked: boolean; likeCount: number }>;

  /**
   * 切换收藏状态
   * @param modelId 模型 ID
   * @param currentFavorites 当前收藏数
   * @returns 返回最新的状态和计数
   */
  toggleFavorite: (
    modelId: string,
    currentFavorites: number
  ) => Promise<{ isFavorited: boolean; favoriteCount: number }>;

  /**
   * 更新单个模型的交互状态
   * @param modelId 模型 ID
   * @param status 新的交互状态
   */
  updateStatus: (modelId: string, status: Partial<ModelInteractionStatus>) => void;

  /**
   * 清空所有交互状态（用户登出时调用）
   */
  clearAll: () => void;
}

/**
 * Interaction Store 实现
 * 管理用户对模型的点赞和收藏状态
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { fetchBatchInteractions, toggleInteraction } from '@/services';
import { logger } from '@/utils/logger';
import { categorizeError, logError } from '@/utils/error-handler';

/**
 * 默认交互状态（未点赞、未收藏）
 */
const DEFAULT_STATUS: ModelInteractionStatus = {
  isLiked: false,
  isFavorited: false,
};

/**
 * Interaction Store 实现
 * 使用 Zustand + Immer 管理交互状态
 */
export const useInteractionStore = create<InteractionState>()(
  devtools(
    immer((set, get) => ({
      // 初始状态
      statusMap: {},
      loadingIds: new Set<string>(),

      /**
       * 批量加载交互状态
       * 用于列表页一次性获取多个模型的状态，避免多次请求
       */
      fetchBatchStatus: async (modelIds: string[]) => {
        // 过滤掉已加载的模型 ID
        const unloadedIds = modelIds.filter(id => !get().statusMap[id]);

        if (unloadedIds.length === 0) {
          logger.debug('所有模型的交互状态已加载，跳过批量请求');
          return;
        }

        logger.info(`批量加载交互状态: ${unloadedIds.length} 个模型`);

        try {
          // 调用批量 API
          const response = await fetchBatchInteractions(unloadedIds);

          // 更新状态映射
          set(state => {
            if (response.isAuthenticated) {
              // 用户已登录，使用服务端返回的状态
              Object.entries(response.interactions).forEach(([modelId, status]) => {
                state.statusMap[modelId] = status;
              });

              logger.debug(`已加载 ${Object.keys(response.interactions).length} 个模型的交互状态`);
            } else {
              // 用户未登录，设置为默认状态
              unloadedIds.forEach(modelId => {
                state.statusMap[modelId] = { ...DEFAULT_STATUS };
              });

              logger.debug('用户未登录，使用默认交互状态');
            }
          });
        } catch (error) {
          // 将 unknown error 转换为 Error 类型
          const err = error instanceof Error ? error : new Error(String(error));
          const errorInfo = categorizeError(err);
          logger.error('批量加载交互状态失败:', errorInfo);

          // 失败时设置为默认状态，避免组件无限加载
          set(state => {
            unloadedIds.forEach(modelId => {
              state.statusMap[modelId] = { ...DEFAULT_STATUS };
            });
          });

          logError(err, 'InteractionStore.fetchBatchStatus');
        }
      },

      /**
       * 获取单个模型的交互状态
       * 如果未加载则返回默认值
       */
      getStatus: (modelId: string) => {
        return get().statusMap[modelId] || { ...DEFAULT_STATUS };
      },

      /**
       * 切换点赞状态（乐观更新）
       */
      toggleLike: async (modelId: string, currentLikes: number) => {
        const { statusMap, loadingIds } = get();

        // 防止重复点击
        if (loadingIds.has(modelId)) {
          logger.warn(`模型 ${modelId} 正在操作中，跳过重复点击`);
          const currentStatus = statusMap[modelId] || DEFAULT_STATUS;
          return {
            isLiked: currentStatus.isLiked,
            likeCount: currentLikes,
          };
        }

        // 当前状态
        const currentStatus = statusMap[modelId] || DEFAULT_STATUS;
        const wasLiked = currentStatus.isLiked;

        // 1. 乐观更新 UI（立即切换状态）
        set(state => {
          state.loadingIds.add(modelId);
          if (!state.statusMap[modelId]) {
            state.statusMap[modelId] = { ...DEFAULT_STATUS };
          }
          state.statusMap[modelId].isLiked = !wasLiked;
        });

        // 乐观计算点赞数
        const optimisticLikes = wasLiked ? currentLikes - 1 : currentLikes + 1;

        logger.info(`乐观更新点赞状态: modelId=${modelId}, isLiked=${!wasLiked}`);

        try {
          // 2. 调用 API
          const response = await toggleInteraction(modelId, 'LIKE');

          // 3. 使用服务端返回的权威数据
          set(state => {
            state.statusMap[modelId].isLiked = response.isInteracted;
            state.loadingIds.delete(modelId);
          });

          logger.info(
            `✅ 点赞状态切换成功: modelId=${modelId}, isLiked=${response.isInteracted}, likeCount=${response.likeCount}`
          );
          logger.debug(`📊 当前 statusMap[${modelId}]:`, get().statusMap[modelId]);

          return {
            isLiked: response.isInteracted,
            likeCount: response.likeCount,
          };
        } catch (error) {
          // 4. 失败时回滚状态
          // 将 unknown error 转换为 Error 类型
          const err = error instanceof Error ? error : new Error(String(error));
          const errorInfo = categorizeError(err);
          logger.error('切换点赞状态失败:', errorInfo);

          set(state => {
            state.statusMap[modelId].isLiked = wasLiked; // 回滚到初始状态
            state.loadingIds.delete(modelId);
          });

          logError(err, 'InteractionStore.toggleLike');

          // 返回回滚后的状态
          return {
            isLiked: wasLiked,
            likeCount: currentLikes,
          };
        }
      },

      /**
       * 切换收藏状态（乐观更新）
       */
      toggleFavorite: async (modelId: string, currentFavorites: number) => {
        const { statusMap, loadingIds } = get();

        // 防止重复点击
        if (loadingIds.has(modelId)) {
          logger.warn(`模型 ${modelId} 正在操作中，跳过重复点击`);
          const currentStatus = statusMap[modelId] || DEFAULT_STATUS;
          return {
            isFavorited: currentStatus.isFavorited,
            favoriteCount: currentFavorites,
          };
        }

        // 当前状态
        const currentStatus = statusMap[modelId] || DEFAULT_STATUS;
        const wasFavorited = currentStatus.isFavorited;

        // 1. 乐观更新 UI（立即切换状态）
        set(state => {
          state.loadingIds.add(modelId);
          if (!state.statusMap[modelId]) {
            state.statusMap[modelId] = { ...DEFAULT_STATUS };
          }
          state.statusMap[modelId].isFavorited = !wasFavorited;
        });

        // 乐观计算收藏数
        const optimisticFavorites = wasFavorited ? currentFavorites - 1 : currentFavorites + 1;

        logger.info(`乐观更新收藏状态: modelId=${modelId}, isFavorited=${!wasFavorited}`);

        try {
          // 2. 调用 API
          const response = await toggleInteraction(modelId, 'FAVORITE');

          // 3. 使用服务端返回的权威数据
          set(state => {
            state.statusMap[modelId].isFavorited = response.isInteracted;
            state.loadingIds.delete(modelId);
          });

          logger.info(
            `✅ 收藏状态切换成功: modelId=${modelId}, isFavorited=${response.isInteracted}, favoriteCount=${response.favoriteCount}`
          );
          logger.debug(`📊 当前 statusMap[${modelId}]:`, get().statusMap[modelId]);

          return {
            isFavorited: response.isInteracted,
            favoriteCount: response.favoriteCount,
          };
        } catch (error) {
          // 4. 失败时回滚状态
          // 将 unknown error 转换为 Error 类型
          const err = error instanceof Error ? error : new Error(String(error));
          const errorInfo = categorizeError(err);
          logger.error('切换收藏状态失败:', errorInfo);

          set(state => {
            state.statusMap[modelId].isFavorited = wasFavorited; // 回滚到初始状态
            state.loadingIds.delete(modelId);
          });

          logError(err, 'InteractionStore.toggleFavorite');

          // 返回回滚后的状态
          return {
            isFavorited: wasFavorited,
            favoriteCount: currentFavorites,
          };
        }
      },

      /**
       * 更新单个模型的交互状态
       */
      updateStatus: (modelId: string, status: Partial<ModelInteractionStatus>) => {
        set(state => {
          if (!state.statusMap[modelId]) {
            state.statusMap[modelId] = { ...DEFAULT_STATUS };
          }
          Object.assign(state.statusMap[modelId], status);
        });
      },

      /**
       * 清空所有交互状态（用户登出时调用）
       */
      clearAll: () => {
        logger.info('清空所有交互状态');
        set({
          statusMap: {},
          loadingIds: new Set<string>(),
        });
      },
    })),
    { name: 'InteractionStore' }
  )
);
