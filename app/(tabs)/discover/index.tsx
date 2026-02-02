import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { router } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/screen-wrapper';
import { ModelListView } from '@/components/model-list-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAsyncController } from '@/hooks/useAsyncController';
import { useGalleryStore } from '@/stores';
import { logger } from '@/utils/logger';

/**
 * 发现页面
 *
 * 展示最新的模型列表，支持下拉刷新和无限滚动加载
 */
export default function DiscoverScreen() {
  // ==================== Hooks ====================
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 异步操作控制器，用于取消请求
  const { createController } = useAsyncController();

  // 从 Gallery Store 获取状态和方法
  const store = useGalleryStore();

  // ==================== 初始化加载 ====================
  /**
   * 组件挂载时加载第一页数据
   */
  useEffect(() => {
    const controller = createController();
    store.fetchModels(1, {}, controller);
  }, [store.fetchModels, createController]);

  // ==================== 事件处理 ====================
  /**
   * 处理模型卡片点击事件
   * 跳转到模型详情页面
   */
  const handleModelPress = (modelId: string) => {
    logger.info('🔍 [DiscoverScreen] 点击模型卡片，跳转到模型详情:', modelId);
    router.push(`/model/${modelId}`);
  };

  /**
   * 处理错误重试
   * 清除错误状态并重新加载第一页
   */
  const handleRetry = () => {
    const controller = createController();
    store.clearError();
    store.fetchModels(1, {}, controller);
  };

  /**
   * 处理搜索输入变化
   * 调用 Store 的搜索方法
   */
  const handleSearchChange = (query: string) => {
    store.searchModels(query);
  };

  // ==================== 渲染 ====================
  return (
    <ScreenWrapper edges={['top']}>
      {/* 状态栏 */}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? Colors.dark.background : Colors.light.background}
      />

      {/* 模型列表视图 */}
      <ModelListView
        // 数据和状态
        models={store.models}
        loading={store.loading}
        refreshing={store.refreshing}
        error={store.error}
        hasMore={store.hasMore}
        searchQuery={store.searchQuery}
        // 回调
        onRefresh={store.refreshModels}
        onLoadMore={store.loadMore}
        onModelPress={handleModelPress}
        onRetry={handleRetry}
        onSearchChange={handleSearchChange}
        // UI 配置
        enableSearch={true}
        searchPlaceholder="Search for models..."
        emptyText="暂无模型"
      />
    </ScreenWrapper>
  );
}
