/**
 * 统一的 CardActions 子组件
 * 显示卡片操作（点赞、收藏）并支持交互
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { formatLikes } from '@/constants/mock-data';
import { Colors, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CardActionsProps } from './types';

/**
 * CardActions 组件
 *
 * @param likes - 点赞数
 * @param favorites - 收藏数
 * @param isLiked - 是否已点赞
 * @param isFavorited - 是否已收藏
 * @param isLoading - 是否正在操作中
 * @param onLike - 点赞回调
 * @param onFavorite - 收藏回调
 */
export function CardActions({
  likes,
  favorites,
  isLiked = false,
  isFavorited = false,
  isLoading = false,
  onLike,
  onFavorite,
}: CardActionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  /**
   * 处理点赞按钮点击
   * 添加触觉反馈提升用户体验
   */
  const handleLikePress = () => {
    if (onLike) {
      // 触发触觉反馈
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLike();
    }
  };

  /**
   * 处理收藏按钮点击
   * 添加触觉反馈提升用户体验
   */
  const handleFavoritePress = () => {
    if (onFavorite) {
      // 触发触觉反馈
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onFavorite();
    }
  };

  return (
    <View style={styles.container}>
      {/* 点赞按钮 */}
      <TouchableOpacity
        style={styles.actionButton}
        activeOpacity={0.6} // 按压时的不透明度
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // 扩大点击区域
        onPress={handleLikePress}
        disabled={isLoading} // 操作中禁用按钮
      >
        {/* 点赞图标：已点赞显示填充图标，未点赞显示轮廓图标 */}
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={20}
          color={isLiked ? (isDark ? '#FF453A' : '#FF3B30') : isDark ? '#FFFFFF99' : '#00000099'} // iOS 红色
        />
        {/* 点赞数文本 */}
        <Text
          style={[
            styles.actionText,
            {
              color: isLiked
                ? isDark
                  ? '#FF453A'
                  : '#FF3B30'
                : isDark
                  ? Colors.dark.secondaryText
                  : Colors.light.secondaryText,
            },
          ]}
        >
          {formatLikes(likes)}
        </Text>
      </TouchableOpacity>

      {/* 收藏按钮 */}
      <TouchableOpacity
        style={styles.actionButton}
        activeOpacity={0.6} // 按压时的不透明度
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // 扩大点击区域
        onPress={handleFavoritePress}
        disabled={isLoading} // 操作中禁用按钮
      >
        {/* 收藏图标：已收藏显示填充图标，未收藏显示轮廓图标 */}
        <Ionicons
          name={isFavorited ? 'star' : 'star-outline'}
          size={18}
          color={
            isFavorited ? (isDark ? '#FFD60A' : '#FFCC00') : isDark ? '#FFFFFF99' : '#00000099'
          } // iOS 黄色
        />
        {/* 收藏数文本 */}
        <Text
          style={[
            styles.actionText,
            {
              color: isFavorited
                ? isDark
                  ? '#FFD60A'
                  : '#FFCC00'
                : isDark
                  ? Colors.dark.secondaryText
                  : Colors.light.secondaryText,
            },
          ]}
        >
          {formatLikes(favorites)}
        </Text>
      </TouchableOpacity>

      {/* 加载指示器（操作中显示） */}
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={isDark ? Colors.dark.tint : Colors.light.tint}
          style={styles.loader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // 操作容器
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  // 操作按钮（点赞/收藏）
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  // 操作按钮文本（点赞数/收藏数）
  actionText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
  // 加载指示器
  loader: {
    marginLeft: Spacing.xs,
  },
});
