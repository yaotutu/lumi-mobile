import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ModelDetail } from '@/components/model-detail';
import { fetchModelDetail } from '@/services';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { logger } from '@/utils/logger';
import { createImmersiveHeaderOptions } from '@/utils/navigation';
import type { GalleryModel } from '@/types';

export default function ModelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 状态管理
  const [model, setModel] = useState<GalleryModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从 API 获取模型详情
  useEffect(() => {
    if (!id) return;

    const loadModelDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        logger.info('获取模型详情:', id);

        const data = await fetchModelDetail(id);
        setModel(data);

        logger.debug('模型详情数据:', {
          id: data.id,
          name: data.name,
          modelUrl: data.modelUrl,
          previewImageUrl: data.previewImageUrl,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '加载失败';
        logger.error('获取模型详情失败:', err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadModelDetail();
  }, [id]);

  const getHeaderOptions = (title?: string, options?: { transparent?: boolean }) => {
    const baseOptions = createImmersiveHeaderOptions({
      title,
      colorScheme,
      transparent: options?.transparent ?? false,
    });

    return {
      ...baseOptions,
      // 隐藏系统默认的返回按钮
      headerBackVisible: false,
      // 自定义返回按钮，修复 iOS 第二次进入返回失效的问题
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            logger.info('Header 返回按钮被点击');
            router.back();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text}
          />
        </TouchableOpacity>
      ),
    };
  };

  // 如果模型不存在，显示错误页面
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={getHeaderOptions('模型详情')} />
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={isDark ? Colors.dark.tint : Colors.light.tint} />
          <ThemedText style={styles.loadingText}>加载中...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !model) {
    logger.warn('模型未找到:', id);
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={getHeaderOptions('模型详情')} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <ThemedText style={styles.errorTitle}>模型未找到</ThemedText>
          <ThemedText style={styles.errorMessage}>
            {error || '无法找到该模型，可能已被删除或不存在。'}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  logger.info('查看模型详情:', model.name);

  return (
    <>
      <Stack.Screen options={getHeaderOptions(model.name, { transparent: false })} />
      <ModelDetail
        model={model}
        onPrint={() => logger.info('一键打印功能待实现')}
        on3DPreview={() => {
          logger.info('打开 3D 预览:', model.name);
          router.push(`/model-viewer/${id}` as any);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: 16,
    opacity: 0.7,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
