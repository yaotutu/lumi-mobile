/**
 * 打印页面
 * 功能：提供 3D 模型打印相关功能
 */

import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { AuthGuard } from '@/components/auth';
import { SimpleTabHeader } from '@/components/layout/simple-tab-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * 打印页面主组件
 * 当前为空白页面,等待后续功能开发
 */
export default function PrinterScreen() {
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? Colors.dark.background : Colors.light.background;

  return (
    <AuthGuard>
      <ScreenWrapper edges={['top']}>
        <SimpleTabHeader title="3D 打印" />
        {/* 页面内容区域 */}
        <View style={[styles.content, { backgroundColor: background }]}>
          <ThemedText style={styles.placeholder}>功能开发中...</ThemedText>
        </View>
      </ScreenWrapper>
    </AuthGuard>
  );
}

/**
 * 样式定义
 */
const styles = StyleSheet.create({
  // 内容区域样式
  content: {
    flex: 1, // 占满剩余空间
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
  },
  // 占位文字样式
  placeholder: {
    fontSize: 16, // 字号
    opacity: 0.5, // 半透明效果
  },
});
