import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import type { SearchBarProps } from './types';

export function SearchBar({
  placeholder = 'Search for models...',
  value,
  onChangeText,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.wrapper}>
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? Colors.dark.inputBackground : Colors.light.inputBackground,
          // Material Design Elevation
          elevation: 2,
          shadowColor: isDark ? '#000' : '#1976D2',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 3,
          // Material边框
          borderWidth: 1,
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(0, 0, 0, 0.08)',
        }
      ]}>
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
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? Colors.dark.tertiaryText : Colors.light.tertiaryText}
          value={value}
          onChangeText={onChangeText}
          // Android专属属性
          underlineColorAndroid="transparent" // 移除Android下划线
          cursorColor={isDark ? Colors.dark.tint : Colors.light.tint} // 光标颜色
          selectionColor={isDark ? Colors.dark.tint : Colors.light.tint} // 选择颜色
          textContentType="none" // Android文本类型
          autoComplete="off" // Android自动完成
          importantForAutofill="no" // Android自动填充
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2, // Material: 稍大的垂直内边距
    borderRadius: BorderRadius.md + 4, // Material: 稍大的圆角
  },
  searchIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 22,
    // Material字体样式
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'system',
    // Material输入框样式
    paddingVertical: 0, // 移除默认内边距
    paddingHorizontal: 0,
  },
});