/**
 * 打印页面
 * 功能：提供 3D 模型打印相关功能
 */

import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenWrapper } from '@/components/screen-wrapper';

/**
 * 打印页面主组件
 * 当前为空白页面,等待后续功能开发
 */
export default function PrinterScreen() {
  return (
    <ScreenWrapper>
      {/* 页面标题 */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>3D 打印</ThemedText>
      </View>

      {/* 页面内容区域 */}
      <View style={styles.content}>
        <ThemedText style={styles.placeholder}>功能开发中...</ThemedText>
      </View>
    </ScreenWrapper>
  );
}

/**
 * 样式定义
 */
const styles = StyleSheet.create({
  // 头部样式
  header: {
    paddingTop: 20, // 顶部间距（安全区域由 ScreenWrapper 处理）
    paddingHorizontal: 20, // 水平内边距
    paddingBottom: 20, // 底部间距
  },
  // 标题样式
  title: {
    fontSize: 34, // 大标题字号
    fontWeight: 'bold', // 粗体
  },
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
