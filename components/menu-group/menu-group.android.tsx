/**
 * MenuGroup Android 平台实现
 *
 * Material Design 3 风格的菜单分组组件：
 * - 圆角卡片容器
 * - Elevation 阴影系统
 * - 符合 Material Design 的间距和布局
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

  return (
    <View style={styles.wrapper}>
      {/* 可选的分组标题 */}
      {title && <ThemedText style={[styles.groupTitle, { color: text }]}>{title}</ThemedText>}

      {/* 菜单分组容器 */}
      <ThemedView
        style={[
          styles.container,
          {
            backgroundColor: background,
          },
          containerStyle,
        ]}
        elevation={2}
      >
        {children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 16,
    // Material Design 3 标题样式
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  container: {
    borderRadius: 12,
    // Material Design 圆角
    overflow: 'hidden',
    // 确保子元素不会超出圆角
  },
});
