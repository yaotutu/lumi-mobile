import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GalleryState, FetchOptions } from './types';
import type { ModelSummary } from '@/types';
import { fetchGalleryModels } from '@/services';
import { logger } from '@/utils/logger';

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟
const DEFAULT_PAGE_SIZE = 20;

export const useGalleryStore = create<GalleryState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
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

        // 获取模型列表
        fetchModels: async (
          page = 1,
          options: FetchOptions = {},
          abortController?: AbortController
        ) => {
          const {
            models: existingModels,
            currentPage: existingPage,
            lastFetchTime,
            cacheDuration,
            pageSize,
          } = get();

          const now = Date.now();

          // 检查缓存(仅在请求第一页且没有特定选项时使用缓存)
          if (
            page === 1 &&
            !options.sort &&
            !options.category &&
            now - lastFetchTime < cacheDuration &&
            existingModels.length > 0
          ) {
            logger.debug('使用缓存的模型数据');
            return;
          }

          // 设置加载状态
          if (page === 1) {
            set({
              loading: true,
              error: null,
              refreshing: false,
            });
          } else {
            set({ loading: true });
          }

          try {
            logger.info(`获取模型数据: page=${page}, options=`, options);

            const response = await fetchGalleryModels(
              {
                sort: options.sort || 'latest',
                limit: pageSize,
                offset: (page - 1) * pageSize,
                ...(options.category && { category: options.category }),
              },
              {
                signal: abortController?.signal,
              }
            );

            // JSend 格式验证
            if (response.status !== 'success') {
              throw new Error('获取数据失败');
            }

            const newModels = response.data.items;

            // 调试日志：查看图片URL
            logger.debug('模型数据示例:', newModels[0]);
            if (newModels[0]?.previewImageUrl) {
              logger.debug('原始图片URL:', newModels[0].previewImageUrl);
              const baseURL = 'http://192.168.100.100:4000';
              logger.debug('完整图片URL应为:', `${baseURL}${newModels[0].previewImageUrl}`);
            }

            set(state => {
              if (page === 1) {
                // 第一页:替换数据
                state.models = newModels;
              } else {
                // 后续页:追加数据
                state.models = [...existingModels, ...newModels];
              }

              state.currentPage = page;
              // 根据返回的数据量判断是否还有更多
              state.hasMore = newModels.length >= pageSize;
              state.lastFetchTime = now;
              state.loading = false;
              state.error = null;
            });

            logger.info(`成功获取 ${newModels.length} 个模型，当前总数: ${get().models.length}`);
          } catch (error) {
            // 如果是取消错误,不设置错误状态
            if (error instanceof Error && error.name === 'AbortError') {
              logger.debug('请求被取消');
              return;
            }

            const errorMessage = error instanceof Error ? error.message : '加载失败，请重试';

            logger.error('获取模型失败:', error);

            set(state => {
              state.loading = false;
              state.error = errorMessage;
              state.refreshing = false;
            });
          }
        },

        // 刷新模型列表
        refreshModels: async () => {
          set({ refreshing: true, lastFetchTime: 0 }); // 重置缓存时间以强制刷新
          await get().fetchModels(1);
          set({ refreshing: false });
        },

        // 加载更多
        loadMore: async () => {
          const { currentPage, hasMore, loading } = get();

          if (!hasMore || loading) {
            return;
          }

          logger.debug('加载更多模型...');
          await get().fetchModels(currentPage + 1);
        },

        // TODO: 搜索功能待API支持
        searchModels: async (query: string) => {
          logger.info('搜索功能暂未实现');
        },

        // 清除搜索
        clearSearch: () => {
          set({
            searchQuery: '',
            searchResults: [],
          });
        },

        // 清除错误
        clearError: () => {
          set({ error: null });
        },

        // 重置状态
        reset: () => {
          set(state => {
            state.models = [];
            state.loading = false;
            state.refreshing = false;
            state.error = null;
            state.currentPage = 1;
            state.hasMore = true;
            state.searchQuery = '';
            state.searchResults = [];
            state.isSearching = false;
            state.lastFetchTime = 0;
          });
        },

        // 根据 ID 获取单个模型
        getModelById: (id: string): ModelSummary | undefined => {
          return get().models.find(model => model.id === id);
        },
      })),
      {
        name: 'gallery-store',
        partialize: state => ({
          models: state.models,
          lastFetchTime: state.lastFetchTime,
        }),
      }
    ),
    {
      name: 'GalleryStore',
    }
  )
);

// 选择器 hooks,用于性能优化
export const useGalleryModels = () => useGalleryStore(state => state.models);
export const useGalleryLoading = () => useGalleryStore(state => state.loading);
export const useGalleryRefreshing = () => useGalleryStore(state => state.refreshing);
export const useGalleryError = () => useGalleryStore(state => state.error);
export const useGalleryPagination = () =>
  useGalleryStore(state => ({
    currentPage: state.currentPage,
    hasMore: state.hasMore,
    pageSize: state.pageSize,
  }));
export const useGallerySearch = () =>
  useGalleryStore(state => ({
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    isSearching: state.isSearching,
  }));
