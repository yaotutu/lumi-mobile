import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useModelInteraction } from '@/hooks/use-model-interaction';
import { useAuthStore } from '@/stores';
import { getImageUrl } from '@/utils/url';
import type { ModelDetailProps } from './types';
import { logger } from '@/utils/logger';

// 格式化数字（例如：8192 → 8.2k）
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// 格式化文件大小（字节转为 MB）
const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes) return 'N/A';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

export const ModelDetail = React.memo(
  ({ model, onPrint, on3DPreview }: ModelDetailProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    // 获取用户认证状态
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // 使用交互 Hook 管理点赞和收藏状态
    const {
      isLiked,
      isFavorited,
      currentLikes,
      currentFavorites,
      isLoading,
      handleLike,
      handleFavorite,
    } = useModelInteraction({
      modelId: model.id,
      initialLikes: model.likeCount,
      initialFavorites: model.favoriteCount,
      isAuthenticated,
      onRequireLogin: () => {
        // 跳转到登录页
        router.push('/login');
      },
    });

    // 处理点赞按钮点击
    const handleLikePress = () => {
      // 触发触觉反馈
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleLike();
    };

    // 处理收藏按钮点击
    const handleFavoritePress = () => {
      // 触发触觉反馈
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleFavorite();
    };

    // 处理一键打印
    const handlePrint = () => {
      logger.info('一键打印模型:', model.name);
      onPrint?.();
    };

    // 处理 3D 预览
    const handle3DPreview = () => {
      logger.info('预览 3D 模型:', model.name);
      on3DPreview?.();
    };

    // 预计算样式
    const dynamicStyles = useMemo(
      () => ({
        card: {
          backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
          elevation: 4,
        },
        primaryButton: {
          backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
          elevation: 4,
        },
        secondaryButton: {
          backgroundColor: isDark ? 'rgba(74, 144, 226, 0.15)' : 'rgba(0, 122, 255, 0.08)',
          borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
        },
      }),
      [isDark]
    );

    // 转换图片URL为绝对路径
    const absoluteImageUrl = useMemo(
      () => getImageUrl(model.previewImageUrl),
      [model.previewImageUrl]
    );

    return (
      <ThemedView style={styles.container}>
        {/* 状态栏 */}
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 主图 */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: absoluteImageUrl }} style={styles.mainImage} resizeMode="cover" />

            {/* 3D 预览按钮 */}
            <View style={styles.previewButtonContainer}>
              <TouchableOpacity
                style={[styles.previewButton, dynamicStyles.primaryButton]}
                onPress={handle3DPreview}
                activeOpacity={0.85}
              >
                <IconSymbol name="cube" size={20} color="#fff" />
                <Text style={styles.previewButtonText}>预览 3D 模型</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 内容区域 */}
          <View style={styles.content}>
            {/* 标题 */}
            <ThemedText style={styles.title}>{model.name}</ThemedText>

            {/* 创作者信息 */}
            <View style={styles.creatorSection}>
              <View style={styles.creatorInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {(model.user?.name || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <ThemedText style={styles.creatorName}>{model.user?.name || '匿名用户'}</ThemedText>
              </View>

              {/* Follow 按钮暂时隐藏，功能待开发 */}
              {/* <TouchableOpacity
                style={[styles.followButton, dynamicStyles.primaryButton]}
                activeOpacity={0.85}
              >
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity> */}
            </View>

            {/* 统计数据卡片 */}
            <View style={[styles.statsCard, dynamicStyles.card]}>
              {/* 喜欢数量 - 可点击 */}
              <TouchableOpacity
                style={styles.statItem}
                onPress={handleLikePress}
                disabled={isLoading}
                activeOpacity={0.6}
              >
                <View style={styles.statInfo}>
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={
                      isLiked
                        ? isDark
                          ? '#FF453A'
                          : '#FF3B30'
                        : isDark
                          ? Colors.dark.icon
                          : Colors.light.icon
                    }
                  />
                  <ThemedText
                    style={[
                      styles.statValue,
                      isLiked && {
                        color: isDark ? '#FF453A' : '#FF3B30',
                      },
                    ]}
                  >
                    {formatNumber(currentLikes)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.statLabel}>喜欢</ThemedText>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              {/* 收藏数量 - 可点击 */}
              <TouchableOpacity
                style={styles.statItem}
                onPress={handleFavoritePress}
                disabled={isLoading}
                activeOpacity={0.6}
              >
                <View style={styles.statInfo}>
                  <Ionicons
                    name={isFavorited ? 'star' : 'star-outline'}
                    size={22}
                    color={
                      isFavorited
                        ? isDark
                          ? '#FFD60A'
                          : '#FFCC00'
                        : isDark
                          ? Colors.dark.icon
                          : Colors.light.icon
                    }
                  />
                  <ThemedText
                    style={[
                      styles.statValue,
                      isFavorited && {
                        color: isDark ? '#FFD60A' : '#FFCC00',
                      },
                    ]}
                  >
                    {formatNumber(currentFavorites)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.statLabel}>收藏</ThemedText>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              {/* 浏览数量 - 仅展示 */}
              <View style={styles.statItem}>
                <View style={styles.statInfo}>
                  <Ionicons
                    name="eye-outline"
                    size={22}
                    color={isDark ? Colors.dark.icon : Colors.light.icon}
                  />
                  <ThemedText style={styles.statValue}>
                    {formatNumber(model.viewCount)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.statLabel}>浏览</ThemedText>
              </View>

              {/* 加载指示器 */}
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator
                    size="small"
                    color={isDark ? Colors.dark.tint : Colors.light.tint}
                  />
                </View>
              )}
            </View>

            {/* 描述 */}
            {model.description && (
              <View style={styles.descriptionSection}>
                <ThemedText style={styles.description}>{model.description}</ThemedText>
              </View>
            )}

            {/* 技术规格卡片 */}
            <View style={[styles.specsCard, dynamicStyles.card]}>
              <ThemedText style={styles.sectionTitle}>技术规格</ThemedText>

              <View style={styles.specRow}>
                <ThemedText style={styles.specLabel}>格式</ThemedText>
                <ThemedText style={styles.specValue}>{model.format || 'STL'}</ThemedText>
              </View>

              <View style={styles.specRow}>
                <ThemedText style={styles.specLabel}>文件大小</ThemedText>
                <ThemedText style={styles.specValue}>{formatFileSize(model.fileSize)}</ThemedText>
              </View>

              {model.faceCount && (
                <View style={styles.specRow}>
                  <ThemedText style={styles.specLabel}>面数</ThemedText>
                  <ThemedText style={styles.specValue}>{formatNumber(model.faceCount)}</ThemedText>
                </View>
              )}

              {model.vertexCount && (
                <View style={styles.specRow}>
                  <ThemedText style={styles.specLabel}>顶点数</ThemedText>
                  <ThemedText style={styles.specValue}>
                    {formatNumber(model.vertexCount)}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* 操作按钮 */}
            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={[styles.primaryActionButton, dynamicStyles.primaryButton]}
                onPress={handlePrint}
                activeOpacity={0.8}
              >
                <IconSymbol name="printer.fill" size={20} color="#fff" />
                <Text style={styles.primaryActionText}>一键打印</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }
);

ModelDetail.displayName = 'ModelDetail';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 400,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5EA',
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    ...Typography.title1,
    fontSize: 36,
    marginBottom: Spacing.xl,
    lineHeight: 42,
  },
  creatorSection: {
    flexDirection: 'row',
    // 注释：Follow 按钮隐藏后，只需左对齐即可
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  creatorName: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  followButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xxl,
    position: 'relative', // 为加载指示器提供定位上下文
  },
  statItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption2,
    fontSize: 11,
    opacity: 0.65,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: BorderRadius.lg,
  },
  descriptionSection: {
    marginBottom: Spacing.xxl,
  },
  description: {
    ...Typography.body,
    lineHeight: 24,
    opacity: 0.85,
  },
  specsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.headline,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.15)',
  },
  specLabel: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.7,
  },
  specValue: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
  },
  actionsSection: {
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  previewButtonContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
