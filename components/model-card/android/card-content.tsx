import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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
        <Text style={[styles.creator, { color: isDark ? '#4285F4' : '#1976D2' }]} numberOfLines={1}>
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
    fontSize: 16,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    lineHeight: 22,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'system',
  },
  creator: {
    fontSize: 14,
    fontWeight: FontWeight.regular,
    marginBottom: Spacing.lg,
    lineHeight: 20,
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'system',
  },
});
