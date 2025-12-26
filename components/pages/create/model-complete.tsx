import { Platform, StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';
import type { GenerationTask } from '@/stores/create/types';
import { useEffect, useRef } from 'react';

interface ModelCompleteProps {
  task: GenerationTask;
  onView3D: () => void;
  onCreateNew: () => void;
  paddingBottom: number;
  isDark: boolean;
}

/**
 * 3D 模型生成完成组件 - 现代精致风格
 * 显示成功状态和操作按钮
 * 所有内容在一屏内展示，无需滚动
 */
export function ModelComplete({
  task,
  onView3D,
  onCreateNew,
  paddingBottom,
  isDark,
}: ModelCompleteProps) {
  // 动态颜色
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const secondaryTextColor = isDark ? Colors.dark.secondaryText : Colors.light.secondaryText;

  // 淡入动画
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 成功图标弹跳动画
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 淡入
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // 弹跳
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 头部 */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: textColor }]}>生成完成</Text>
        <Text style={[styles.subtitle, { color: secondaryTextColor }]}>您的 3D 模型已准备就绪</Text>
      </Animated.View>

      {/* 中心内容区 */}
      <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]}>
        {/* 成功图标 */}
        <Animated.View
          style={[
            styles.successIconWrapper,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={[
              styles.successIconGradient,
              Platform.select({
                ios: {
                  shadowColor: '#667EEA',
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
            <IconSymbol name="checkmark.circle.fill" size={80} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        {/* 成功提示文字 */}
        <View style={styles.successTextContainer}>
          <Text style={[styles.successTitle, { color: textColor }]}>创作完成!</Text>
          <Text style={[styles.successMessage, { color: secondaryTextColor }]}>
            已成功生成 3D 模型
          </Text>
        </View>

        {/* 模型信息标签 */}
        <View style={styles.infoTagsContainer}>
          <View
            style={[
              styles.infoTag,
              {
                backgroundColor: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
              },
            ]}
          >
            <IconSymbol name="doc.fill" size={16} color="#667EEA" />
            <Text style={[styles.infoTagText, { color: '#667EEA' }]}>GLB 格式</Text>
          </View>
          <View
            style={[
              styles.infoTag,
              {
                backgroundColor: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
              },
            ]}
          >
            <IconSymbol name="cube.fill" size={16} color="#667EEA" />
            <Text style={[styles.infoTagText, { color: '#667EEA' }]}>可交互</Text>
          </View>
        </View>
      </Animated.View>

      {/* 底部按钮组 */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            paddingBottom: paddingBottom || Spacing.lg,
            opacity: fadeAnim,
          },
        ]}
      >
        {/* 主操作按钮 - 查看 3D 模型 */}
        <TouchableOpacity
          onPress={onView3D}
          activeOpacity={0.85}
          style={styles.primaryButtonWrapper}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.primaryButton,
              Platform.select({
                ios: {
                  shadowColor: '#667EEA',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                },
                android: {
                  elevation: 8,
                },
              }),
            ]}
          >
            <IconSymbol name="eye.fill" size={22} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>查看 3D 模型</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 次要操作按钮 - 继续创作 */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
            },
          ]}
          onPress={onCreateNew}
          activeOpacity={0.7}
        >
          <IconSymbol name="plus.circle.fill" size={22} color="#667EEA" />
          <Text style={[styles.secondaryButtonText, { color: '#667EEA' }]}>继续创作新的</Text>
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

  // 成功图标包裹器
  successIconWrapper: {
    width: 140, // 宽度
    height: 140, // 高度
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 成功图标渐变
  successIconGradient: {
    width: 130, // 宽度
    height: 130, // 高度
    borderRadius: BorderRadius.xl, // 大圆角
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 成功提示文字容器
  successTextContainer: {
    alignItems: 'center', // 水平居中
    gap: Spacing.xs, // 间距
  },

  // 成功标题
  successTitle: {
    fontSize: 32, // 超大字号
    fontWeight: '700', // 粗体
    letterSpacing: -0.5, // 紧凑字间距
  },

  // 成功消息
  successMessage: {
    fontSize: FontSize.md, // 中等字号
    fontWeight: FontWeight.medium, // 中等字重
    opacity: 0.7, // 透明度
  },

  // 信息标签容器
  infoTagsContainer: {
    flexDirection: 'row', // 横向排列
    gap: Spacing.md, // 间距
    marginTop: Spacing.md, // 顶部间距
  },

  // 信息标签
  infoTag: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    paddingVertical: Spacing.sm, // 垂直内边距
    paddingHorizontal: Spacing.md, // 水平内边距
    borderRadius: BorderRadius.full, // 完全圆角
    gap: 6, // 间距
  },

  // 信息标签文字
  infoTagText: {
    fontSize: FontSize.sm, // 小字号
    fontWeight: FontWeight.semibold, // 半粗体
  },

  // 底部容器
  bottomContainer: {
    paddingHorizontal: Spacing.lg, // 水平内边距
    paddingTop: Spacing.lg, // 顶部内边距
    gap: Spacing.sm, // 间距
  },

  // 主按钮包裹器
  primaryButtonWrapper: {
    // 无额外样式
  },

  // 主按钮
  primaryButton: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    justifyContent: 'center', // 水平居中
    paddingVertical: 18, // 垂直内边距
    borderRadius: BorderRadius.md, // 中等圆角
    gap: Spacing.sm, // 间距
  },

  // 主按钮文字
  primaryButtonText: {
    color: '#FFFFFF', // 白色文字
    fontSize: FontSize.lg, // 大字号
    fontWeight: FontWeight.bold, // 粗体
    letterSpacing: 0.3, // 字间距
  },

  // 次要按钮
  secondaryButton: {
    paddingVertical: Spacing.lg, // 垂直内边距
    borderRadius: BorderRadius.md, // 中等圆角
    alignItems: 'center', // 水平居中
    flexDirection: 'row', // 横向排列
    justifyContent: 'center', // 水平居中
    gap: Spacing.xs, // 间距
  },

  // 次要按钮文字
  secondaryButtonText: {
    fontSize: FontSize.md, // 中等字号
    fontWeight: FontWeight.semibold, // 半粗体
  },
});
