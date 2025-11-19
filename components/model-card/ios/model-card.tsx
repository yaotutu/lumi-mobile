import React, { useMemo } from 'react';
import { Platform, Image, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CardContent } from './card-content';
import { CardActions } from './card-actions';
import type { ModelCardProps } from '../types';

// 预计算样式对象的函数
const createCardStyles = (isDark: boolean) => ({
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: isDark ? Colors.dark.border : Colors.light.border,
  },
  blurView: {
    intensity: isDark ? 40 : 60,
    tint: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    blurContent: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderTopWidth: StyleSheet.hairlineWidth,
    },
  },
});

export const ModelCard = React.memo(({ title, creator, imageUrl, likes }: ModelCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 预计算样式对象，避免每次渲染时重新创建
  const cardStyles = useMemo(() => createCardStyles(isDark), [isDark]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
        },
        cardStyles.card,
      ]}
    >
      {/* 图片 */}
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* iOS 使用毛玻璃内容区 */}
      <BlurView
        intensity={cardStyles.blurView.intensity}
        tint={cardStyles.blurView.tint}
        style={[styles.blurContent, cardStyles.blurView.blurContent]}
      >
        <CardContent title={title} creator={creator} likes={likes} />
        <CardActions likes={likes} />
      </BlurView>
    </View>
  );
});

ModelCard.displayName = 'ModelCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5EA',
  },
  blurContent: {
    padding: Spacing.sm + Spacing.xs,
    overflow: 'hidden',
  },
});
