/**
 * 通用用户模型列表页面
 *
 * 根据路由参数 type 显示不同类型的模型列表：
 * - my-models: 我创建的模型
 * - my-favorites: 我收藏的模型
 * - my-likes: 我喜欢的模型
 */

import { useEffect, useMemo, useCallback } from 'react';
import { StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/screen-wrapper';
import { ModelListView } from '@/components/model-list-view';
import { AuthGuard } from '@/components/auth';
import { ThemedText } from '@/components/themed/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAsyncController } from '@/hooks/useAsyncController';
import { useMyModelsStore, useMyFavoritesStore, useMyLikesStore } from '@/stores';
import { logger } from '@/utils/logger';
import { createImmersiveHeaderOptions } from '@/utils/navigation';

/**
 * 页面类型配置
 */
const PAGE_CONFIG = {
  'my-models': {
    title: '我的模型',
    emptyText: '暂无模型\n快去创建你的第一个 3D 模型吧！',
    useStore: useMyModelsStore,
  },
  'my-favorites': {
    title: '我的收藏',
    emptyText: '暂无收藏\n快去发现并收藏你喜欢的模型吧！',
    useStore: useMyFavoritesStore,
  },
  'my-likes': {
    title: '我喜欢的',
    emptyText: '暂无喜欢\n快去发现并点赞你喜欢的模型吧！',
    useStore: useMyLikesStore,
  },
} as const;

/**
 * 用户模型列表页面
 */
export default function UserModelsScreen() {
  // ==================== Hooks ====================
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 获取路由参数
  const { type } = useLocalSearchParams<{ type: string }>();

  // 异步操作控制器，用于取消请求
  const { createController } = useAsyncController();

  // 根据 type 获取对应的配置
  const config = useMemo(() => {
    const validType = type as keyof typeof PAGE_CONFIG;
    return PAGE_CONFIG[validType] || PAGE_CONFIG['my-models'];
  }, [type]);

  // 根据配置获取对应的 Store
  const store = config.useStore();

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
   * 处理返回按钮
   * 从 Tabs 跳转过来的页面必须自定义返回逻辑
   */
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // 如果无法返回，跳转到个人中心
      router.push('/(tabs)/profile');
    }
  }, []);

  /**
   * 获取导航栏配置
   */
  const getHeaderOptions = useCallback(() => {
    const baseOptions = createImmersiveHeaderOptions({
      title: config.title,
      colorScheme,
      transparent: false,
    });

    return {
      ...baseOptions,
      // 隐藏默认返回按钮（避免显示 "(tabs)"）
      headerBackVisible: false,
      // 自定义左侧返回按钮
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={isDark ? '#0A84FF' : '#007AFF'} />
          <ThemedText style={[styles.headerBackText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
            返回
          </ThemedText>
        </TouchableOpacity>
      ),
    };
  }, [config.title, colorScheme, isDark, handleBack]);

  /**
   * 处理模型卡片点击事件
   * 跳转到模型详情页面
   */
  const handleModelPress = (modelId: string) => {
    logger.info(`🔍 [UserModelsScreen-${type}] 点击模型卡片，跳转到模型详情:`, modelId);
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

  // ==================== 渲染 ====================
  return (
    <AuthGuard>
      {/* 配置导航栏 */}
      <Stack.Screen options={getHeaderOptions()} />

      {/* 页面内容 - edges={[]} 因为导航栏已经处理了顶部安全区域 */}
      <ScreenWrapper edges={[]}>
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
          // 回调
          onRefresh={store.refreshModels}
          onLoadMore={store.loadMore}
          onModelPress={handleModelPress}
          onRetry={handleRetry}
          // UI 配置
          enableSearch={false} // 用户模型页面不需要搜索
          emptyText={config.emptyText}
        />
      </ScreenWrapper>
    </AuthGuard>
  );
}

/**
 * 样式定义
 */
const styles = StyleSheet.create({
  // 导航栏返回按钮样式
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerBackText: {
    fontSize: 17,
    fontWeight: '400',
  },
});
