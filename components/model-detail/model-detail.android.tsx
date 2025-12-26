import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

export const ModelDetail = React.memo(({
  model,
  onShare,
  onBookmark,
  onDownload,
  onAddToQueue,
  on3DPreview,
}: ModelDetailProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 处理分享
  const handleShare = () => {
    logger.info('分享模型:', model.name);
    onShare?.();
  };

  // 处理书签
  const handleBookmark = () => {
    logger.info('收藏模型:', model.name);
    onBookmark?.();
  };

  // 处理下载
  const handleDownload = () => {
    logger.info('下载模型:', model.name);
    onDownload?.();
  };

  // 处理加入队列
  const handleAddToQueue = () => {
    logger.info('加入队列:', model.name);
    onAddToQueue?.();
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
  const absoluteImageUrl = useMemo(() => getImageUrl(model.previewImageUrl), [model.previewImageUrl]);

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
          <Image
            source={{ uri: absoluteImageUrl }}
            style={styles.mainImage}
            resizeMode="cover"
          />

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
              <View style={[styles.avatar, { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint }]}>
                <Text style={styles.avatarText}>
                  {(model.user?.name || 'A').charAt(0).toUpperCase()}
                </Text>
              </View>
              <ThemedText style={styles.creatorName}>
                {model.user?.name || '匿名用户'}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.followButton, dynamicStyles.primaryButton]}
              activeOpacity={0.85}
            >
              <Text style={styles.followButtonText}>
                Follow
              </Text>
            </TouchableOpacity>
          </View>

          {/* 统计数据卡片 */}
          <View style={[styles.statsCard, dynamicStyles.card]}>
            <View style={styles.statItem}>
              <IconSymbol name="heart" size={20} color={isDark ? Colors.dark.icon : Colors.light.icon} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>{formatNumber(model.likeCount)}</ThemedText>
                <ThemedText style={styles.statLabel}>Likes</ThemedText>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <IconSymbol name="arrow.down.circle" size={20} color={isDark ? Colors.dark.icon : Colors.light.icon} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>{formatNumber(model.downloadCount)}</ThemedText>
                <ThemedText style={styles.statLabel}>DLs</ThemedText>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <IconSymbol name="clock" size={20} color={isDark ? Colors.dark.icon : Colors.light.icon} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>5h 30m</ThemedText>
                <ThemedText style={styles.statLabel}>Est.</ThemedText>
              </View>
            </View>
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
                <ThemedText style={styles.specValue}>{formatNumber(model.vertexCount)}</ThemedText>
              </View>
            )}
          </View>

          {/* 操作按钮 */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.secondaryActionButton, dynamicStyles.secondaryButton]}
              onPress={handleDownload}
              activeOpacity={0.7}
            >
              <IconSymbol name="arrow.down.circle" size={20} color={isDark ? Colors.dark.tint : Colors.light.tint} />
              <Text style={[styles.secondaryActionText, { color: isDark ? Colors.dark.tint : Colors.light.tint }]}>
                Download .{model.format || 'STL'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, dynamicStyles.primaryButton]}
              onPress={handleAddToQueue}
              activeOpacity={0.8}
            >
              <IconSymbol name="plus.circle" size={20} color="#fff" />
              <Text style={styles.primaryActionText}>Add to Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
});

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
    justifyContent: 'space-between',
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
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  statInfo: {
    alignItems: 'flex-start',
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
