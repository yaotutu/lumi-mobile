import React, { useMemo, useState } from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { getImageUrl } from '@/utils/url';
import type { ModelDetailProps } from './types';
import { logger } from '@/utils/logger';

// 创建动画图片组件
const AnimatedImage = Animated.createAnimatedComponent(Image);

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
  ({
    model,
    onBack,
    onShare,
    onBookmark,
    onDownload,
    onAddToQueue,
    on3DPreview,
    showFloatingHeader = true,
  }: ModelDetailProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { topInset, headerPaddingTop } = useSafeAreaSpacing();

    // 防止重复点击返回按钮
    const [isHandlingBack, setIsHandlingBack] = useState(false);

    // Stretchy Header: 监听滚动位置
    const [scrollY] = useState(new Animated.Value(0));

    // 图片高度：正常 400px，下拉时增加高度
    const HEADER_HEIGHT = 400;
    const HEADER_MAX_HEIGHT = 400 + topInset;

    const imageHeight = scrollY.interpolate({
      inputRange: [-HEADER_MAX_HEIGHT, 0, HEADER_MAX_HEIGHT],
      outputRange: [HEADER_MAX_HEIGHT * 2, HEADER_MAX_HEIGHT, HEADER_MAX_HEIGHT],
      extrapolate: 'clamp',
    });

    // 图片缩放原点：从顶部开始拉伸
    const imageTranslateY = scrollY.interpolate({
      inputRange: [-HEADER_MAX_HEIGHT, 0, HEADER_MAX_HEIGHT],
      outputRange: [-HEADER_MAX_HEIGHT / 2, 0, 0],
      extrapolate: 'clamp',
    });

    // 处理返回
    const handleBack = () => {
      // 防止重复点击
      if (isHandlingBack) {
        logger.debug('正在处理返回操作，忽略此次点击');
        return;
      }

      logger.info('返回');
      setIsHandlingBack(true);

      // 调用父组件的返回回调
      onBack?.();

      // 延迟重置状态，给动画留出时间
      setTimeout(() => {
        setIsHandlingBack(false);
      }, 500);
    };

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
        primaryButton: {
          backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
        },
        secondaryButton: {
          backgroundColor: isDark ? 'rgba(74, 144, 226, 0.2)' : 'rgba(0, 122, 255, 0.1)',
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
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* 主图 - 绝对定位在最上层，可自由拉伸 */}
        <AnimatedImage
          source={{ uri: absoluteImageUrl }}
          style={[
            styles.headerImage,
            {
              height: imageHeight,
              transform: [{ translateY: imageTranslateY }],
            },
          ]}
          resizeMode="cover"
        />

        {/* ScrollView - 透明覆盖在图片上 */}
        <Animated.ScrollView
          style={styles.scrollView}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
        >
          {/* 占位 View - 高度等于图片区域，保持布局 */}
          <View style={[styles.headerPlaceholder, { height: HEADER_HEIGHT }]} />

          {/* 内容区域 - 使用 ThemedView 自动适配背景色 */}
          <ThemedView style={styles.content}>
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

              <TouchableOpacity style={[styles.followButton, dynamicStyles.primaryButton]}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>

            {/* 统计数据 */}
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <IconSymbol
                  name="heart"
                  size={20}
                  color={isDark ? Colors.dark.icon : Colors.light.icon}
                />
                <ThemedText style={styles.statText}>
                  {formatNumber(model.likeCount)} Likes
                </ThemedText>
              </View>

              <View style={styles.statItem}>
                <IconSymbol
                  name="arrow.down.circle"
                  size={20}
                  color={isDark ? Colors.dark.icon : Colors.light.icon}
                />
                <ThemedText style={styles.statText}>
                  {formatNumber(model.downloadCount)} DLs
                </ThemedText>
              </View>

              <View style={styles.statItem}>
                <IconSymbol
                  name="clock"
                  size={20}
                  color={isDark ? Colors.dark.icon : Colors.light.icon}
                />
                <ThemedText style={styles.statText}>Est. 5h 30m</ThemedText>
              </View>
            </View>

            {/* 描述 */}
            {model.description && (
              <View style={styles.descriptionSection}>
                <ThemedText style={styles.description}>{model.description}</ThemedText>
              </View>
            )}

            {/* 技术规格 */}
            <View style={styles.specsSection}>
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
                style={[styles.secondaryActionButton, dynamicStyles.secondaryButton]}
                onPress={handleDownload}
              >
                <Text
                  style={[
                    styles.secondaryActionText,
                    { color: isDark ? Colors.dark.tint : Colors.light.tint },
                  ]}
                >
                  Download .{model.format || 'STL'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionButton, dynamicStyles.primaryButton]}
                onPress={handleAddToQueue}
              >
                <Text style={styles.primaryActionText}>Add to Queue</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </Animated.ScrollView>

        {/* 固定导航栏 - 浮在最上层（可选） */}
        {showFloatingHeader && (
          <View style={[styles.fixedNavBar, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navButton}
              activeOpacity={0.7}
              disabled={isHandlingBack}
            >
              <IconSymbol name="chevron.left" size={24} color={isHandlingBack ? '#ccc' : '#000'} />
            </TouchableOpacity>

            <View style={styles.navActions}>
              <TouchableOpacity
                onPress={handleBookmark}
                style={styles.navButton}
                activeOpacity={0.7}
              >
                <IconSymbol name="bookmark" size={22} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.navButton} activeOpacity={0.7}>
                <IconSymbol name="square.and.arrow.up" size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3D 预览按钮 - 浮在预览图上方 */}
        <View
          style={[
            styles.previewButtonContainer,
            { top: HEADER_HEIGHT - 70, paddingHorizontal: Spacing.xl },
          ]}
        >
          <TouchableOpacity
            style={styles.previewButton}
            onPress={handle3DPreview}
            activeOpacity={0.8}
          >
            <IconSymbol name="cube" size={20} color="#fff" />
            <Text style={styles.previewButtonText}>预览 3D 模型</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }
);

ModelDetail.displayName = 'ModelDetail';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
    backgroundColor: '#E5E5EA',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  headerPlaceholder: {
    // height 通过内联样式动态设置
    backgroundColor: 'transparent',
  },
  content: {
    padding: Spacing.xl,
    // backgroundColor 由 ThemedView 自动处理
  },
  fixedNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 100, // 确保在图片之上
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  navActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
    borderRadius: BorderRadius.full,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    marginBottom: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statText: {
    ...Typography.caption1,
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: Spacing.xxl,
  },
  description: {
    ...Typography.body,
    lineHeight: 24,
    opacity: 0.85,
  },
  specsSection: {
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
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryActionButton: {
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  previewButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
