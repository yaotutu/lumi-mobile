import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CardContentProps } from '../types';

export function CardContent({ title, creator, likes }: CardContentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* 标题 */}
      <Text
        style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* 创作者(可选) */}
      {creator && (
        <Text style={[styles.creator, { color: isDark ? '#0A84FF' : '#007AFF' }]} numberOfLines={1}>
          by {creator}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  creator: {
    fontSize: 13,
    fontWeight: FontWeight.regular,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
});
