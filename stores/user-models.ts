/**
 * 用户模型相关 Store
 * 包含：我的模型、我喜欢的、我的收藏
 */

import {
  createModelListStore,
  createModelListSelectors,
  type ModelListStore,
} from './create-model-list-store';
import { fetchMyModels, fetchMyLikes, fetchMyFavorites } from '@/services';

// ==================== 我的模型 Store ====================

/**
 * 我的模型 Store
 * 管理用户创建的模型列表数据、分页、刷新等状态
 */
export const useMyModelsStore = createModelListStore(
  'my-models-store', // Store 名称，用于 devtools 和持久化
  fetchMyModels, // 数据获取函数
  {
    pageSize: 20, // 每页 20 条数据
    cacheDuration: 5 * 60 * 1000, // 缓存 5 分钟
    enableDevtools: true, // 启用 Redux DevTools
    enablePersist: true, // 启用持久化
  }
);

/**
 * 选择器 Hooks，用于性能优化
 * 避免组件订阅整个 Store，只订阅需要的数据
 */
const myModelsSelectors = createModelListSelectors(useMyModelsStore);

// 导出选择器 Hooks
export const useMyModels = myModelsSelectors.useModels;
export const useMyModelsLoading = myModelsSelectors.useLoading;
export const useMyModelsRefreshing = myModelsSelectors.useRefreshing;
export const useMyModelsError = myModelsSelectors.useError;
export const useMyModelsPagination = myModelsSelectors.usePagination;
export const useMyModelsSearch = myModelsSelectors.useSearch;

// 导出类型
export type MyModelsStore = ModelListStore;

// ==================== 我喜欢的 Store ====================

/**
 * 我喜欢的 Store
 * 管理用户喜欢的模型列表数据、分页、刷新等状态
 */
export const useMyLikesStore = createModelListStore(
  'my-likes-store', // Store 名称，用于 devtools 和持久化
  fetchMyLikes, // 数据获取函数
  {
    pageSize: 20, // 每页 20 条数据
    cacheDuration: 5 * 60 * 1000, // 缓存 5 分钟
    enableDevtools: true, // 启用 Redux DevTools
    enablePersist: true, // 启用持久化
  }
);

/**
 * 选择器 Hooks，用于性能优化
 * 避免组件订阅整个 Store，只订阅需要的数据
 */
const myLikesSelectors = createModelListSelectors(useMyLikesStore);

// 导出选择器 Hooks
export const useMyLikes = myLikesSelectors.useModels;
export const useMyLikesLoading = myLikesSelectors.useLoading;
export const useMyLikesRefreshing = myLikesSelectors.useRefreshing;
export const useMyLikesError = myLikesSelectors.useError;
export const useMyLikesPagination = myLikesSelectors.usePagination;
export const useMyLikesSearch = myLikesSelectors.useSearch;

// 导出类型
export type MyLikesStore = ModelListStore;

// ==================== 我的收藏 Store ====================

/**
 * 我的收藏 Store
 * 管理用户收藏的模型列表数据、分页、刷新等状态
 */
export const useMyFavoritesStore = createModelListStore(
  'my-favorites-store', // Store 名称，用于 devtools 和持久化
  fetchMyFavorites, // 数据获取函数
  {
    pageSize: 20, // 每页 20 条数据
    cacheDuration: 5 * 60 * 1000, // 缓存 5 分钟
    enableDevtools: true, // 启用 Redux DevTools
    enablePersist: true, // 启用持久化
  }
);

/**
 * 选择器 Hooks，用于性能优化
 * 避免组件订阅整个 Store，只订阅需要的数据
 */
const myFavoritesSelectors = createModelListSelectors(useMyFavoritesStore);

// 导出选择器 Hooks
export const useMyFavorites = myFavoritesSelectors.useModels;
export const useMyFavoritesLoading = myFavoritesSelectors.useLoading;
export const useMyFavoritesRefreshing = myFavoritesSelectors.useRefreshing;
export const useMyFavoritesError = myFavoritesSelectors.useError;
export const useMyFavoritesPagination = myFavoritesSelectors.usePagination;
export const useMyFavoritesSearch = myFavoritesSelectors.useSearch;

// 导出类型
export type MyFavoritesStore = ModelListStore;
