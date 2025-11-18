import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import type { ThemedViewProps } from './types';

export function ThemedView({
  style,
  lightColor,
  darkColor,
  elevation = 0,
  shadow = false, // Android上shadow参数用于控制是否显示elevation阴影
  ...otherProps
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View
      style={[
        { backgroundColor },
        // Material Elevation效果
        shadow || elevation > 0 ? {
          elevation: elevation || 2,
          shadowColor: isDark ? '#000' : '#1976D2', // Material阴影色
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 3,
        } : undefined,
        style,
      ]}
      {...otherProps}
    />
  );
}