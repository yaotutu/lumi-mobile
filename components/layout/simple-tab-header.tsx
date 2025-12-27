import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface SimpleTabHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * 轻量级 Tab 顶部标题区域（单行或双行）
 */
export function SimpleTabHeader({ title, subtitle }: SimpleTabHeaderProps) {
  const { topInset } = useSafeAreaSpacing();
  const isDark = useColorScheme() === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { paddingTop: topInset + Spacing.sm }]}>
      <Text style={[styles.title, { color: palette.text }]}>
        {subtitle ? `${title} · ${subtitle}` : title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
