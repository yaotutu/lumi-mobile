import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { ImageGenerating } from '@/components/pages/create/image-generating';
import { ModelGenerating } from '@/components/pages/create/model-generating';
import { ModelComplete } from '@/components/pages/create/model-complete';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { AuthGuard } from '@/components/auth';
import { useCreateStore } from '@/stores';
import { logger } from '@/utils/logger';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';

type QuickStyle = {
  id: string;
  label: string;
  icon: IconSymbolName;
  prompt: string;
};

const QUICK_STYLES: QuickStyle[] = [
  {
    id: 'scifi',
    label: '科幻',
    icon: 'sparkles',
    prompt: '一条泛着体积光的太空飞船走廊，金属细节精致。',
  },
  {
    id: 'nature',
    label: '自然',
    icon: 'leaf.fill',
    prompt: '一棵摆放在石台上的小型盆景树，柔和晨光照射。',
  },
  {
    id: 'characters',
    label: '角色',
    icon: 'person.crop.circle',
    prompt: '一位科幻探险者的半身像，冷暖对比光与精致皮肤。',
  },
  {
    id: 'architecture',
    label: '建筑',
    icon: 'building.columns',
    prompt: '一座悬浮的未来白色展馆，玻璃与曲线结构交错。',
  },
  {
    id: 'fantasy',
    label: '幻想',
    icon: 'wand.and.stars',
    prompt: '一个漂浮的奇幻岛屿，瀑布和发光水晶环绕。',
  },
  {
    id: 'vehicles',
    label: '载具',
    icon: 'car.fill',
    prompt: '低多边形的电动概念车，工作室柔光照亮车身。',
  },
];

const LIGHT_PALETTE = {
  // 移除自定义的 background，使用 ScreenWrapper 的统一背景
  card: '#FFFFFF',
  border: '#DDE5F2',
  text: '#0F172A',
  secondary: '#5F6B85',
  tertiary: '#A1B1CE',
  accent: '#2680FF',
  divider: '#E5EBF5',
  sparkleBg: '#E6EEFF',
  sparkleIcon: '#1E6FEA',
  pillBorder: '#D7E1F5',
  disabled: '#B8C7E2',
};

const DARK_PALETTE = {
  // 移除自定义的 background，使用 ScreenWrapper 的统一背景
  card: '#151B2C',
  border: '#2B3550',
  text: '#F6F7FF',
  secondary: '#A8B2CE',
  tertiary: '#6C7698',
  accent: '#3B82F6',
  divider: '#1E2538',
  sparkleBg: 'rgba(59, 130, 246, 0.2)',
  sparkleIcon: '#9CC4FF',
  pillBorder: '#2E3852',
  disabled: '#516089',
};

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
  const [activeStyleId, setActiveStyleId] = useState<string | null>(null);

  // 从 Store 获取当前任务和操作方法
  const currentTask = useCreateStore(state => state.currentTask);
  const createTask = useCreateStore(state => state.createTask);
  const selectImage = useCreateStore(state => state.selectImage);
  const generateModel = useCreateStore(state => state.generateModel);
  const cancelTask = useCreateStore(state => state.cancelTask);
  const reset = useCreateStore(state => state.reset);

  // 动态颜色
  const palette = useMemo(() => (isDark ? DARK_PALETTE : LIGHT_PALETTE), [isDark]);
  const textColor = palette.text;
  const secondaryTextColor = palette.secondary;
  const tertiaryTextColor = palette.tertiary;

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
      setActiveStyleId(null);
    } catch (error) {
      logger.error('创建任务失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    if (activeStyleId) {
      setActiveStyleId(null);
    }
  };

  const handleSelectStyle = (styleId: string, value: string) => {
    setPrompt(value);
    setActiveStyleId(styleId);
  };

  // 处理图片选择
  const handleSelectImage = async (imageId: string) => {
    if (!currentTask) return;
    await selectImage(currentTask.id, imageId);
  };

  // 处理生成3D模型
  const handleGenerateModel = async () => {
    if (!currentTask) {
      logger.warn('[Create] handleGenerateModel: currentTask 为空');
      return;
    }

    try {
      logger.info('[Create] 用户点击生成3D模型按钮:', {
        taskId: currentTask.id,
        selectedImageId: currentTask.selectedImageId,
        selectedImageIndex: currentTask.selectedImageIndex,
      });

      // 调用 Store 方法生成3D模型
      await generateModel(currentTask.id);

      logger.info('[Create] 生成3D模型请求已发送');
    } catch (error) {
      logger.error('[Create] 生成3D模型失败:', error);

      // TODO: 可以在这里添加用户友好的错误提示
      // 例如使用 Alert 或 Toast 组件
    }
  };

  // 处理取消任务
  const handleCancel = () => {
    if (!currentTask) return;
    cancelTask(currentTask.id);
  };

  // 处理查看3D模型
  const handleView3D = () => {
    if (!currentTask?.modelUrl || !currentTask?.modelId) {
      logger.warn('[Create] handleView3D: modelUrl 或 modelId 为空', {
        hasModelUrl: !!currentTask?.modelUrl,
        hasModelId: !!currentTask?.modelId,
      });
      return;
    }

    logger.info('[Create] 导航到 3D 模型查看器:', {
      modelId: currentTask.modelId,
      modelUrl: currentTask.modelUrl,
    });

    // 导航到3D查看器页面，传递 modelUrl 作为查询参数
    // 这样可以直接预览，不需要从 API 获取模型详情
    const encodedUrl = encodeURIComponent(currentTask.modelUrl);
    router.push(`/model-viewer/${currentTask.modelId}?modelUrl=${encodedUrl}`);
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
        <View style={styles.creatorContainer}>
          <View style={[styles.pageHeader, { borderBottomColor: palette.divider }]}>
            <View style={styles.pageLogo}>
              <LinearGradient
                colors={[palette.accent, isDark ? '#3B68FF' : '#5A8BFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pageLogoGradient}
              >
                <IconSymbol name="wand.and.stars" size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.pageLabel, { color: palette.accent }]}>AI 创作</Text>
            </View>
            <Text style={[styles.pageTitle, { color: textColor }]}>AI 创作工作室</Text>
            <Text style={[styles.pageSubtitle, { color: secondaryTextColor }]}>
              描述灵感，我们帮你生成精致的 3D 模型
            </Text>
          </View>

          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: contentPaddingBottom + Spacing.xxl },
            ]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          >
            <View
              style={[
                styles.promptCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#0B1A3A',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: isDark ? 0.25 : 0.08,
                      shadowRadius: 16,
                    },
                    android: {
                      elevation: 3,
                    },
                  }),
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: textColor,
                  },
                ]}
                placeholder="描述你想要的 3D 模型细节..."
                placeholderTextColor={tertiaryTextColor}
                value={prompt}
                onChangeText={handlePromptChange}
                multiline
                maxLength={500}
                returnKeyType="default"
                blurOnSubmit
              />
              <TouchableOpacity
                style={[
                  styles.sparkleButton,
                  {
                    backgroundColor: palette.sparkleBg,
                    opacity: isButtonActive ? 1 : 0.65,
                  },
                ]}
                onPress={handleSubmit}
                disabled={!isButtonActive}
                activeOpacity={0.8}
              >
                <IconSymbol name="sparkles" size={22} color={palette.sparkleIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.quickStylesSection}>
              <View style={styles.quickStylesHeader}>
                <View
                  style={[
                    styles.quickStylesIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(38, 128, 255, 0.15)'
                        : 'rgba(38, 128, 255, 0.1)',
                    },
                  ]}
                >
                  <IconSymbol name="triangle.fill" size={12} color={palette.accent} />
                </View>
                <Text style={[styles.quickStylesTitle, { color: textColor }]}>快速灵感</Text>
              </View>

              <View style={styles.quickStylesGrid}>
                {QUICK_STYLES.map(style => {
                  const isActive = activeStyleId === style.id;
                  return (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.quickStylePill,
                        {
                          borderColor: isActive ? palette.accent : palette.pillBorder,
                          backgroundColor: isActive ? 'rgba(38, 128, 255, 0.06)' : palette.card,
                        },
                      ]}
                      onPress={() => handleSelectStyle(style.id, style.prompt)}
                      activeOpacity={0.85}
                    >
                      <IconSymbol
                        name={style.icon}
                        size={16}
                        color={isActive ? palette.accent : secondaryTextColor}
                      />
                      <Text
                        style={[
                          styles.quickStyleText,
                          { color: isActive ? palette.accent : secondaryTextColor },
                        ]}
                      >
                        {style.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.tipText, { color: tertiaryTextColor }]}>
                小提示：点击标签即可自动填入示例描述
              </Text>
            </View>
            <View style={[styles.actionSection, { paddingBottom: Spacing.lg }]}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: isButtonActive ? palette.accent : palette.disabled,
                    ...Platform.select({
                      ios: {
                        shadowColor: palette.accent,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: isButtonActive ? 0.3 : 0,
                        shadowRadius: 20,
                      },
                      android: {
                        elevation: isButtonActive ? 6 : 0,
                      },
                    }),
                  },
                ]}
                onPress={handleSubmit}
                disabled={!isButtonActive}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? '生成中…' : '生成图片'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
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

  return (
    <AuthGuard>
      <ScreenWrapper edges={['top']} style={{ flex: 1 }}>
        {renderContent()}
      </ScreenWrapper>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  creatorContainer: {
    flex: 1,
  },
  pageHeader: {
    paddingTop: 0, // 移除顶部 padding，由 ScreenWrapper 处理
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  pageLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pageLogoGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md, // 减小顶部间距，从 20 改为 12
    gap: Spacing.xl,
  },
  promptCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: Spacing.lg,
    minHeight: 160,
  },
  input: {
    fontSize: FontSize.md,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sparkleButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStylesSection: {
    gap: Spacing.md,
  },
  quickStylesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickStylesIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStylesTitle: {
    fontSize: 16,
    fontWeight: FontWeight.semibold,
  },
  quickStylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStylePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 8,
  },
  quickStyleText: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
  },
  tipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  actionSection: {
    paddingHorizontal: Spacing.lg,
  },
  primaryButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: FontWeight.semibold,
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
