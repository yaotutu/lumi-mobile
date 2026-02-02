/**
 * 统一的搜索栏组件
 * 使用 BlurView 提供一致的毛玻璃效果
 */

import { StyleSheet, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import type { SearchBarProps } from './types';

/**
 * SearchBar 组件
 *
 * @param placeholder - 占位符文本
 * @param value - 输入框值
 * @param onChangeText - 文本变化回调
 */
export function SearchBar({
  placeholder = 'Search for models...',
  value,
  onChangeText,
}: SearchBarProps) {
  // 获取当前颜色主题
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.wrapper}>
      {/* BlurView 容器 - 提供毛玻璃效果 */}
      <BlurView
        intensity={80} // 毛玻璃强度
        tint={isDark ? 'dark' : 'light'} // 根据主题设置色调
        style={[
          styles.blurContainer,
          {
            // 细微的边框增强玻璃效果
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        {/* 搜索图标 */}
        <Ionicons
          name="search"
          size={20}
          color={isDark ? Colors.dark.tertiaryText : Colors.light.tertiaryText}
          style={styles.searchIcon}
        />

        {/* 输入框 */}
        <TextInput
          style={[
            styles.input,
            {
              color: isDark ? Colors.dark.text : Colors.light.text,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? Colors.dark.tertiaryText : Colors.light.tertiaryText}
          value={value}
          onChangeText={onChangeText}
          // 通用属性
          returnKeyType="search" // 搜索键样式
          autoCorrect={false} // 关闭自动更正
          spellCheck={false} // 关闭拼写检查
        />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 外层包裹容器
  wrapper: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  // BlurView 容器
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden', // 确保毛玻璃效果正确裁剪
  },
  // 搜索图标
  searchIcon: {
    marginRight: Spacing.md,
  },
  // 输入框
  input: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 22,
    paddingVertical: 0, // 移除默认内边距以保持垂直居中
    paddingHorizontal: 0,
  },
});
