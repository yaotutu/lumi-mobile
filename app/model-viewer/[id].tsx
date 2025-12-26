/**
 * 3D 模型全屏预览页面（动态路由）
 * 从模型详情页进入，显示完整的 3D 模型预览
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Text, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Viewer3D } from '@/components/3d-viewer';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchModelDetail } from '@/services';
import { getModelUrl } from '@/utils/url';
import { logger } from '@/utils/logger';
import type { GalleryModel } from '@/types';

export default function ModelViewer3DScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  // 确保 colorScheme 不为 null，提供默认值 'light'
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();

  // 状态管理
  const [model, setModel] = useState<GalleryModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从 API 获取模型详情
  useEffect(() => {
    if (!id) return;

    const loadModelDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        logger.info(`获取模型详情用于 3D 预览: ${id}`, 'ModelViewer3DScreen');

        const data = await fetchModelDetail(id);
        setModel(data);

        logger.debug('模型详情数据:', {
          id: data.id,
          name: data.name,
          modelUrl: data.modelUrl,
          mtlUrl: data.mtlUrl,
          textureUrl: data.textureUrl,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '模型数据未找到';
        logger.error('获取模型详情失败:', err);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadModelDetail();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleLoad = () => {
    logger.info('3D model loaded successfully', 'ModelViewer3DScreen');
  };

  const handleError = (error: any) => {
    logger.error(`Failed to load 3D model: ${error.message}`, 'ModelViewer3DScreen');
    setError('模型加载失败');
  };

  // 转换模型URL为绝对路径
  const absoluteModelUrl = useMemo(() => {
    const url = getModelUrl(model?.modelUrl);
    logger.debug('模型 URL 转换:', {
      original: model?.modelUrl,
      absolute: url,
    });
    return url;
  }, [model?.modelUrl]);

  // 转换 MTL URL 为绝对路径
  const absoluteMtlUrl = useMemo(() => {
    if (!model?.mtlUrl) return undefined;
    const url = getModelUrl(model.mtlUrl);
    logger.debug('MTL URL 转换:', {
      original: model.mtlUrl,
      absolute: url,
    });
    return url;
  }, [model?.mtlUrl]);

  // 转换纹理 URL 为绝对路径
  const absoluteTextureUrl = useMemo(() => {
    if (!model?.textureUrl) return undefined;
    const url = getModelUrl(model.textureUrl);
    logger.debug('纹理 URL 转换:', {
      original: model.textureUrl,
      absolute: url,
    });
    return url;
  }, [model?.textureUrl]);

  // 加载中状态
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>加载中...</Text>
        </View>
      </View>
    );
  }

  // 错误状态
  if (error || !model) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.background }]}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error || '模型未找到'}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={handleBack}
          >
            <Text style={styles.retryButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* 顶部导航栏 - 仅 iOS 显示 */}
      {Platform.OS === 'ios' && (
        <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.background }]}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {model.name}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      )}

      {/* 3D 查看器 */}
      <Viewer3D
        modelUrl={absoluteModelUrl}
        mtlUrl={absoluteMtlUrl}
        textureUrl={absoluteTextureUrl}
        showProgress
        showPlaceholder
        onLoad={handleLoad}
        onError={handleError}
        style={styles.viewer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  viewer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
