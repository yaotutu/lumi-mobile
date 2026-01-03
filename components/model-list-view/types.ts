import type { ReactNode } from 'react';
import type { ModelSummary } from '@/types';

/**
 * 模型列表视图组件的 Props 接口
 */
export interface ModelListViewProps {
  // ==================== 数据和状态 ====================
  /**
   * 模型列表数据
   */
  models: ModelSummary[];

  /**
   * 是否正在加载（首次加载）
   */
  loading: boolean;

  /**
   * 是否正在刷新（下拉刷新）
   */
  refreshing: boolean;

  /**
   * 错误信息，null 表示无错误
   */
  error: string | null;

  /**
   * 是否还有更多数据可加载
   */
  hasMore: boolean;

  /**
   * 搜索关键词（可选）
   */
  searchQuery?: string;

  // ==================== 回调 ====================
  /**
   * 下拉刷新回调
   */
  onRefresh: () => void;

  /**
   * 加载更多回调
   */
  onLoadMore: () => void;

  /**
   * 点击模型卡片回调
   * @param modelId - 模型 ID
   */
  onModelPress: (modelId: string) => void;

  /**
   * 错误重试回调
   */
  onRetry: () => void;

  /**
   * 搜索输入变化回调（可选）
   * @param query - 搜索关键词
   */
  onSearchChange?: (query: string) => void;

  // ==================== UI 配置 ====================
  /**
   * 是否显示搜索栏，默认 false
   */
  enableSearch?: boolean;

  /**
   * 搜索框占位符文本，默认"搜索..."
   */
  searchPlaceholder?: string;

  /**
   * 空状态提示文本，默认"暂无数据"
   */
  emptyText?: string;

  /**
   * 自定义头部组件（可选）
   */
  headerComponent?: ReactNode;
}
