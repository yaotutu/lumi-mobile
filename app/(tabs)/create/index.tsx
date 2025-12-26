import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { ExamplePrompts } from '@/components/pages/create/example-prompts';
import { WelcomeSection } from '@/components/pages/create/welcome-section';
import { ImageGenerating } from '@/components/pages/create/image-generating';
import { ModelGenerating } from '@/components/pages/create/model-generating';
import { ModelComplete } from '@/components/pages/create/model-complete';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { useCreateStore } from '@/stores';
import { logger } from '@/utils/logger';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';

/**
 * AI 创作页面
 * 根据 currentTask 的状态显示不同的 UI:
 * - 无任务: 显示输入界面
 * - generating_images: 图片生成中（骨架屏）
 * - images_ready: 图片生成完成（在同一页面显示真实图片供选择）
 * - generating_model: 3D模型生成中
 * - model_ready: 生成完成
 */
export default function CreateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { contentPaddingBottom } = useSafeAreaSpacing();

  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 从 Store 获取当前任务和操作方法
  const currentTask = useCreateStore(state => state.currentTask);
  const createTask = useCreateStore(state => state.createTask);
  const selectImage = useCreateStore(state => state.selectImage);
  const generateModel = useCreateStore(state => state.generateModel);
  const cancelTask = useCreateStore(state => state.cancelTask);
  const reset = useCreateStore(state => state.reset);

  // 动态颜色
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const cardBackground = isDark ? Colors.dark.cardBackground : Colors.light.cardBackground;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const secondaryTextColor = isDark ? Colors.dark.secondaryText : Colors.light.secondaryText;
  const tertiaryTextColor = isDark ? Colors.dark.tertiaryText : Colors.light.tertiaryText;
  const borderColor = isDark ? Colors.dark.border : Colors.light.border;
  const inputBackground = isDark ? Colors.dark.inputBackground : Colors.light.inputBackground;

  // 处理提交
  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      logger.info('创建生成任务:', prompt);

      // 创建任务
      await createTask(prompt.trim());

      // 清空输入
      setPrompt('');
    } catch (error) {
      logger.error('创建任务失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 选择示例提示词
  const handleSelectExample = (example: string) => {
    setPrompt(example);
  };

  // 处理图片选择
  const handleSelectImage = async (imageId: string) => {
    if (!currentTask) return;
    await selectImage(currentTask.id, imageId);
  };

  // 处理生成3D模型
  const handleGenerateModel = async () => {
    if (!currentTask) return;
    await generateModel(currentTask.id);
  };

  // 处理取消任务
  const handleCancel = () => {
    if (!currentTask) return;
    cancelTask(currentTask.id);
  };

  // 处理查看3D模型
  const handleView3D = () => {
    if (!currentTask?.modelUrl) return;
    // 导航到3D查看器页面（全屏页面，不在tab内）
    router.push(`/model-viewer/${currentTask.id}`);
  };

  // 处理继续创作新的
  const handleCreateNew = () => {
    reset(); // 重置当前任务
    setPrompt(''); // 清空输入
  };

  const isButtonActive = prompt.trim().length > 0 && !isSubmitting;

  // 根据当前任务状态渲染不同的 UI
  const renderContent = () => {
    // 无任务或任务已取消 - 显示输入界面
    if (!currentTask || currentTask.status === 'cancelled') {
      return (
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentPaddingBottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 标题区域 */}
          <WelcomeSection
            isDark={isDark}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
          />

          {/* 主输入卡片 */}
          <View
            style={[
              styles.mainCard,
              {
                backgroundColor: cardBackground,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.08,
                    shadowRadius: 12,
                  },
                  android: {
                    elevation: 3,
                  },
                }),
              },
            ]}
          >
            {/* 输入区域 */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: textColor }]}>创作描述</Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: prompt.length > 0 ? Colors.light.tint : borderColor,
                    backgroundColor: inputBackground,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="描述你想要的 3D 模型,越详细越好..."
                  placeholderTextColor={tertiaryTextColor}
                  value={prompt}
                  onChangeText={setPrompt}
                  multiline
                  maxLength={500}
                  returnKeyType="default"
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.inputMeta}>
                <Text
                  style={[
                    styles.charCount,
                    {
                      color: prompt.length > 450 ? '#FF3B30' : secondaryTextColor,
                    },
                  ]}
                >
                  {prompt.length}/500 字符
                </Text>
              </View>
            </View>

            {/* 示例提示词 */}
            <View style={styles.examplesSection}>
              <ExamplePrompts
                onPromptSelect={handleSelectExample}
                cardBackground={inputBackground}
                borderColor={borderColor}
                textColor={textColor}
              />
            </View>
          </View>

          {/* 底部固定区域 */}
          <View style={styles.bottomSection}>
            {/* 提示信息 */}
            <View style={styles.tipContainer}>
              <View
                style={[
                  styles.tipBadge,
                  {
                    backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 149, 0, 0.1)',
                  },
                ]}
              >
                <IconSymbol name="lightbulb.fill" size={14} color="#FF9500" />
                <Text style={[styles.tipText, { color: '#FF9500' }]}>
                  生成需要 2-3 分钟,可随时离开
                </Text>
              </View>
            </View>

            {/* 生成按钮 */}
            <TouchableOpacity
              style={styles.generateButtonWrapper}
              onPress={handleSubmit}
              disabled={!isButtonActive}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isButtonActive ? ['#667EEA', '#764BA2'] : [borderColor, borderColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.generateButton,
                  {
                    opacity: isButtonActive ? 1 : 0.5,
                    ...Platform.select({
                      ios: isButtonActive
                        ? {
                            shadowColor: '#667EEA',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                          }
                        : {},
                      android: isButtonActive
                        ? {
                            elevation: 6,
                          }
                        : {},
                    }),
                  },
                ]}
              >
                {isSubmitting ? (
                  <>
                    <IconSymbol name="hourglass" size={20} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>创建中...</Text>
                  </>
                ) : (
                  <>
                    <IconSymbol name="wand.and.stars" size={20} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>开始创作</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      );
    }

    // 图片生成中或图片已生成（在同一组件中处理）
    if (currentTask.status === 'generating_images' || currentTask.status === 'images_ready') {
      return (
        <ImageGenerating
          task={currentTask}
          onSelectImage={handleSelectImage}
          onGenerateModel={handleGenerateModel}
          onCancel={handleCancel}
          paddingBottom={contentPaddingBottom}
          isDark={isDark}
        />
      );
    }

    // 模型生成中
    if (currentTask.status === 'generating_model') {
      return (
        <ModelGenerating
          task={currentTask}
          onCancel={handleCancel}
          paddingBottom={contentPaddingBottom}
          isDark={isDark}
        />
      );
    }

    // 模型生成完成
    if (currentTask.status === 'model_ready') {
      return (
        <ModelComplete
          task={currentTask}
          onView3D={handleView3D}
          onCreateNew={handleCreateNew}
          paddingBottom={contentPaddingBottom}
          isDark={isDark}
        />
      );
    }

    // 失败状态
    if (currentTask.status === 'failed') {
      return (
        <View style={[styles.errorContainer, { paddingBottom: contentPaddingBottom }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={60} color="#FF3B30" />
          <Text style={[styles.errorTitle, { color: '#FF3B30' }]}>生成失败</Text>
          <Text style={[styles.errorMessage, { color: textColor }]}>{currentTask.error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: '#FF3B30' }]}
            onPress={handleCreateNew}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.clockwise" size={20} color="#FF3B30" />
            <Text style={[styles.retryButtonText, { color: '#FF3B30' }]}>重新开始</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return <ScreenWrapper style={{ backgroundColor }}>{renderContent()}</ScreenWrapper>;
}

const styles = StyleSheet.create({
  // ScrollView 样式
  scrollView: {
    flex: 1, // 占满空间
  },

  // ScrollView 内容容器样式
  scrollContent: {
    padding: Spacing.lg, // 使用主题间距
  },

  // 主卡片样式
  mainCard: {
    borderRadius: BorderRadius.lg, // 使用主题圆角
    padding: Spacing.xl, // 使用主题间距
    marginBottom: Spacing.xl, // 使用主题间距
  },

  // 输入区域样式
  inputSection: {
    marginBottom: Spacing.xxl, // 使用主题间距
  },

  // 输入标签样式
  inputLabel: {
    fontSize: FontSize.sm, // 使用主题字号
    fontWeight: FontWeight.semibold, // 使用主题字重
    marginBottom: Spacing.md, // 使用主题间距
  },

  // 输入框包裹器样式
  inputWrapper: {
    borderRadius: BorderRadius.md, // 使用主题圆角
    borderWidth: 1.5, // 边框宽度
    padding: Spacing.lg, // 使用主题间距
  },

  // 输入框样式
  input: {
    fontSize: FontSize.md, // 使用主题字号
    lineHeight: 22, // 行高
    minHeight: 120, // 最小高度
    textAlignVertical: 'top', // 顶部对齐
  },

  // 输入元信息样式
  inputMeta: {
    flexDirection: 'row', // 横向排列
    justifyContent: 'flex-end', // 右对齐
    marginTop: Spacing.sm, // 使用主题间距
  },

  // 字符计数样式
  charCount: {
    fontSize: FontSize.xs, // 使用主题字号
    fontWeight: FontWeight.medium, // 使用主题字重
  },

  // 示例区域样式
  examplesSection: {
    // 无额外样式
  },

  // 底部区域样式
  bottomSection: {
    gap: Spacing.md, // 使用主题间距
  },

  // 提示容器样式
  tipContainer: {
    alignItems: 'center', // 水平居中
  },

  // 提示徽章样式
  tipBadge: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    paddingVertical: Spacing.sm, // 使用主题间距
    paddingHorizontal: Spacing.md, // 使用主题间距
    borderRadius: BorderRadius.full, // 使用主题圆角
    gap: 6, // 间距
  },

  // 提示文字样式
  tipText: {
    fontSize: FontSize.xs, // 使用主题字号
    fontWeight: FontWeight.medium, // 使用主题字重
  },

  // 生成按钮外层包裹器
  generateButtonWrapper: {
    // 无额外样式
  },

  // 生成按钮样式
  generateButton: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    justifyContent: 'center', // 水平居中
    paddingVertical: Spacing.lg, // 使用主题间距
    borderRadius: BorderRadius.md, // 使用主题圆角
    gap: Spacing.sm, // 使用主题间距
  },

  // 生成按钮文字样式
  generateButtonText: {
    color: '#FFFFFF', // 白色文字
    fontSize: FontSize.md, // 使用主题字号
    fontWeight: FontWeight.semibold, // 使用主题字重
    letterSpacing: 0.3, // 字间距
  },

  // 错误容器样式
  errorContainer: {
    flex: 1, // 占满空间
    justifyContent: 'center', // 水平居中
    alignItems: 'center', // 垂直居中
    paddingHorizontal: Spacing.xl, // 使用主题间距
    gap: Spacing.lg, // 使用主题间距
  },

  // 错误标题样式
  errorTitle: {
    fontSize: FontSize.xxl, // 使用主题字号
    fontWeight: FontWeight.bold, // 使用主题字重
  },

  // 错误消息样式
  errorMessage: {
    fontSize: FontSize.md, // 使用主题字号
    textAlign: 'center', // 居中对齐
    marginBottom: Spacing.md, // 使用主题间距
  },

  // 重试按钮样式
  retryButton: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    paddingVertical: Spacing.md, // 使用主题间距
    paddingHorizontal: Spacing.xl, // 使用主题间距
    borderRadius: BorderRadius.md, // 使用主题圆角
    borderWidth: 1.5, // 边框宽度
    gap: Spacing.sm, // 使用主题间距
  },

  // 重试按钮文字样式
  retryButtonText: {
    fontSize: FontSize.md, // 使用主题字号
    fontWeight: FontWeight.semibold, // 使用主题字重
  },
});
