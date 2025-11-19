import { useCallback } from 'react';
import { useImmer } from 'use-immer';
import type { GalleryState, FetchOptions } from './types';
import type { GalleryModel } from '@/types';
import { fetchGalleryModels } from '@/services';
import { logger } from '@/utils/logger';

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟
const DEFAULT_PAGE_SIZE = 20;

// 初始状态
const initialGalleryState: GalleryState = {
  // 数据状态
  models: [],
  loading: false,
  refreshing: false,
  error: null,

  // 分页状态
  currentPage: 1,
  hasMore: true,
  pageSize: DEFAULT_PAGE_SIZE,

  // 搜索状态
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  // 缓存控制
  lastFetchTime: 0,
  cacheDuration: CACHE_DURATION,

  // Actions（将在下面定义）
  fetchModels: async () => {},
  refreshModels: async () => {},
  loadMore: async () => {},
  searchModels: async () => {},
  clearSearch: () => {},
  clearError: () => {},
  reset: () => {},
};

export const useGalleryStore = () => {
  const [state, updateState] = useImmer(initialGalleryState);

  // 获取模型列表
  const fetchModels = useCallback(async (page = 1, options: FetchOptions = {}, abortController?: AbortController) => {
    const now = Date.now();

    // 检查缓存（仅在请求第一页且没有特定选项时使用缓存）
    if (page === 1 &&
        !options.sortBy &&
        !options.category &&
        now - state.lastFetchTime < state.cacheDuration &&
        state.models.length > 0) {
      logger.debug('使用缓存的模型数据');
      return;
    }

    // 设置加载状态
    updateState((draft) => {
      if (page === 1) {
        draft.loading = true;
        draft.error = null;
        draft.refreshing = false;
      } else {
        draft.loading = true;
      }
    });

    try {
      logger.info(`获取模型数据: page=${page}, options=`, options);

      const response = await fetchGalleryModels({
        sortBy: options.sortBy || 'latest',
        limit: state.pageSize,
        offset: (page - 1) * state.pageSize,
        ...(options.category && { category: options.category }),
      }, {
        signal: abortController?.signal
      });

      if (!response.success) {
        throw new Error('获取数据失败');
      }

      const newModels = response.data.models;

      updateState((draft) => {
        if (page === 1) {
          // 第一页：替换数据
          draft.models = newModels;
        } else {
          // 后续页：追加数据
          draft.models = [...draft.models, ...newModels];
        }

        draft.currentPage = page;
        draft.hasMore = newModels.length === state.pageSize;
        draft.lastFetchTime = now;
        draft.loading = false;
        draft.error = null;
      });

      logger.info(`成功获取 ${newModels.length} 个模型，当前总数: ${state.models.length}`);

    } catch (error) {
      // 如果是取消错误，不设置错误状态
      if (error instanceof Error && error.name === 'AbortError') {
        logger.debug('请求被取消');
        return;
      }

      const errorMessage = error instanceof Error ? error.message : '加载失败，请重试';

      logger.error('获取模型失败:', error);

      updateState((draft) => {
        draft.loading = false;
        draft.error = errorMessage;
        draft.refreshing = false;
      });
    }
  }, [state.lastFetchTime, state.models.length, state.pageSize, state.cacheDuration]);

  // 刷新模型列表
  const refreshModels = useCallback(async () => {
    updateState((draft) => {
      draft.refreshing = true;
      draft.lastFetchTime = 0; // 重置缓存时间以强制刷新
    });
    await fetchModels(1);
    updateState((draft) => {
      draft.refreshing = false;
    });
  }, [fetchModels]);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) {
      return;
    }

    logger.debug('加载更多模型...');
    await fetchModels(state.currentPage + 1);
  }, [state.hasMore, state.loading, state.currentPage, fetchModels]);

  // TODO: 搜索功能待API支持
  const searchModels = useCallback(async (query: string) => {
    logger.info('搜索功能暂未实现');
  }, []);

  // 清除搜索
  const clearSearch = useCallback(() => {
    updateState((draft) => {
      draft.searchQuery = '';
      draft.searchResults = [];
    });
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    updateState((draft) => {
      draft.error = null;
    });
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    updateState((draft) => {
      draft.models = [];
      draft.loading = false;
      draft.refreshing = false;
      draft.error = null;
      draft.currentPage = 1;
      draft.hasMore = true;
      draft.searchQuery = '';
      draft.searchResults = [];
      draft.isSearching = false;
      draft.lastFetchTime = 0;
    });
  }, []);

  return {
    ...state,
    fetchModels,
    refreshModels,
    loadMore,
    searchModels,
    clearSearch,
    clearError,
    reset,
  };
};