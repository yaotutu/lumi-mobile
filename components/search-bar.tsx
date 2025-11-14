import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  showMenuButton?: boolean;
  showNotificationButton?: boolean;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}

export function SearchBar({
  placeholder = 'Search for models...',
  value,
  onChangeText,
  showMenuButton = true,
  showNotificationButton = true,
  onMenuPress,
  onNotificationPress,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? Colors.dark.inputBackground : Colors.light.inputBackground,
      }
    ]}>
      {/* 左侧菜单按钮 */}
      {showMenuButton && (
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onMenuPress}
        >
          <Ionicons
            name="menu"
            size={24}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
        </TouchableOpacity>
      )}

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

      {/* 右侧通知按钮 */}
      {showNotificationButton && (
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onNotificationPress}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2, // 10px
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
});
