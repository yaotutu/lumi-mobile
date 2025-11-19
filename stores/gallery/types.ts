import type { GalleryModel } from '@/types';

export interface GalleryState {
  // 数据状态
  models: GalleryModel[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // 分页状态
  currentPage: number;
  hasMore: boolean;
  pageSize: number;

  // 搜索状态
  searchQuery: string;
  searchResults: GalleryModel[];
  isSearching: boolean;

  // 缓存控制
  lastFetchTime: number;
  cacheDuration: number; // 缓存持续时间（毫秒）

  // Actions
  fetchModels: (page?: number, options?: FetchOptions) => Promise<void>;
  refreshModels: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchModels: (query: string) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
  reset: () => void;
}

export interface FetchOptions {
  sortBy?: 'latest' | 'popular';
  category?: string;
  limit?: number;
}