import { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, Text } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { AuthGuard } from '@/components/auth';
import { ThemedText } from '@/components/themed-text';
import { LoadingStateView } from '@/components/loading-state-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAsyncController } from '@/hooks/useAsyncController';
import { fetchTaskList, type BackendGenerationTask } from '@/services/api/tasks';
import { logger } from '@/utils/logger';
import { Spacing, FontSize, FontWeight, BorderRadius, Colors } from '@/constants/theme';
import { useFocusEffect } from 'expo-router';
import { createImmersiveHeaderOptions } from '@/utils/navigation';

/**
 * 创作历史列表页面
 * 展示用户的所有 AI 创作任务，以网格布局呈现
 */
export default function CreateHistoryScreen() {
  // ==================== Hooks ====================
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createController } = useAsyncController();

  // ==================== State ====================
  const [tasks, setTasks] = useState<BackendGenerationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // ==================== 事件处理 ====================
  /**
   * 处理返回按钮
   */
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile');
    }
  }, []);

  /**
   * 获取导航栏配置
   */
  const getHeaderOptions = useCallback(() => {
    const baseOptions = createImmersiveHeaderOptions({
      title: '创作历史', // 显示标题
      colorScheme,
      transparent: false,
    });

    return {
      ...baseOptions,
      // 隐藏默认返回按钮
      headerBackVisible: false,
      // 自定义左侧返回按钮
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={isDark ? '#0A84FF' : '#007AFF'}
          />
          <ThemedText
            style={[
              styles.headerBackText,
              { color: isDark ? '#0A84FF' : '#007AFF' },
            ]}
          >
            返回
          </ThemedText>
        </TouchableOpacity>
      ),
    };
  }, [colorScheme, isDark, handleBack]);

  /**
   * 加载任务列表
   */
  const loadTasks = useCallback(
    async (pageNum: number, isRefresh: boolean = false) => {
      try {
        logger.info('[CreateHistory] 加载任务列表:', { page: pageNum, isRefresh });

        // 设置加载状态
        if (isRefresh) {
          setRefreshing(true);
        } else if (pageNum === 1) {
          setLoading(true);
        }

        // 清除错误
        setError(null);

        // 创建取消控制器
        const controller = createController();

        // 调用 API
        const result = await fetchTaskList(pageNum, 20);

        if (!result.success) {
          throw new Error(result.error.message);
        }

        logger.info('[CreateHistory] 任务列表加载成功:', {
          total: result.data.total,
          count: result.data.items.length,
        });

        // 更新数据
        if (isRefresh || pageNum === 1) {
          // 刷新或首次加载，替换数据
          setTasks(result.data.items);
        } else {
          // 加载更多，追加数据
          setTasks(prev => [...prev, ...result.data.items]);
        }

        // 更新分页状态
        setPage(pageNum);
        setHasMore(result.data.items.length === 20); // 如果返回20条，说明可能还有更多
      } catch (err) {
        logger.error('[CreateHistory] 加载任务列表失败:', err);
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [createController]
  );

  /**
   * 页面聚焦时加载数据
   */
  useFocusEffect(
    useCallback(() => {
      loadTasks(1);
    }, [loadTasks])
  );

  /**
   * 下拉刷新
   */
  const handleRefresh = useCallback(() => {
    loadTasks(1, true);
  }, [loadTasks]);

  /**
   * 加载更多
   */
  const handleLoadMore = useCallback(() => {
    if (!loading && !refreshing && hasMore) {
      loadTasks(page + 1);
    }
  }, [loading, refreshing, hasMore, page, loadTasks]);

  /**
   * 点击任务卡片
   */
  const handleTaskPress = useCallback((taskId: string) => {
    logger.info('[CreateHistory] 点击任务卡片:', taskId);
    router.push(`/create-history/${taskId}`);
  }, []);

  /**
   * 重试加载
   */
  const handleRetry = useCallback(() => {
    loadTasks(1);
  }, [loadTasks]);

  // ==================== 渲染任务卡片 ====================
  /**
   * 获取任务的预览图
   * 优先使用选中的图片，否则使用第一张图片
   */
  const getTaskPreviewImage = (task: BackendGenerationTask): string | null => {
    if (task.selectedImageIndex !== null && task.images) {
      const selectedImage = task.images.find(img => img.index === task.selectedImageIndex);
      if (selectedImage?.imageUrl) {
        return selectedImage.imageUrl;
      }
    }

    // 使用第一张图片
    return task.images?.[0]?.imageUrl || null;
  };

  /**
   * 渲染单个任务卡片
   */
  const renderTaskCard = ({ item }: { item: BackendGenerationTask }) => {
    const previewImage = getTaskPreviewImage(item);

    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          },
        ]}
        onPress={() => handleTaskPress(item.id)}
        activeOpacity={0.7}
      >
        {/* 预览图 */}
        {previewImage ? (
          <Image source={{ uri: previewImage }} style={styles.taskImage} resizeMode="cover" />
        ) : (
          <View
            style={[
              styles.taskImagePlaceholder,
              { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
            ]}
          >
            <ThemedText style={styles.placeholderText}>No Image</ThemedText>
          </View>
        )}

        {/* 任务信息 */}
        <View style={styles.taskInfo}>
          <ThemedText numberOfLines={2} style={styles.taskPrompt}>
            {item.originalPrompt}
          </ThemedText>
          <ThemedText style={styles.taskDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  // ==================== 渲染 ====================
  return (
    <AuthGuard>
      {/* 配置导航栏 */}
      <Stack.Screen options={getHeaderOptions()} />

      {/* 页面内容 */}
      <ScreenWrapper edges={[]} backgroundColor={isDark ? '#000000' : '#FFFFFF'}>
        <View style={styles.container}>
          {/* 列表 */}
          {loading && tasks.length === 0 ? (
            <LoadingStateView type="loading" message="加载中..." />
          ) : error ? (
            <LoadingStateView type="error" message={error} onRetry={handleRetry} />
          ) : tasks.length === 0 ? (
            <LoadingStateView type="empty" message="暂无创作记录" />
          ) : (
            <FlatList
              data={tasks}
              renderItem={renderTaskCard}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
            />
          )}
        </View>
      </ScreenWrapper>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 导航栏样式
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerBackText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  headerRightContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    opacity: 0.6,
  },
  // 列表样式
  listContent: {
    paddingHorizontal: Spacing.lg, // 左右内边距 - 16px
    paddingTop: Spacing.lg, // 顶部内边距 - 16px，避免内容贴着导航栏
    paddingBottom: Spacing.xl, // 底部内边距 - 24px
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  taskCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  taskImage: {
    width: '100%',
    aspectRatio: 1,
  },
  taskImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FontSize.sm,
    opacity: 0.4,
  },
  taskInfo: {
    padding: Spacing.sm,
  },
  taskPrompt: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  taskDate: {
    fontSize: FontSize.xs,
    opacity: 0.5,
  },
});
