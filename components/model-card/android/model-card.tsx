import React, { useMemo } from 'react';
import { Image, StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getImageUrl } from '@/utils/url';
import { CardContent } from './card-content';
import { CardActions } from './card-actions';
import type { ModelCardProps } from '../types';

// 预计算样式对象的函数
const createCardStyles = (isDark: boolean) => ({
  card: {
    // Material Design Elevation
    elevation: 2,
    // Material阴影色
    shadowColor: isDark ? '#000' : '#1976D2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
  },
  content: {
    backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  },
});

export const ModelCard = React.memo(
  ({ modelId, title, creator, imageUrl, likes, onPress }: ModelCardProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    // 预计算样式对象，避免每次渲染时重新创建
    const cardStyles = useMemo(() => createCardStyles(isDark), [isDark]);

    // 处理点击
    const handlePress = () => {
      if (onPress) {
        onPress(modelId);
      } else {
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
            backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
            opacity: pressed ? 0.85 : 1,
          },
          cardStyles.card,
        ]}
        android_ripple={{
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* 图片 */}
        <Image source={{ uri: absoluteImageUrl }} style={styles.image} resizeMode="cover" />

        {/* Android Material Design内容区 */}
        <View style={[styles.content, cardStyles.content]}>
          <CardContent title={title} creator={creator} likes={likes} />
          <CardActions likes={likes} />
        </View>
      </Pressable>
    );
  }
);

ModelCard.displayName = 'ModelCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.sm,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5EA',
  },
  content: {
    padding: Spacing.md,
  },
});
