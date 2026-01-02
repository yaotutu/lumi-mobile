import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { ModelCard } from '@/components/model-card';
import { useAsyncController } from '@/hooks/useAsyncController';
import { categorizeError, logError } from '@/utils/error-handler';
import { useGalleryStore, useInteractionStore } from '@/stores';
import { logger } from '@/utils/logger';

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { contentPaddingBottom } = useSafeAreaSpacing();

  // 异步操作控制器
  const { createController } = useAsyncController();

  // 从 Gallery Store 获取状态和方法
  const { models, loading, refreshing, error, fetchModels, refreshModels, clearError } =
    useGalleryStore();

  // 从 Interaction Store 获取批量加载方法
  const fetchBatchStatus = useInteractionStore((state) => state.fetchBatchStatus);

  // 组件挂载时加载数据
  useEffect(() => {
    const controller = createController();
    fetchModels(1, {}, controller);
  }, [fetchModels, createController]);

  // 模型列表加载完成后，批量获取交互状态
  useEffect(() => {
    if (models && models.length > 0) {
      // 提取所有模型 ID
      const modelIds = models.map((model) => model.id);
      // 批量加载交互状态
      logger.info(`批量加载 ${modelIds.length} 个模型的交互状态`);
      fetchBatchStatus(modelIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]); // ✅ 只依赖 models，避免 fetchBatchStatus 导致的无限循环

  // 下拉刷新
  const handleRefresh = () => {
    refreshModels();
  };

  // 重新加载
  const handleRetry = () => {
    const controller = createController();
    clearError();
    fetchModels(1, {}, controller);
  };

  // 处理模型卡片点击 - 跳转到全局模型详情页面
  const handleModelPress = (modelId: string) => {
    logger.info('🔍 点击模型卡片，跳转到模型详情:', modelId);
    router.push(`/model/${modelId}`);
  };

  // 缓存分列计算结果，避免每次渲染都重新计算
  const { leftColumn, rightColumn } = useMemo(
    () => ({
      leftColumn: models?.filter((_, index) => index % 2 === 0) || [],
      rightColumn: models?.filter((_, index) => index % 2 === 1) || [],
    }),
    [models]
  );

  // 使用错误处理工具函数分类错误
  const errorInfo = useMemo(() => {
    if (!error) return null;
    const errorObj = new Error(error);
    return categorizeError(errorObj);
  }, [error]);

  return (
    <ScreenWrapper>
      {/* 状态栏 */}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? Colors.dark.background : Colors.light.background}
      />

      {/* 搜索栏 */}
      <SearchBar placeholder="Search for models..." />

      {/* 全局加载指示器 - 显示在顶部,不遮挡内容 */}
      {loading && !refreshing && models.length > 0 && (
        <View style={styles.topLoadingIndicator}>
          <ActivityIndicator size="small" color={isDark ? Colors.dark.tint : Colors.light.tint} />
        </View>
      )}

      {/* 首次加载 - 没有数据时才显示全屏 loading */}
      {loading && !refreshing && models.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? Colors.dark.tint : Colors.light.tint} />
          <ThemedText style={styles.loadingText}>加载中...</ThemedText>
        </View>
      )}

      {/* 错误状态 */}
      {errorInfo && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>
            {errorInfo.type === 'network' ? '🌐' : errorInfo.type === 'server' ? '🔧' : '⚠️'}
          </Text>
          <ThemedText style={styles.errorText}>{errorInfo.message}</ThemedText>
          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor: isDark ? 'rgba(74, 144, 226, 0.2)' : 'rgba(0, 122, 255, 0.1)',
                borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
              },
            ]}
            onPress={() => {
              if (error) {
                logError(new Error(error), 'DiscoverScreen');
              }
              handleRetry();
            }}
          >
            <Text
              style={[
                styles.retryButtonText,
                { color: isDark ? Colors.dark.tint : Colors.light.tint },
              ]}
            >
              重新加载
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 模型网格 */}
      {!errorInfo && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: contentPaddingBottom }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? Colors.dark.tint : Colors.light.tint}
            />
          }
        >
          {models.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>暂无模型</ThemedText>
            </View>
          ) : (
            <View style={styles.grid}>
              {/* 左列 */}
              <View style={styles.column}>
                {leftColumn.map((model: any) => (
                  <ModelCard
                    key={model.id}
                    modelId={model.id}
                    title={model.name}
                    imageUrl={model.previewImageUrl}
                    likes={model.likeCount}
                    favorites={model.favoriteCount || 0}
                    onPress={handleModelPress}
                  />
                ))}
              </View>

              {/* 右列 */}
              <View style={styles.column}>
                {rightColumn.map((model: any) => (
                  <ModelCard
                    key={model.id}
                    modelId={model.id}
                    title={model.name}
                    imageUrl={model.previewImageUrl}
                    likes={model.likeCount}
                    favorites={model.favoriteCount || 0}
                    onPress={handleModelPress}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom 通过 useSafeAreaSpacing 动态设置
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
  topLoadingIndicator: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  loadingText: {
    marginTop: Spacing.lg,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    opacity: 0.7,
    lineHeight: 22,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyText: {
    opacity: 0.5,
  },
});
