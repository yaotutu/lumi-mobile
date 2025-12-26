import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';
import { ExamplePrompts } from '@/components/pages/create/example-prompts';
import { GenerationButton } from '@/components/pages/create/generation-button';
import { PromptInput } from '@/components/pages/create/prompt-input';
import { StyleSelector } from '@/components/pages/create/style-selector';
import { WelcomeSection } from '@/components/pages/create/welcome-section';
import { useCreateStore } from '@/stores';

export default function CreateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { headerPaddingTop, contentPaddingBottom } = useSafeAreaSpacing();

  // 从 Create Store 获取状态和方法
  const {
    prompt,
    selectedStyle,
    showStyles,
    isGenerating,
    generationProgress,
    setPrompt,
    selectStyle,
    showStyleSelector,
    startGeneration,
  } = useCreateStore();

  const backgroundColor = isDark ? '#000000' : '#F5F5F7';
  const cardBackground = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#98989D' : '#86868B';
  const borderColor = isDark ? '#38383A' : '#D1D1D6';

  const handleGenerateStyles = () => {
    showStyleSelector();
  };

  const handleGenerate3DModel = async () => {
    try {
      await startGeneration();
      // 生成成功后的处理可以在这里添加
    } catch {
      // 错误处理已在 Store 中完成
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <Text style={[styles.title, { color: textColor }]}>AI Creation Studio</Text>
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !showStyles && [
            styles.scrollContentCentered,
            { paddingBottom: contentPaddingBottom + 30 },
          ],
        ]}
        showsVerticalScrollIndicator={false}
        bottomOffset={showStyles ? 100 : 0}
      >
        {/* Initial State - 渐变色装饰、欢迎文字、示例提示词 */}
        {!showStyles && (
          <View style={styles.inputSectionCenter}>
            <WelcomeSection
              isDark={isDark}
              textColor={textColor}
              secondaryTextColor={secondaryTextColor}
            />

            <ExamplePrompts
              onPromptSelect={setPrompt}
              cardBackground={cardBackground}
              borderColor={borderColor}
              textColor={textColor}
            />

            <PromptInput
              value={prompt}
              onChangeText={setPrompt}
              onSubmit={handleGenerateStyles}
              placeholder="描述你想要的3D模型..."
              cardBackground={cardBackground}
              borderColor={borderColor}
              textColor={textColor}
              secondaryTextColor={secondaryTextColor}
            />
          </View>
        )}

        {/* Style Selection - 只在生成后显示 */}
        {showStyles && (
          <StyleSelector
            selectedStyle={selectedStyle}
            onStyleSelect={selectStyle}
            textColor={textColor}
          />
        )}

        {/* Generate Button - 只在选择风格后显示 */}
        {showStyles && selectedStyle !== null && (
          <GenerationButton
            onPress={handleGenerate3DModel}
            disabled={isGenerating}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
          />
        )}
      </KeyboardAwareScrollView>

      {/* Prompt Input - 显示风格后固定在底部 */}
      {showStyles && (
        <View
          style={[
            styles.inputSectionBottom,
            { backgroundColor, paddingBottom: contentPaddingBottom },
          ]}
        >
          <PromptInput
            value={prompt}
            onChangeText={setPrompt}
            onSubmit={handleGenerateStyles}
            placeholder="A low-poly fox sitting on a rock..."
            cardBackground={cardBackground}
            borderColor={borderColor}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    // paddingBottom 通过 useSafeAreaSpacing 动态设置
  },
  header: {
    // paddingTop 通过 useSafeAreaSpacing 动态设置
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  inputSectionCenter: {
    paddingHorizontal: 20,
  },
  inputSectionBottom: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    // paddingBottom 通过 useSafeAreaSpacing 动态设置
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});
