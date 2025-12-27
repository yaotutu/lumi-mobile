import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { ModelCard } from '@/components/model-card';
import { useAsyncController } from '@/hooks/useAsyncController';
import { categorizeError, logError } from '@/utils/error-handler';
import { useGalleryStore } from '@/stores';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ModelDetail } from '@/components/model-detail';
import { fetchModelDetail } from '@/services';
import { logger } from '@/utils/logger';
import type { GalleryModel } from '@/types';

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { contentPaddingBottom } = useSafeAreaSpacing();

  // 异步操作控制器
  const { createController } = useAsyncController();

  // 从 Gallery Store 获取状态和方法
  const { models, loading, refreshing, error, fetchModels, refreshModels, clearError } =
    useGalleryStore();

  // 模型详情相关状态
  const [selectedModel, setSelectedModel] = useState<GalleryModel | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // 防止重复点击关闭

  // 详情覆盖层动画
  const [detailVisible] = useState(new Animated.Value(0));

  // 组件挂载时加载数据
  useEffect(() => {
    const controller = createController();
    fetchModels(1, {}, controller);
  }, [fetchModels, createController]);

  // 监听选中模型变化，执行显示动画
  useEffect(() => {
    if (selectedModel && !isClosing) {
      // 显示详情覆盖层
      Animated.timing(detailVisible, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedModel, isClosing, detailVisible]);

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

  // 处理模型卡片点击 - 在当前页面展开详情
  const handleModelPress = async (modelId: string) => {
    logger.info('🔍 点击模型卡片 (覆盖层模式):', modelId);

    // 显示加载状态
    setDetailLoading(true);

    try {
      // 获取完整的模型详情
      const controller = createController();
      const modelDetail = await fetchModelDetail(modelId);

      // 更新选中模型
      setSelectedModel(modelDetail);
      setDetailLoading(false);

      logger.info('✅ 成功加载模型详情:', modelDetail.name);
    } catch (error) {
      logger.error('加载模型详情失败:', error);
      setDetailLoading(false);

      // 显示错误提示（可选）
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const errorInfo = categorizeError(errorObj);
      logger.error('模型详情加载失败:', errorInfo.message);
    }
  };

  // 关闭模型详情
  const handleCloseDetail = useCallback(() => {
    // 防止重复点击
    if (isClosing || !selectedModel) {
      logger.debug('正在关闭或已关闭，忽略此次点击');
      return;
    }

    logger.info('🔙 关闭模型详情覆盖层');
    setIsClosing(true);

    // 先执行关闭动画
    Animated.timing(detailVisible, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // 动画完成后清除状态
      setSelectedModel(null);
      setIsClosing(false);
      logger.debug('✅ 模型详情已关闭');
    });
  }, [isClosing, selectedModel, detailVisible]);

  // 监听 Android 返回键，当覆盖层打开时关闭覆盖层
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedModel && !isClosing) {
        logger.info('📱 Android 返回键: 关闭模型详情覆盖层');
        handleCloseDetail();
        return true; // 拦截返回键，阻止路由返回
      }
      return false; // 允许正常的返回行为
    });

    return () => backHandler.remove();
  }, [selectedModel, isClosing, handleCloseDetail]);

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
                    onPress={handleModelPress}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* 模型详情覆盖层 - 使用绝对定位而非 Modal */}
      <Animated.View
        style={[
          styles.detailOverlay,
          {
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
            opacity: detailVisible,
            transform: [
              {
                translateY: detailVisible.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0], // 从底部滑入
                }),
              },
            ],
            // 选中模型且不在关闭状态时才响应点击
            pointerEvents: selectedModel && !isClosing ? 'auto' : 'none',
          },
        ]}
      >
        {selectedModel && (
          <ModelDetail
            model={selectedModel}
            onBack={handleCloseDetail}
            onShare={() => {
              logger.info('分享模型:', selectedModel.name);
            }}
            onBookmark={() => {
              logger.info('收藏模型:', selectedModel.name);
            }}
            onDownload={() => {
              logger.info('下载模型:', selectedModel.name);
            }}
            onAddToQueue={() => {
              logger.info('加入队列:', selectedModel.name);
            }}
            on3DPreview={() => {
              logger.info('预览 3D 模型:', selectedModel.name);
            }}
          />
        )}

        {/* 加载状态 */}
        {detailLoading && (
          <View
            style={[
              styles.detailLoadingContainer,
              { backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
            ]}
          >
            <ActivityIndicator size="large" color={isDark ? Colors.dark.tint : Colors.light.tint} />
            <ThemedText style={styles.detailLoadingText}>加载中...</ThemedText>
          </View>
        )}
      </Animated.View>
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
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100, // 确保在所有内容之上
    elevation: 100, // Android elevation
  },
  detailLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLoadingText: {
    marginTop: Spacing.lg,
    opacity: 0.6,
  },
});
