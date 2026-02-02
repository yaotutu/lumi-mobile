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

  const handlePrint = () => {
    logger.info('print model tapped', task.id);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerPlaceholder} />
        <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
          {task.prompt || 'AI 生成完成'}
        </Text>
        <View style={styles.headerPlaceholder} />
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, { paddingBottom: paddingBottom + Spacing.lg }]}
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

        {/* 统计信息 - 紧凑横向排列 */}
        <View style={styles.statsCompact}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={styles.statCompactItem}>
              <Text style={[styles.statCompactLabel, { color: secondaryTextColor }]}>
                {stat.label}
              </Text>
              <Text style={[styles.statCompactValue, { color: textColor }]}>{stat.value}</Text>
              {index < stats.length - 1 && (
                <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* 主要操作按钮 - 横向排布 */}
        <View style={styles.primaryActionsRow}>
          <TouchableOpacity
            onPress={onView3D}
            activeOpacity={0.85}
            style={[styles.previewButtonWrapper, { flex: 2 }]}
          >
            <LinearGradient
              colors={[palette.accent, palette.accentAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.previewButton}
            >
              <IconSymbol name="cube.fill" size={20} color="#FFFFFF" />
              <Text style={styles.previewButtonText}>预览 3D</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.printButton, { borderColor: palette.accent, flex: 1 }]}
            onPress={handlePrint}
            activeOpacity={0.8}
          >
            <IconSymbol name="printer.fill" size={20} color={palette.accent} />
            <Text style={[styles.printButtonText, { color: palette.accent }]}>打印</Text>
          </TouchableOpacity>
        </View>

        {/* 开始新任务按钮 */}
        <TouchableOpacity
          style={[styles.newTaskButton, { borderColor: palette.border }]}
          onPress={onCreateNew}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus.circle" size={20} color={secondaryTextColor} />
          <Text style={[styles.newTaskButtonText, { color: secondaryTextColor }]}>开始新任务</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
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
  headerPlaceholder: {
    width: 44, // 与 headerButton 同宽，保持标题居中
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
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
  // 紧凑统计信息
  statsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
  },
  statCompactItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statCompactLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    opacity: 0.7,
    marginBottom: 4,
  },
  statCompactValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: '20%',
    bottom: '20%',
    width: 1,
  },
  // 主要操作按钮行
  primaryActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  // Preview 按钮包裹器
  previewButtonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  // Preview 按钮
  previewButton: {
    borderRadius: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#2680FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  // 打印按钮
  printButton: {
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  printButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  // 开始新任务按钮
  newTaskButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newTaskButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
