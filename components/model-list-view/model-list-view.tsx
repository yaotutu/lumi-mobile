import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { ModelListViewProps } from './types';
import { SearchBar } from '@/components/search-bar';
import { ModelCard } from '@/components/model-card';
import { MasonryGrid } from '@/components/layout/masonry-grid';
import { LoadingStateView } from '@/components/layout/loading-state-view';
import { useInteractionStore } from '@/stores';
import { logger } from '@/utils/logger';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';

/**
 * 模型列表视图组件
 *
 * 完整的模型列表视图，集成了：
 * - 搜索栏（可选）
 * - 下拉刷新
 * - 无限滚动加载更多
 * - 加载/错误/空状态处理
 * - 双列瀑布流布局
 * - 模型卡片展示
 * - 点赞收藏功能
 * - 页面聚焦时自动同步交互状态
 *
 * @example
 * ```tsx
 * <ModelListView
 *   models={store.models}
 *   loading={store.loading}
 *   refreshing={store.refreshing}
 *   error={store.error}
 *   hasMore={store.hasMore}
 *   onRefresh={store.refreshModels}
 *   onLoadMore={store.loadMore}
 *   onModelPress={(id) => router.push(`/model/${id}`)}
 *   onRetry={() => store.fetchModels(1)}
 *   enableSearch={true}
 *   emptyText="暂无模型"
 * />
 * ```
 */
export function ModelListView({
  models,
  loading,
  refreshing,
  error,
  hasMore,
  searchQuery = '',
  onRefresh,
  onLoadMore,
  onModelPress,
  onRetry,
  onSearchChange,
  enableSearch = false,
  searchPlaceholder = '搜索...',
  emptyText = '暂无数据',
  headerComponent,
}: ModelListViewProps) {
  // ==================== Hooks ====================
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 从 Interaction Store 获取批量加载方法
  const fetchBatchStatus = useInteractionStore(state => state.fetchBatchStatus);

  // 监听页面聚焦状态
  const isFocused = useIsFocused();

  // 标记是否已经初始加载过交互状态（避免首次加载两次）
  const hasInitialLoadedRef = useRef(false);

  // ==================== 批量加载交互状态（首次加载） ====================
  /**
   * 模型列表加载完成后，批量获取所有模型的点赞收藏状态
   * 避免 N+1 查询问题
   */
  useEffect(() => {
    if (models && models.length > 0) {
      // 提取所有模型 ID
      const modelIds = models.map(model => model.id);
      // 批量加载交互状态
      logger.info(`[ModelListView] 首次批量加载 ${modelIds.length} 个模型的交互状态`);
      fetchBatchStatus(modelIds);
      // 标记已初始加载
      hasInitialLoadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]); // ✅ 只依赖 models，避免 fetchBatchStatus 导致的无限循环

  // ==================== 页面聚焦时重新加载交互状态和数量 ====================
  /**
   * 当用户从详情页返回列表页时：
   * 1. 重新加载交互状态（isLiked, isFavorited）
   * 2. 通过 onRefresh 刷新列表数据（包括 likeCount, favoriteCount）
   * 这样可以确保用户在详情页修改的状态能够完全同步到列表页
   */
  useEffect(() => {
    // 只有在页面聚焦、已经初始加载过、且有模型数据时才重新加载
    if (isFocused && hasInitialLoadedRef.current && models && models.length > 0) {
      // 1. 批量重新加载交互状态（图标状态）
      const modelIds = models.map(model => model.id);
      logger.info(`[ModelListView] 页面聚焦，重新加载 ${modelIds.length} 个模型的交互状态`);
      fetchBatchStatus(modelIds);

      // 2. 刷新列表数据（数量）
      // 注意：这里使用静默刷新（不显示 RefreshControl），避免打断用户
      logger.info(`[ModelListView] 页面聚焦，刷新模型列表数据以同步最新数量`);
      onRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]); // ✅ 只依赖 isFocused，避免频繁触发

  // ==================== 渲染模型卡片 ====================
  /**
   * 渲染单个模型卡片
   */
  const renderModelCard = (model: (typeof models)[0]) => {
    return (
      <ModelCard
        key={model.id}
        modelId={model.id}
        title={model.name}
        imageUrl={model.previewImageUrl}
        likes={model.likeCount}
        favorites={model.favoriteCount || 0}
        onPress={onModelPress}
      />
    );
  };

  // ==================== 渲染 ====================
  return (
    <View style={styles.container}>
      {/* 搜索栏（可选） */}
      {enableSearch && (
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      )}

      {/* 顶部加载指示器 - 加载更多时显示在顶部，不遮挡内容 */}
      {loading && !refreshing && models.length > 0 && (
        <View style={styles.topLoadingIndicator}>
          <ActivityIndicator size="small" color={isDark ? Colors.dark.tint : Colors.light.tint} />
        </View>
      )}

      {/* 使用 LoadingStateView 处理首次加载、错误、空状态 */}
      <LoadingStateView
        loading={loading && !refreshing && models.length === 0} // 首次加载
        error={error}
        isEmpty={models.length === 0 && !loading}
        onRetry={onRetry}
        loadingText="加载中..."
        emptyText={emptyText}
      >
        {/* 瀑布流网格 */}
        <MasonryGrid
          data={models}
          renderItem={renderModelCard}
          keyExtractor={model => model.id}
          numColumns={2} // 双列布局
          columnGap={Spacing.md} // 列间距
          rowGap={Spacing.md} // 行间距
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={hasMore ? onLoadMore : undefined} // 只有还有更多数据时才触发加载更多
          onEndReachedThreshold={100} // 距离底部 100px 时触发
          ListHeaderComponent={headerComponent}
        />
      </LoadingStateView>
    </View>
  );
}

/**
 * 样式定义
 */
const styles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
  },

  // 顶部加载指示器样式
  topLoadingIndicator: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
