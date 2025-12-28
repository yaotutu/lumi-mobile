import { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSize, FontWeight } from '@/constants/theme';
import type { GenerationTask } from '@/stores/create/types';
import { logger } from '@/utils/logger';

const LIGHT_PALETTE = {
  background: '#F5F7FB',
  card: '#FFFFFF',
  border: '#E1E7F4',
  text: '#0F172A',
  secondary: '#6E7894',
  accent: '#2680FF',
  accentAlt: '#1C65F2',
  badge: '#E8EDF7',
};

const DARK_PALETTE = {
  background: '#080C16',
  card: '#121A2B',
  border: '#283450',
  text: '#F6F7FF',
  secondary: '#9BA7C2',
  accent: '#4E8BFF',
  accentAlt: '#3D6AE6',
  badge: '#1F2A43',
};

interface ModelCompleteProps {
  task: GenerationTask;
  onView3D: () => void;
  onCreateNew: () => void;
  paddingBottom: number;
  isDark: boolean;
}

export function ModelComplete({
  task,
  onView3D,
  onCreateNew,
  paddingBottom,
  isDark,
}: ModelCompleteProps) {
  const palette = useMemo(() => (isDark ? DARK_PALETTE : LIGHT_PALETTE), [isDark]);
  const backgroundColor = palette.background;
  const textColor = palette.text;
  const secondaryTextColor = palette.secondary;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, scaleAnim]);

  const selectedImage =
    task.images?.find(img => img.id === task.selectedImageId) ?? task.images?.[0];
  const heroSource = selectedImage ? { uri: selectedImage.url || selectedImage.thumbnail } : null;
  const modelFormat = (task.modelUrl?.split('.').pop() || 'OBJ').toUpperCase();

  const stats = [
    { label: '模型格式', value: modelFormat },
    { label: '文件大小', value: '12.4 MB' },
    { label: '顶点数', value: '145k' },
  ];

  const handleDownload = () => {
    logger.info('download model tapped', task.id);
  };

  const handlePrint = () => {
    logger.info('print model tapped', task.id);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={onCreateNew}
          activeOpacity={0.7}
          style={[styles.headerButton, { borderColor: palette.border }]}
        >
          <IconSymbol name="chevron.left" size={18} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
          {task.prompt || 'AI Creation'}
        </Text>
        <TouchableOpacity
          style={[styles.headerButton, { borderColor: palette.border }]}
          activeOpacity={0.7}
          onPress={() => logger.info('model menu tapped', task.id)}
        >
          <IconSymbol name="ellipsis" size={18} color={secondaryTextColor} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, { paddingBottom: paddingBottom + 180 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroCard,
            { backgroundColor: palette.card, borderColor: palette.border },
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {heroSource ? (
            <Image source={heroSource} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: palette.badge }]}>
              <IconSymbol name="cube" size={48} color={secondaryTextColor} />
              <Text style={[styles.heroPlaceholderText, { color: secondaryTextColor }]}>
                等待预览
              </Text>
            </View>
          )}
          <View style={[styles.heroBadge, { backgroundColor: palette.badge }]}>
            <Text style={[styles.heroBadgeText, { color: secondaryTextColor }]}>FRONT VIEW</Text>
          </View>
        </Animated.View>

        <TouchableOpacity onPress={onView3D} activeOpacity={0.85}>
          <LinearGradient
            colors={[palette.accent, palette.accentAlt]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.previewButton}
          >
            <IconSymbol name="cube.fill" size={24} color="#FFFFFF" />
            <Text style={styles.previewButtonText}>Preview 3D Model</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          {stats.map(stat => (
            <View
              key={stat.label}
              style={[
                styles.statCard,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.statLabel, { color: secondaryTextColor }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor,
            borderTopColor: palette.border,
            paddingBottom: paddingBottom + Spacing.md,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.ghostButton, { borderColor: palette.border }]}
          onPress={handleDownload}
          activeOpacity={0.8}
        >
          <IconSymbol name="arrow.down.circle" size={20} color={textColor} />
          <Text style={[styles.ghostButtonText, { color: textColor }]}>下载</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filledButton, { backgroundColor: palette.accent }]}
          onPress={handlePrint}
          activeOpacity={0.85}
        >
          <IconSymbol name="printer.fill" size={20} color="#FFFFFF" />
          <Text style={styles.filledButtonText}>一件打印</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: FontWeight.bold,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  heroCard: {
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroImage: {
    width: '100%',
    height: 360,
  },
  heroPlaceholder: {
    width: '100%',
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroPlaceholderText: {
    fontSize: FontSize.sm,
  },
  heroBadge: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  heroBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
  },
  previewButton: {
    borderRadius: 30,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#2680FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 18,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    opacity: 0.8,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  ghostButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ghostButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  filledButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  filledButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
