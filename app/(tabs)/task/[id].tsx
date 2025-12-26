import { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { useCreateStore } from '@/stores';
import { ImageGenerating } from '@/components/pages/create/image-generating';
import { ModelGenerating } from '@/components/pages/create/model-generating';
import { ModelComplete } from '@/components/pages/create/model-complete';
import { logger } from '@/utils/logger';

/**
 * 任务详情页面
 * 根据任务状态显示不同的UI：
 * - generating_images: 图片生成中（骨架屏）
 * - images_ready: 图片已生成（显示真实图片供选择）
 * - generating_model: 3D模型生成中
 * - model_ready: 生成完成
 * - failed: 失败页面
 */
export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { contentPaddingBottom } = useSafeAreaSpacing();

  // 从 Store 获取任务
  const task = useCreateStore(state => state.getTask(id));
  const selectImage = useCreateStore(state => state.selectImage);
  const generateModel = useCreateStore(state => state.generateModel);
  const cancelTask = useCreateStore(state => state.cancelTask);

  const backgroundColor = isDark ? '#000000' : '#F5F5F7';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  // 根据任务状态设置页面标题
  const getPageTitle = () => {
    if (!task) return '加载中...';
    switch (task.status) {
      case 'generating_images':
        return '生成中...';
      case 'images_ready':
        return '选择风格';
      case 'generating_model':
        return '生成 3D 中...';
      case 'model_ready':
        return '生成完成';
      case 'failed':
        return '生成失败';
      default:
        return 'AI 创作';
    }
  };

  useEffect(() => {
    if (!task) {
      logger.warn('任务不存在:', id);
      // 返回上一页
      router.back();
    }
  }, [task, id]);

  // 处理图片选择
  const handleSelectImage = async (imageId: string) => {
    if (!task) return;
    await selectImage(task.id, imageId);
  };

  // 处理生成3D模型
  const handleGenerateModel = async () => {
    if (!task) return;
    await generateModel(task.id);
  };

  // 处理取消任务
  const handleCancel = () => {
    if (!task) return;
    cancelTask(task.id);
    router.back();
  };

  // 处理查看3D模型
  const handleView3D = () => {
    if (!task?.modelUrl) return;
    // 导航到3D查看器页面
    router.push(`/model-viewer/${task.id}`);
  };

  // 加载中状态
  if (!task) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor }]}>
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
        <Text style={[styles.loadingText, { color: textColor }]}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Stack.Screen 配置导航栏 */}
      <Stack.Screen
        options={{
          title: getPageTitle(),
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      {/* 根据任务状态渲染不同的组件 */}
      {/* 图片生成中或图片已生成（在同一组件中处理） */}
      {(task?.status === 'generating_images' || task?.status === 'images_ready') && (
        <ImageGenerating
          task={task}
          onSelectImage={handleSelectImage}
          onGenerateModel={handleGenerateModel}
          onCancel={handleCancel}
          paddingBottom={contentPaddingBottom}
          isDark={isDark}
        />
      )}

      {task?.status === 'generating_model' && (
        <ModelGenerating
          task={task}
          onCancel={handleCancel}
          paddingBottom={contentPaddingBottom}
          isDark={isDark}
        />
      )}

      {task?.status === 'model_ready' && (
        <ModelComplete
          task={task}
          onView3D={handleView3D}
          onCreateNew={() => router.push('/(tabs)/create')}
          paddingBottom={contentPaddingBottom}
          isDark={isDark}
        />
      )}

      {task?.status === 'failed' && (
        <View style={[styles.centerContent, { paddingBottom: contentPaddingBottom }]}>
          <Text style={[styles.errorTitle, { color: '#FF3B30' }]}>生成失败</Text>
          <Text style={[styles.errorMessage, { color: textColor }]}>{task.error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
});
