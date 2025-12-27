/**
 * MenuGroup iOS 平台实现
 *
 * iOS 风格的菜单分组组件：
 * - 圆角卡片容器
 * - 细腻的阴影效果
 * - 分组内菜单项之间无间距
 * - 支持可选的分组标题
 */

import { StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { MenuGroupProps } from './types';

export function MenuGroup({ children, containerStyle, title }: MenuGroupProps) {
  // 获取主题颜色
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');

  return (
    <ThemedView style={styles.wrapper}>
      {/* 可选的分组标题 */}
      {title && <ThemedText style={[styles.groupTitle, { color: text }]}>{title}</ThemedText>}

      {/* 菜单分组容器 */}
      <ThemedView
        style={[
          styles.container,
          {
            backgroundColor: background,
            borderColor: border,
          },
          containerStyle,
        ]}
      >
        {children}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  container: {
    borderRadius: 12,
    // iOS 风格的圆角
    overflow: 'hidden',
    // 确保子元素不会超出圆角
    borderWidth: 0.5,
  },
});
