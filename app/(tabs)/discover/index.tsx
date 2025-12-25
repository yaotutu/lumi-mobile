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
import { useRouter } from 'expo-router';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { ModelCard } from '@/components/model-card';
import { useAsyncController } from '@/hooks/useAsyncController';
import { categorizeError, logError } from '@/utils/error-handler';
import { useGalleryStore } from '@/stores';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { topInset, contentPaddingBottom } = useSafeAreaSpacing();
  const router = useRouter();

  // 异步操作控制器
  const { createController } = useAsyncController();

  // 从 Gallery Store 获取状态和方法
  const { models, loading, refreshing, error, fetchModels, refreshModels, clearError } =
    useGalleryStore();

  // 组件挂载时加载数据
  useEffect(() => {
    const controller = createController();
    fetchModels(1, {}, controller);
  }, [fetchModels, createController]);

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

  // 缓存分列计算结果，避免每次渲染都重新计算
  const { leftColumn, rightColumn } = useMemo(
    () => ({
      leftColumn: models?.filter((_: any, index: number) => index % 2 === 0) || [],
      rightColumn: models?.filter((_: any, index: number) => index % 2 === 1) || [],
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
    <ThemedView style={styles.container}>
      {/* 状态栏 */}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? Colors.dark.background : Colors.light.background}
      />

      {/* 顶部安全区域 - 使用背景色 */}
      <View
        style={[
          { paddingTop: topInset },
          {
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
          },
        ]}
      />

      {/* 搜索栏 */}
      <SearchBar placeholder="Search for models..." />

      {/* 加载状态 */}
      {loading && !refreshing && (
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
      {!loading && !errorInfo && (
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
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
