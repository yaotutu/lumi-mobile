/**
 * MenuItem iOS 平台实现
 *
 * iOS 风格的菜单项组件：
 * - 使用毛玻璃效果（可选）
 * - 细腻的阴影和圆角
 * - SF Symbols 图标
 * - 流畅的按压反馈动画
 */

import { StyleSheet, Pressable, Animated } from 'react-native';
import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { MenuItemProps } from './types';

export function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  containerStyle,
  showArrow = true,
  disabled = false,
}: MenuItemProps) {
  // 获取主题颜色
  const tint = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'secondaryText');
  const cardBackground = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');

  // 压按动画值
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 处理按下事件
  const handlePressIn = () => {
    if (disabled) return;

    // 缩放动画
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // 处理抬起事件
  const handlePressOut = () => {
    if (disabled) return;

    // 恢复动画
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.container,
          {
            backgroundColor: cardBackground,
            borderColor: border,
          },
          disabled && styles.disabled,
          containerStyle,
        ]}
      >
        {/* 左侧图标 */}
        <ThemedView style={styles.iconContainer}>
          <IconSymbol name={icon} size={24} color={tint} />
        </ThemedView>

        {/* 中间文本区域 */}
        <ThemedView style={styles.textContainer}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText
              style={styles.subtitle}
              numberOfLines={1}
              lightColor={secondaryText}
              darkColor={secondaryText}
            >
              {subtitle}
            </ThemedText>
          )}
        </ThemedView>

        {/* 右侧箭头（可选） */}
        {showArrow && (
          <ThemedView style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={secondaryText} style={styles.arrow} />
          </ThemedView>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    // iOS 风格的平滑边缘
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  arrowContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    // iOS 风格的箭头样式
  },
});
