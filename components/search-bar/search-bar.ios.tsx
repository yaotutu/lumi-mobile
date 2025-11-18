import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
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
      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blurContainer,
          {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(255, 255, 255, 0.18)',
          }
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
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? Colors.dark.tertiaryText : Colors.light.tertiaryText}
          value={value}
          onChangeText={onChangeText}
          clearButtonMode="while-editing" // iOS专属：清除按钮
          enablesReturnKeyAutomatically={true} // iOS专属：自动启用返回键
          returnKeyType="search" // iOS专属：搜索键样式
          spellCheck={false} // iOS专属：关闭拼写检查
        />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 22,
    // iOS字体样式
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'system',
  },
});