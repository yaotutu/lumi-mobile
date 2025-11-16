import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

// 示例提示词
const EXAMPLE_PROMPTS = [
  '一只坐在石头上的低多边形狐狸',
  '赛博朋克风格的未来城市建筑',
  '卡通风格的可爱机器人',
];

// 示例风格图片数据
const STYLE_IMAGES = [
  { id: 1, uri: 'https://via.placeholder.com/300x300/FF6B35/FFFFFF?text=Low-Poly' },
  { id: 2, uri: 'https://via.placeholder.com/300x300/004E89/FFFFFF?text=Realistic' },
  { id: 3, uri: 'https://via.placeholder.com/300x300/1AA7EC/FFFFFF?text=Cartoon' },
  { id: 4, uri: 'https://via.placeholder.com/300x300/A23B72/FFFFFF?text=Portrait' },
];

export default function CreateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [showStyles, setShowStyles] = useState(false);

  const backgroundColor = isDark ? '#000000' : '#F5F5F7';
  const cardBackground = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#98989D' : '#86868B';
  const borderColor = isDark ? '#38383A' : '#D1D1D6';

  const handleGenerateStyles = () => {
    if (prompt.trim()) {
      setShowStyles(true);
    }
  };

  const handleGenerate3DModel = () => {
    // 这里后续对接生成3D模型的逻辑
    console.log('Generate 3D Model with:', { prompt, selectedStyle });
  };

  const handleExamplePromptClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>AI Creation Studio</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !showStyles && styles.scrollContentCentered,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Initial State - 渐变色装饰、欢迎文字、示例提示词 */}
        {!showStyles && (
          <View style={styles.inputSectionCenter}>
            {/* 渐变色装饰圆形 */}
            <View style={styles.decorationContainer}>
              <LinearGradient
                colors={isDark ? ['#4A90E2', '#9B59B6'] : ['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCircle}
              />
            </View>

            {/* 欢迎文字 */}
            <View style={styles.welcomeTextContainer}>
              <Text style={[styles.welcomeTitle, { color: textColor }]}>
                开始创作你的3D模型
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: secondaryTextColor }]}>
                描述你的创意,AI为你实现
              </Text>
            </View>

            {/* 示例提示词卡片 */}
            <View style={styles.examplesContainer}>
              {EXAMPLE_PROMPTS.map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.exampleCard, { backgroundColor: cardBackground, borderColor }]}
                  onPress={() => handleExamplePromptClick(example)}
                >
                  <Text style={[styles.exampleText, { color: textColor }]} numberOfLines={2}>
                    {example}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 输入框 */}
            <View style={[styles.inputContainer, { backgroundColor: cardBackground, borderColor }]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="描述你想要的3D模型..."
                placeholderTextColor={secondaryTextColor}
                value={prompt}
                onChangeText={setPrompt}
                multiline
              />
              <TouchableOpacity
                style={styles.promptButton}
                onPress={handleGenerateStyles}
              >
                <IconSymbol name="sparkles" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Style Selection - 只在生成后显示 */}
        {showStyles && (
          <View style={styles.styleSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Choose a style</Text>
            <View style={styles.styleGrid}>
              {STYLE_IMAGES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleCard,
                    selectedStyle === style.id && styles.styleCardSelected,
                  ]}
                  onPress={() => setSelectedStyle(style.id)}
                >
                  <Image
                    source={{ uri: style.uri }}
                    style={styles.styleImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Generate Button - 只在选择风格后显示 */}
        {showStyles && selectedStyle !== null && (
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerate3DModel}
            >
              <Text style={styles.generateButtonText}>Generate 3D Model</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Prompt Input - 显示风格后固定在底部 */}
      {showStyles && (
        <View style={[styles.inputSectionBottom, { backgroundColor }]}>
          <View style={[styles.inputContainer, { backgroundColor: cardBackground, borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="A low-poly fox sitting on a rock..."
              placeholderTextColor={secondaryTextColor}
              value={prompt}
              onChangeText={setPrompt}
              multiline
            />
            <TouchableOpacity
              style={styles.promptButton}
              onPress={handleGenerateStyles}
            >
              <IconSymbol name="sparkles" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
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
    paddingBottom: Platform.select({
      ios: 150, // 给底部导航栏留出空间
      android: 120,
      default: 120,
    }),
  },
  header: {
    paddingTop: Platform.select({
      ios: 60,
      android: 40,
      default: 40,
    }),
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
  decorationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  gradientCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  examplesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  exampleCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: 'center',
  },
  exampleText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  inputSectionBottom: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.select({
      ios: 100, // Tab bar height + safe area
      android: 85,
      default: 85,
    }),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingRight: 12,
    maxHeight: 120,
  },
  promptButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  styleCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  styleCardSelected: {
    borderColor: '#007AFF',
  },
  styleImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1E',
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
});
