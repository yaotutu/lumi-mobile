import { LinearGradient } from 'expo-linear-gradient';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';

// 示例提示词配置
const EXAMPLE_PROMPTS = [
  {
    icon: 'pawprint.fill', // 图标名称
    text: '低多边形狐狸', // 提示词文本
    fullPrompt: '一只坐在石头上的低多边形狐狸', // 完整提示词
    gradient: ['#FF6B6B', '#FF8E53'], // 渐变色
  },
  {
    icon: 'building.2.fill', // 图标名称
    text: '赛博朋克城市', // 提示词文本
    fullPrompt: '赛博朋克风格的未来城市建筑', // 完整提示词
    gradient: ['#4FACFE', '#00F2FE'], // 渐变色
  },
  {
    icon: 'cpu.fill', // 图标名称
    text: '可爱机器人', // 提示词文本
    fullPrompt: '卡通风格的可爱机器人', // 完整提示词
    gradient: ['#43E97B', '#38F9D7'], // 渐变色
  },
];

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void; // 提示词选择回调
  cardBackground: string; // 卡片背景色
  borderColor: string; // 边框颜色
  textColor: string; // 文字颜色
}

/**
 * 示例提示词组件
 * 显示预设的创作提示词供用户快速选择
 */
export function ExamplePrompts({
  onPromptSelect,
  cardBackground,
  borderColor,
  textColor,
}: ExamplePromptsProps) {
  return (
    <View style={styles.container}>
      {/* 标题 */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>试试这些创意</Text>

      {/* 示例卡片列表（水平滚动） */}
      <FlatList
        data={EXAMPLE_PROMPTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.text}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => onPromptSelect(item.fullPrompt)}
            activeOpacity={0.8}
          >
            <View style={[styles.card, { backgroundColor: cardBackground }]}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={item.gradient}
                  style={styles.iconBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <IconSymbol name={item.icon} size={18} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={[styles.cardText, { color: textColor }]} numberOfLines={1}>
                {item.text}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // 主容器样式
  container: {
    marginBottom: 0, // 由父容器控制间距
  },

  // 标题样式
  sectionTitle: {
    fontSize: FontSize.sm, // 使用主题字号
    fontWeight: FontWeight.semibold, // 使用主题字重
    marginBottom: Spacing.md, // 使用主题间距
    opacity: 0.7, // 透明度
  },

  listContent: {
    gap: Spacing.sm,
  },

  cardWrapper: {
    width: 110,
  },

  // 卡片样式
  card: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 图标背景样式
  iconContainer: {
    alignItems: 'center', // 水平居中
    marginBottom: Spacing.sm, // 使用主题间距
  },
  iconBackground: {
    width: 40, // 宽度
    height: 40, // 高度
    borderRadius: 20, // 圆角（圆形）
    alignItems: 'center', // 水平居中
    justifyContent: 'center', // 垂直居中
  },

  // 卡片文字样式
  cardText: {
    fontSize: FontSize.xs, // 使用主题字号
    fontWeight: FontWeight.medium, // 使用主题字重
    lineHeight: 16, // 行高
    textAlign: 'center', // 居中对齐
  },
});
