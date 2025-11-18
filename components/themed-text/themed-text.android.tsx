import { Platform, StyleSheet, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import type { ThemedTextProps } from './types';

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        // Material字体样式
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? {
          ...styles.link,
          color: isDark ? Colors.dark.tint : Colors.light.tint, // Material链接色
        } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    // Material字体
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'system',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500', // Material使用500而非600
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'system',
  },
  title: {
    fontSize: 32,
    fontWeight: '500', // Material标题用500
    lineHeight: 40, // Material更大的行高
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'system',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500', // Material副标题用500
    lineHeight: 28, // Material更大的行高
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'system',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    // Material链接用regular
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'system',
  },
});