/**
 * 统一的 ModelCard 主组件
 * 使用 BlurView 提供一致的毛玻璃内容区效果
 */

import React, { useMemo } from 'react';
import { Image, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getImageUrl } from '@/utils/url';
import { CardContent } from './card-content';
import { CardActions } from './card-actions';
import type { ModelCardProps } from './types';

/**
 * 预计算卡片样式
 * 根据主题生成动态样式对象
 */
const createCardStyles = (isDark: boolean) => ({
  // 卡片阴影
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 3, // Android elevation
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: isDark ? Colors.dark.border : Colors.light.border,
  },
  // BlurView 配置
  blurView: {
    intensity: isDark ? 40 : 60, // 毛玻璃强度
    tint: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    // BlurView 内容区边框
    blurContent: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)',
      borderTopWidth: StyleSheet.hairlineWidth,
    },
  },
});

/**
 * ModelCard 组件
 *
 * @param modelId - 模型ID
 * @param title - 模型标题
 * @param creator - 创作者（可选）
 * @param imageUrl - 图片URL
 * @param likes - 点赞数
 * @param onPress - 点击回调（可选，默认跳转到详情页）
 */
export const ModelCard = React.memo(
  ({ modelId, title, creator, imageUrl, likes, onPress }: ModelCardProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    // 预计算样式对象，避免每次渲染时重新创建
    const cardStyles = useMemo(() => createCardStyles(isDark), [isDark]);

    // 处理卡片点击
    const handlePress = () => {
      if (onPress) {
        onPress(modelId);
      } else {
        // 默认跳转到模型详情页
        router.push(`/model/${modelId}`);
      }
    };

    // 转换图片URL为绝对路径
    const absoluteImageUrl = useMemo(() => getImageUrl(imageUrl), [imageUrl]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: isDark
              ? Colors.dark.cardBackground
              : Colors.light.cardBackground,
            opacity: pressed ? 0.9 : 1, // 按压时降低不透明度
          },
          cardStyles.card,
        ]}
      >
        {/* 模型预览图 */}
        <Image
          source={{ uri: absoluteImageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* BlurView 毛玻璃内容区 */}
        <BlurView
          intensity={cardStyles.blurView.intensity}
          tint={cardStyles.blurView.tint}
          style={[styles.blurContent, cardStyles.blurView.blurContent]}
        >
          {/* 卡片内容（标题、创作者） */}
          <CardContent title={title} creator={creator} likes={likes} />

          {/* 卡片操作（点赞、收藏） */}
          <CardActions likes={likes} />
        </BlurView>
      </Pressable>
    );
  }
);

ModelCard.displayName = 'ModelCard';

const styles = StyleSheet.create({
  // 卡片容器
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden', // 确保圆角和BlurView正确裁剪
    marginBottom: Spacing.xl,
    backgroundColor: 'transparent',
  },
  // 预览图
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5EA', // 图片加载时的占位背景色
  },
  // BlurView 内容区
  blurContent: {
    padding: Spacing.sm + Spacing.xs,
    overflow: 'hidden', // 确保毛玻璃效果正确裁剪
  },
});
