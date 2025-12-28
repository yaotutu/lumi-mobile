import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';
import type { GenerationTask } from '@/stores/create/types';
import { useEffect, useRef } from 'react';

const LIGHT_UI = {
  background: '#F5F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  secondary: '#6E7894',
  border: '#E1E7F4',
};

const DARK_UI = {
  background: '#050810',
  card: '#11182A',
  text: '#F6F7FF',
  secondary: '#9CA7C2',
  border: '#232C41',
};

interface ModelGeneratingProps {
  task: GenerationTask;
  onCancel: () => void;
  paddingBottom: number;
  isDark: boolean;
}

/**
 * 3D 模型生成中组件 - 现代精致风格
 * 显示生成进度和旋转立方体动画
 */
export function ModelGenerating({ task, onCancel, paddingBottom, isDark }: ModelGeneratingProps) {
  // 动态颜色
  const palette = isDark ? DARK_UI : LIGHT_UI;
  const backgroundColor = palette.background;
  const textColor = palette.text;
  const secondaryTextColor = palette.secondary;
  const borderColor = palette.border;

  const progress = task.modelProgress || 0;
  const gradientColors: [string, string] = isDark ? ['#3B82F6', '#6366F1'] : ['#2680FF', '#5A8BFF'];
  const primaryShadow = gradientColors[0];

  // 淡入动画
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 立方体旋转动画
  const cubeRotationValue = useRef(new Animated.Value(0)).current;

  // 脉冲动画
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 淡入
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // 旋转
    Animated.loop(
      Animated.timing(cubeRotationValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 脉冲
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, cubeRotationValue, pulseValue]);

  const cubeRotation = cubeRotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 计算当前阶段
  const currentStage = Math.min(Math.floor(progress / 25), 3);
  const stages = ['分析参考', '构建网格', '添加纹理', '优化导出'];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 头部 */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.7}
          style={[styles.headerButton, { borderColor }]}
        >
          <IconSymbol name="chevron.left" size={18} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.title, { color: textColor }]}>AI Model Builder</Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            {stages[currentStage]}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* 中心内容区 */}
      <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]}>
        {/* 旋转立方体 */}
        <Animated.View
          style={[
            styles.cubeWrapper,
            {
              transform: [{ scale: pulseValue }, { rotate: cubeRotation }],
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            style={[
              styles.cubeGradient,
              Platform.select({
                ios: {
                  shadowColor: primaryShadow,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                },
                android: {
                  elevation: 12,
                },
              }),
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol name="cube.fill" size={64} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        {/* 进度百分比 */}
        <Text style={[styles.progressPercent, { color: textColor }]}>{progress}%</Text>

        {/* 进度条 */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: borderColor }]}>
            <LinearGradient
              colors={gradientColors}
              style={[styles.progressBarFill, { width: `${progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        {/* 阶段指示点 */}
        <View style={styles.stageDotsContainer}>
          {[0, 1, 2, 3].map(index => {
            const isCompleted = currentStage > index;
            const isCurrent = currentStage === index;
            return (
              <View key={index} style={styles.stageDotWrapper}>
                <View
                  style={[
                    styles.stageDot,
                    {
                      backgroundColor:
                        isCompleted || isCurrent
                          ? gradientColors[0]
                          : isDark
                            ? Colors.dark.border
                            : Colors.light.border,
                      width: isCurrent ? 32 : 8,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* 阶段文字提示 */}
        <Text style={[styles.stageText, { color: secondaryTextColor }]}>
          第 {currentStage + 1}/4 步
        </Text>
      </Animated.View>

      {/* 底部按钮 */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            paddingBottom: paddingBottom || Spacing.lg,
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.cancelButton,
            {
              backgroundColor: isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.05)',
            },
          ]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelButtonText, { color: '#FF3B30' }]}>取消生成</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1, // 占满空间
    justifyContent: 'space-between', // 上下分布
  },

  // 头部区域
  header: {
    paddingHorizontal: Spacing.lg, // 水平内边距
    paddingTop: Spacing.xl, // 顶部内边距
    paddingBottom: Spacing.md, // 底部内边距
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitles: {
    flex: 1,
  },
  headerSpacer: {
    width: 44,
  },

  // 标题样式
  title: {
    fontSize: 28, // 大标题
    fontWeight: '700', // 粗体
    letterSpacing: -0.5, // 紧凑字间距
    marginBottom: Spacing.xs, // 底部间距
  },

  // 副标题样式
  subtitle: {
    fontSize: FontSize.md, // 中等字号
    fontWeight: FontWeight.medium, // 中等字重
    opacity: 0.7, // 透明度
  },

  // 中心容器
  centerContainer: {
    flex: 1, // 占据剩余空间
    paddingHorizontal: Spacing.lg, // 水平内边距
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    gap: Spacing.xl, // 间距
  },

  // 立方体包裹器
  cubeWrapper: {
    width: 140, // 宽度
    height: 140, // 高度
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 立方体渐变
  cubeGradient: {
    width: 130, // 宽度
    height: 130, // 高度
    borderRadius: BorderRadius.xl, // 大圆角
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 进度百分比
  progressPercent: {
    fontSize: 48, // 超大字号
    fontWeight: '700', // 粗体
    letterSpacing: -1, // 紧凑字间距
  },

  // 进度条容器
  progressBarContainer: {
    width: '100%', // 宽度
    maxWidth: 320, // 最大宽度
    height: 8, // 高度
  },

  // 进度条背景
  progressBarBackground: {
    height: '100%', // 高度
    borderRadius: 4, // 圆角
    overflow: 'hidden', // 隐藏溢出
  },

  // 进度条填充
  progressBarFill: {
    height: '100%', // 高度
    borderRadius: 4, // 圆角
  },

  // 阶段点容器
  stageDotsContainer: {
    flexDirection: 'row', // 横向排列
    gap: Spacing.sm, // 间距
    alignItems: 'center', // 垂直居中
    marginTop: Spacing.md, // 顶部间距
  },

  // 阶段点包裹器
  stageDotWrapper: {
    // 无额外样式
  },

  // 阶段点
  stageDot: {
    height: 8, // 高度
    borderRadius: 4, // 圆角
  },

  // 阶段文字
  stageText: {
    fontSize: FontSize.sm, // 小字号
    fontWeight: FontWeight.medium, // 中等字重
    marginTop: Spacing.sm, // 顶部间距
  },

  // 底部容器
  bottomContainer: {
    paddingHorizontal: Spacing.lg, // 水平内边距
    paddingTop: Spacing.lg, // 顶部内边距
  },

  // 取消按钮
  cancelButton: {
    paddingVertical: Spacing.lg, // 垂直内边距
    borderRadius: BorderRadius.md, // 中等圆角
    alignItems: 'center', // 水平居中
  },

  // 取消按钮文字
  cancelButtonText: {
    fontSize: FontSize.md, // 中等字号
    fontWeight: FontWeight.semibold, // 半粗体
  },
});
