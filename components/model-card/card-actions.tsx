/**
 * 统一的 CardActions 子组件
 * 显示卡片操作（点赞数、收藏按钮）
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatLikes } from '@/constants/mock-data';
import { Colors, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CardActionsProps } from './types';

/**
 * CardActions 组件
 *
 * @param likes - 点赞数
 * @param onBookmark - 收藏按钮点击回调（可选）
 */
export function CardActions({ likes, onBookmark }: CardActionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* 点赞显示区域 */}
      <View style={styles.likes}>
        {/* 点赞图标 */}
        <Ionicons
          name="heart-outline"
          size={20}
          color={isDark ? '#FF453A' : '#FF3B30'} // iOS 红色
        />
        {/* 点赞数文本 */}
        <Text
          style={[
            styles.likesText,
            {
              color: isDark
                ? Colors.dark.secondaryText
                : Colors.light.secondaryText,
            },
          ]}
        >
          {formatLikes(likes)}
        </Text>
      </View>

      {/* 收藏按钮 */}
      <TouchableOpacity
        style={styles.bookmarkButton}
        activeOpacity={0.5} // 按压时的不透明度
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // 扩大点击区域
        onPress={onBookmark}
      >
        {/* 收藏图标 */}
        <Ionicons
          name="bookmark-outline"
          size={16}
          color={isDark ? '#FFFFFF' : '#000000'}
        />
        {/* 收藏文本 */}
        <Text
          style={[
            styles.bookmarkText,
            {
              color: isDark ? '#FFFFFF' : '#000000',
            },
          ]}
        >
          收藏
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // 操作容器
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // 点赞区域
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  // 点赞数文本
  likesText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
  // 收藏按钮
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  // 收藏按钮文本
  bookmarkText: {
    fontSize: 13,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
});
