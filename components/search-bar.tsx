import { StyleSheet, TextInput, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function SearchBar({
  placeholder = 'Search for models...',
  value,
  onChangeText,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const content = (
    <>
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
      />
    </>
  );

  // iOS 使用毛玻璃效果
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.wrapper}>
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          {content}
        </BlurView>
      </View>
    );
  }

  // Android 和 Web 使用普通背景
  return (
    <View style={styles.wrapper}>
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? Colors.dark.inputBackground : Colors.light.inputBackground,
        }
      ]}>
        {content}
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
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    // iOS 毛玻璃边框
    borderWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  searchIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
});
