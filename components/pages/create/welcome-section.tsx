import { StyleSheet, Text, View } from 'react-native';
import { Typography, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface WelcomeSectionProps {
  isDark: boolean;
  textColor: string;
  secondaryTextColor: string;
}

/**
 * 欢迎区域
 * 简洁的标题和副标题显示
 */
export function WelcomeSection({ isDark, textColor, secondaryTextColor }: WelcomeSectionProps) {
  return (
    <View style={styles.container}>
      {/* 主标题 */}
      <Text style={[styles.title, { color: textColor }]}>AI 创作</Text>

      {/* 副标题 */}
      <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
        用一句话,创造属于你的 3D 作品
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // 主容器样式
  container: {
    marginBottom: Spacing.xl, // 底部间距
  },

  // 主标题样式
  title: {
    ...Typography.title1, // 使用预定义的 title1 样式
    marginBottom: Spacing.sm, // 底部间距
  },

  // 副标题样式
  subtitle: {
    ...Typography.body, // 使用预定义的 body 样式
    lineHeight: 22, // 行高
    opacity: 0.8, // 透明度
  },
});
