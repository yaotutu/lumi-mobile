import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { ExamplePrompts } from '@/components/pages/create/example-prompts';
import { WelcomeSection } from '@/components/pages/create/welcome-section';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { useCreateStore } from '@/stores';
import { logger } from '@/utils/logger';

/**
 * AI 创作首页
 * 用户输入提示词后，创建任务并导航到任务详情页
 */
export default function CreateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { contentPaddingBottom } = useSafeAreaSpacing();

  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTask = useCreateStore(state => state.createTask);

  const cardBackground = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#98989D' : '#86868B';
  const borderColor = isDark ? '#38383A' : '#D1D1D6';

  // 处理提交
  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      logger.info('创建生成任务:', prompt);

      // 创建任务
      const taskId = await createTask(prompt.trim());

      // 导航到任务详情页（在 tabs 内部）
      router.push(`/(tabs)/task/${taskId}`);

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

  return (
    <ScreenWrapper>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentPaddingBottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 欢迎区域 */}
        <WelcomeSection
          isDark={isDark}
          textColor={textColor}
          secondaryTextColor={secondaryTextColor}
        />

        {/* 示例提示词 */}
        <ExamplePrompts
          onPromptSelect={handleSelectExample}
          cardBackground={cardBackground}
          borderColor={borderColor}
          textColor={textColor}
        />

        {/* 输入区域 */}
        <View style={[styles.inputCard, { backgroundColor: cardBackground, borderColor }]}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="描述你想要的 3D 模型..."
            placeholderTextColor={secondaryTextColor}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            maxLength={500}
            returnKeyType="default"
            blurOnSubmit={false}
          />
          <View style={styles.inputFooter}>
            <Text style={[styles.charCount, { color: secondaryTextColor }]}>
              {prompt.length}/500
            </Text>
          </View>
        </View>

        {/* 生成按钮 */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            {
              backgroundColor: prompt.trim() && !isSubmitting ? '#007AFF' : borderColor,
            },
          ]}
          onPress={handleSubmit}
          disabled={!prompt.trim() || isSubmitting}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.generateButtonText,
              { color: prompt.trim() && !isSubmitting ? '#FFFFFF' : secondaryTextColor },
            ]}
          >
            {isSubmitting ? '创建中...' : '开始生成'}
          </Text>
        </TouchableOpacity>

        {/* 提示信息 */}
        <View style={styles.hintContainer}>
          <Text style={[styles.hintText, { color: secondaryTextColor }]}>
            💡 生成过程需要几分钟时间
          </Text>
          <Text style={[styles.hintText, { color: secondaryTextColor }]}>
            您可以在生成过程中离开页面
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  inputCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 24,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  charCount: {
    fontSize: 13,
  },
  generateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  hintContainer: {
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
