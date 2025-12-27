import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';
import type { GenerationTask } from '@/stores/create/types';

interface ImageGeneratingProps {
  task: GenerationTask;
  onSelectImage?: (imageId: string) => void;
  onGenerateModel?: () => void;
  onCancel: () => void;
  paddingBottom: number;
  isDark: boolean;
}

/**
 * 图片生成组件 - 现代精致风格
 * 显示 4 张图片的生成进度，使用骨架屏和流畅动画
 * 生成完成后展示真实图片供用户选择
 */
export function ImageGenerating({
  task,
  onSelectImage,
  onGenerateModel,
  onCancel,
  paddingBottom,
  isDark,
}: ImageGeneratingProps) {
  // 动画值
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 动态颜色
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const secondaryTextColor = isDark ? Colors.dark.secondaryText : Colors.light.secondaryText;
  const placeholderBg = isDark ? Colors.dark.inputBackground : Colors.light.inputBackground;
  const cardBackground = isDark ? Colors.dark.cardBackground : Colors.light.cardBackground;
  const borderColor = isDark ? Colors.dark.border : Colors.light.border;

  const progress = task.imageProgress || 0;
  const isGenerating = task.status === 'generating_images';
  const isReady = task.status === 'images_ready';

  // 选中的图片 ID
  const [selectedId, setSelectedId] = useState<string | null>(task.selectedImageId || null);

  // 淡入动画
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // 闪烁动画
  useEffect(() => {
    if (isGenerating) {
      Animated.loop(
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1800,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [shimmerValue, isGenerating]);

  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  // 处理图片选择
  const handleSelectImage = (imageId: string) => {
    setSelectedId(imageId);
    onSelectImage?.(imageId);
  };

  // 处理生成3D模型
  const handleGenerateModel = () => {
    if (!selectedId) return;
    onGenerateModel?.();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 头部 */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: textColor }]}>
          {isGenerating ? 'AI 创作中' : '选择参考图'}
        </Text>
        <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
          {isGenerating ? '正在生成 4 张精美预览图' : '轻触选择最满意的一张'}
        </Text>
      </Animated.View>

      {/* 图片网格 */}
      <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}>
        <View style={styles.grid}>
          {isGenerating
            ? // 生成中 - 显示骨架屏
              [0, 1, 2, 3].map(index => {
                const isCompleted = Math.floor(progress / 25) > index;
                const isCurrent = Math.floor(progress / 25) === index;

                return (
                  <View key={index} style={styles.placeholderWrapper}>
                    <View
                      style={[
                        styles.placeholder,
                        {
                          backgroundColor: placeholderBg,
                          borderWidth: isCurrent ? 1.5 : 1,
                          borderColor: isCurrent ? '#667EEA' : borderColor,
                        },
                        Platform.select({
                          ios: {
                            shadowColor: isCurrent ? '#667EEA' : '#000',
                            shadowOffset: { width: 0, height: isCurrent ? 4 : 2 },
                            shadowOpacity: isCurrent ? 0.25 : isDark ? 0.3 : 0.08,
                            shadowRadius: isCurrent ? 12 : 8,
                          },
                          android: {
                            elevation: isCurrent ? 4 : 2,
                          },
                        }),
                      ]}
                    >
                      {/* 闪烁效果 - 仅当前生成的图片 */}
                      {isCurrent && (
                        <Animated.View
                          style={[
                            styles.shimmer,
                            {
                              transform: [{ translateX: shimmerTranslate }],
                            },
                          ]}
                        >
                          <LinearGradient
                            colors={['transparent', 'rgba(102, 126, 234, 0.25)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.shimmerGradient}
                          />
                        </Animated.View>
                      )}

                      {/* 状态图标 */}
                      {isCompleted && (
                        <View style={styles.statusIcon}>
                          <View style={styles.completedRing}>
                            <LinearGradient
                              colors={['#34C759', '#30D158']}
                              style={styles.completedGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <IconSymbol name="checkmark" size={18} color="#FFFFFF" />
                            </LinearGradient>
                          </View>
                        </View>
                      )}

                      {isCurrent && (
                        <View style={styles.statusIcon}>
                          <View style={styles.generatingRing}>
                            <LinearGradient
                              colors={['#667EEA', '#764BA2']}
                              style={styles.generatingGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <View style={styles.generatingDot} />
                            </LinearGradient>
                          </View>
                        </View>
                      )}

                      {/* 图片编号 */}
                      <View
                        style={[
                          styles.imageNumber,
                          {
                            backgroundColor:
                              isCompleted || isCurrent
                                ? 'rgba(102, 126, 234, 0.95)'
                                : 'rgba(0, 0, 0, 0.4)',
                          },
                        ]}
                      >
                        <Text style={styles.imageNumberText}>{index + 1}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            : // 生成完成 - 显示真实图片
              task.images?.map((image, index) => {
                const isSelected = selectedId === image.id;
                return (
                  <TouchableOpacity
                    key={image.id}
                    style={styles.imageCardWrapper}
                    onPress={() => handleSelectImage(image.id)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.imageCard,
                        {
                          backgroundColor: cardBackground,
                          borderColor: isSelected ? '#667EEA' : borderColor,
                          borderWidth: isSelected ? 2.5 : 1,
                        },
                        Platform.select({
                          ios: {
                            shadowColor: isSelected ? '#667EEA' : '#000',
                            shadowOffset: { width: 0, height: isSelected ? 8 : 2 },
                            shadowOpacity: isSelected ? 0.35 : isDark ? 0.3 : 0.08,
                            shadowRadius: isSelected ? 16 : 8,
                          },
                          android: {
                            elevation: isSelected ? 8 : 2,
                          },
                        }),
                      ]}
                    >
                      {/* 图片 */}
                      <Image
                        source={{ uri: image.thumbnail }}
                        style={[styles.image, { opacity: isSelected ? 1 : 0.75 }]}
                        resizeMode="cover"
                      />

                      {/* 选中状态标记 */}
                      {isSelected && (
                        <View style={styles.selectedOverlay}>
                          <View style={styles.selectedRing}>
                            <LinearGradient
                              colors={['#667EEA', '#764BA2']}
                              style={styles.selectedRingGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <View style={[styles.selectedRingInner, { backgroundColor }]}>
                                <IconSymbol name="checkmark" size={20} color="#667EEA" />
                              </View>
                            </LinearGradient>
                          </View>
                        </View>
                      )}

                      {/* 图片编号 */}
                      <View
                        style={[
                          styles.imageNumber,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(102, 126, 234, 0.95)'
                              : 'rgba(0, 0, 0, 0.6)',
                          },
                        ]}
                      >
                        <Text style={styles.imageNumberText}>{index + 1}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
        </View>

        {/* 进度提示 - 仅生成中时显示 */}
        {isGenerating && (
          <View style={styles.progressHint}>
            <View style={styles.progressDots}>
              {[0, 1, 2, 3].map(index => {
                const isActive = Math.floor(progress / 25) >= index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: isActive ? '#667EEA' : borderColor,
                        width: isActive ? 24 : 8,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <Text style={[styles.progressText, { color: secondaryTextColor }]}>
              {Math.floor(progress / 25)} / 4 已完成
            </Text>
          </View>
        )}

        {/* 提示文字 - 仅完成且未选择时显示 */}
        {isReady && !selectedId && (
          <View style={styles.hintContainer}>
            <IconSymbol name="hand.tap" size={16} color={secondaryTextColor} />
            <Text style={[styles.hintText, { color: secondaryTextColor }]}>选择一张图片以继续</Text>
          </View>
        )}

        {/* 占位容器 - 确保布局一致性，当没有提示时占据空间 */}
        {isReady && selectedId && <View style={styles.hintPlaceholder} />}
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
        {isReady ? (
          // 生成完成 - 显示主操作按钮（水平排列）
          <View style={styles.actionButtonsRow}>
            {/* 主操作按钮 - 生成 3D 模型 */}
            <TouchableOpacity
              onPress={handleGenerateModel}
              disabled={!selectedId}
              activeOpacity={0.85}
              style={styles.primaryButtonWrapper}
            >
              <LinearGradient
                colors={selectedId ? ['#667EEA', '#764BA2'] : [borderColor, borderColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.primaryButton,
                  {
                    opacity: selectedId ? 1 : 0.4,
                    ...Platform.select({
                      ios: selectedId
                        ? {
                            shadowColor: '#667EEA',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.4,
                            shadowRadius: 16,
                          }
                        : {},
                      android: selectedId
                        ? {
                            elevation: 8,
                          }
                        : {},
                    }),
                  },
                ]}
              >
                <IconSymbol name="cube.fill" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>生成 3D 模型</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 次要操作按钮 - 取消 */}
            <TouchableOpacity
              style={[
                styles.secondaryButtonCompact,
                {
                  backgroundColor: isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.05)',
                },
              ]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: '#FF3B30' }]}>取消</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 生成中 - 显示取消按钮
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
        )}
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
    paddingTop: Spacing.lg, // 顶部内边距
    paddingBottom: Spacing.sm, // 底部内边距
  },

  // 标题样式
  title: {
    fontSize: 24, // 大标题
    fontWeight: '700', // 粗体
    letterSpacing: -0.5, // 紧凑字间距
    marginBottom: 4, // 底部间距
  },

  // 副标题样式
  subtitle: {
    fontSize: FontSize.sm, // 小字号
    fontWeight: FontWeight.medium, // 中等字重
    opacity: 0.7, // 透明度
  },

  // 网格容器
  gridContainer: {
    flex: 1, // 占据剩余空间
    paddingHorizontal: Spacing.lg, // 水平内边距
    justifyContent: 'center', // 垂直居中
  },

  // 图片网格
  grid: {
    flexDirection: 'row', // 横向排列
    flexWrap: 'wrap', // 换行
    gap: Spacing.sm, // 图片间距
    justifyContent: 'space-between', // 两端对齐
    marginBottom: Spacing.lg, // 底部固定间距，为提示文字和进度点预留空间
  },

  // 占位符包裹器
  placeholderWrapper: {
    width: '48%', // 宽度 48%
    aspectRatio: 1, // 正方形
  },

  // 占位符
  placeholder: {
    width: '100%', // 宽度
    height: '100%', // 高度
    borderRadius: BorderRadius.lg, // 大圆角
    overflow: 'hidden', // 隐藏溢出
    position: 'relative', // 相对定位
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 闪烁效果
  shimmer: {
    position: 'absolute', // 绝对定位
    top: 0, // 顶部对齐
    left: -150, // 左侧偏移
    width: 150, // 宽度
    height: '100%', // 高度
  },

  // 闪烁渐变
  shimmerGradient: {
    width: '100%', // 宽度
    height: '100%', // 高度
  },

  // 状态图标容器
  statusIcon: {
    position: 'absolute', // 绝对定位
  },

  // 完成环形
  completedRing: {
    width: 40, // 宽度
    height: 40, // 高度
    borderRadius: 20, // 圆形
  },

  // 完成渐变
  completedGradient: {
    width: '100%', // 宽度
    height: '100%', // 高度
    borderRadius: 20, // 圆形
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 生成中环形
  generatingRing: {
    width: 40, // 宽度
    height: 40, // 高度
    borderRadius: 20, // 圆形
  },

  // 生成中渐变
  generatingGradient: {
    width: '100%', // 宽度
    height: '100%', // 高度
    borderRadius: 20, // 圆形
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 生成中圆点
  generatingDot: {
    width: 12, // 宽度
    height: 12, // 高度
    borderRadius: 6, // 圆形
    backgroundColor: '#FFFFFF', // 白色
  },

  // 图片编号
  imageNumber: {
    position: 'absolute', // 绝对定位
    top: Spacing.sm, // 顶部对齐
    right: Spacing.sm, // 右侧对齐
    width: 24, // 宽度
    height: 24, // 高度
    borderRadius: 12, // 圆形
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 图片编号文字
  imageNumberText: {
    color: '#FFFFFF', // 白色文字
    fontSize: FontSize.xs, // 小字号
    fontWeight: FontWeight.bold, // 粗体
  },

  // 进度提示容器
  progressHint: {
    alignItems: 'center', // 水平居中
    gap: Spacing.md, // 间距
    minHeight: 44, // 固定最小高度，保持布局一致
    marginTop: Spacing.md, // 与 hintContainer 保持一致
    marginBottom: Spacing.sm,
  },

  // 进度点容器
  progressDots: {
    flexDirection: 'row', // 横向排列
    gap: Spacing.xs, // 间距
    alignItems: 'center', // 垂直居中
  },

  // 进度点
  progressDot: {
    height: 8, // 高度
    borderRadius: 4, // 圆角
  },

  // 进度文字
  progressText: {
    fontSize: FontSize.sm, // 小字号
    fontWeight: FontWeight.medium, // 中等字重
  },

  // 图片卡片包裹器
  imageCardWrapper: {
    width: '48%', // 宽度 48%
    aspectRatio: 1, // 正方形
  },

  // 图片卡片
  imageCard: {
    width: '100%', // 宽度
    height: '100%', // 高度
    borderRadius: BorderRadius.lg, // 大圆角
    overflow: 'hidden', // 隐藏溢出
    position: 'relative', // 相对定位
  },

  // 图片
  image: {
    width: '100%', // 宽度
    height: '100%', // 高度
  },

  // 选中状态遮罩
  selectedOverlay: {
    position: 'absolute', // 绝对定位
    top: 0, // 顶部对齐
    left: 0, // 左侧对齐
    right: 0, // 右侧对齐
    bottom: 0, // 底部对齐
    backgroundColor: 'rgba(102, 126, 234, 0.08)', // 淡紫色遮罩
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 选中环形标记
  selectedRing: {
    width: 48, // 宽度
    height: 48, // 高度
    borderRadius: 24, // 圆形
  },

  // 选中环形渐变
  selectedRingGradient: {
    width: '100%', // 宽度
    height: '100%', // 高度
    borderRadius: 24, // 圆形
    padding: 3, // 内边距（形成环形效果）
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 选中环形内圆
  selectedRingInner: {
    width: 40, // 宽度
    height: 40, // 高度
    borderRadius: 20, // 圆形
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
  },

  // 提示容器
  hintContainer: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    justifyContent: 'center', // 水平居中
    gap: Spacing.xs, // 间距
    minHeight: 44, // 固定最小高度，保持布局一致
    marginTop: Spacing.md, // 与 progressHint 保持一致
    marginBottom: Spacing.sm,
  },

  // 提示文字
  hintText: {
    fontSize: FontSize.sm, // 小字号
    fontWeight: FontWeight.medium, // 中等字重
  },

  // 占位容器 - 保持布局一致性
  hintPlaceholder: {
    height: 44, // 固定高度，与 hintContainer 和 progressHint 一致
    marginTop: Spacing.md, // 与其他容器保持一致
    marginBottom: Spacing.sm,
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

  // 底部容器
  bottomContainer: {
    paddingHorizontal: Spacing.lg, // 水平内边距
    paddingTop: Spacing.md, // 减小顶部内边距
  },

  // 操作按钮行（水平排列）
  actionButtonsRow: {
    flexDirection: 'row', // 横向排列
    gap: Spacing.sm, // 按钮间距
    alignItems: 'center', // 垂直居中
  },

  // 主按钮包裹器
  primaryButtonWrapper: {
    flex: 1, // 占据主要空间
  },

  // 次要按钮（紧凑版，用于水平布局）
  secondaryButtonCompact: {
    paddingVertical: Spacing.lg, // 垂直内边距
    paddingHorizontal: Spacing.lg, // 水平内边距
    borderRadius: BorderRadius.md, // 中等圆角
    alignItems: 'center', // 水平居中
    justifyContent: 'center', // 垂直居中
    minWidth: 80, // 最小宽度
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
