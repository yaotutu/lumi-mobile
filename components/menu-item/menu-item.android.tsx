/**
 * MenuItem Android 平台实现
 *
 * Material Design 3 风格的菜单项组件：
 * - 涟漪效果（Ripple）
 * - Material Design 图标
 * - Elevation 阴影系统
 * - 符合 Material Design 3 规范的触摸反馈
 */

import { StyleSheet, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const text = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'secondaryText');
  const cardBackground = useThemeColor({}, 'background');
  const rippleColor = useThemeColor({}, 'ripple');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? `${rippleColor}15` // 添加透明度
            : cardBackground,
        },
        disabled && styles.disabled,
        containerStyle,
      ]}
      android_ripple={{
        color: rippleColor,
        foreground: true,
        borderless: false,
      }}
    >
      {/* 左侧图标 */}
      <View style={styles.iconContainer}>
        <IconSymbol name={icon as any} size={24} color={tint} />
      </View>

      {/* 中间文本区域 */}
      <View style={styles.textContainer}>
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
      </View>

      {/* 右侧箭头（可选） */}
      {showArrow && (
        <View style={styles.arrowContainer}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={secondaryText} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Android 不需要边框，使用 Elevation
  },
  disabled: {
    opacity: 0.6,
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
    // Material Design 3 字体样式
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
});
