import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ModelDetail } from './components/model-detail';
import { useGalleryStore } from '@/stores';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { logger } from '@/utils/logger';

export default function ModelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { headerPaddingTop } = useSafeAreaSpacing();

  // 从全局 store 获取模型数据
  const { getModelById } = useGalleryStore();
  const model = getModelById(id as string);

  // 自定义导航栏
  const renderHeader = () => (
    <View style={[headerStyles.container, { paddingTop: headerPaddingTop }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={headerStyles.button}
        activeOpacity={0.7}
      >
        <IconSymbol name="chevron.left" size={24} color="#000" />
      </TouchableOpacity>

      <View style={headerStyles.actions}>
        <TouchableOpacity
          onPress={() => logger.info('收藏功能待实现')}
          style={headerStyles.button}
          activeOpacity={0.7}
        >
          <IconSymbol name="bookmark" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => logger.info('分享功能待实现')}
          style={headerStyles.button}
          activeOpacity={0.7}
        >
          <IconSymbol name="square.and.arrow.up" size={22} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 如果模型不存在，显示错误页面
  if (!model) {
    logger.warn('模型未找到:', id);
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <ThemedText style={styles.errorTitle}>模型未找到</ThemedText>
          <ThemedText style={styles.errorMessage}>
            无法找到该模型，可能已被删除或不存在。
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
      <Stack.Screen options={{ headerShown: false }} />
      <ModelDetail
        model={model}
        onBack={() => router.back()}
        onShare={() => logger.info('分享功能待实现')}
        onBookmark={() => logger.info('收藏功能待实现')}
        onDownload={() => logger.info('下载功能待实现')}
        onAddToQueue={() => logger.info('加入队列功能待实现')}
      />
    </>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingTop 通过 useSafeAreaSpacing 动态设置
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

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
