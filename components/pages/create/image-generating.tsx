import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { GenerationTask } from '@/stores/create/types';

interface ImageGeneratingProps {
  task: GenerationTask;
  onCancel: () => void;
  paddingBottom: number;
  isDark: boolean;
}

/**
 * 图片生成中组件
 * 显示生成进度和占位符
 */
export function ImageGenerating({
  task,
  onCancel,
  paddingBottom,
  isDark,
}: ImageGeneratingProps) {
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#98989D' : '#86868B';
  const cardBackground = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#38383A' : '#D1D1D6';

  const progress = task.imageProgress || 0;

  return (
    <View style={[styles.container, { paddingBottom }]}>
      {/* 原始描述 */}
      <View style={[styles.promptCard, { backgroundColor: cardBackground, borderColor }]}>
        <Text style={[styles.promptLabel, { color: secondaryTextColor }]}>原始描述</Text>
        <Text style={[styles.promptText, { color: textColor }]}>{task.prompt}</Text>
      </View>

      {/* 生成状态 */}
      <View style={styles.content}>
        <Text style={[styles.statusTitle, { color: textColor }]}>正在生成预览图...</Text>

        {/* 图片占位符网格 */}
        <View style={styles.grid}>
          {[0, 1, 2, 3].map(index => (
            <View
              key={index}
              style={[
                styles.placeholder,
                { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA', borderColor },
              ]}
            >
              {/* 加载动画（简化版，实际应该用 Animated） */}
              {index === 0 && (
                <View style={styles.loadingIndicator}>
                  <IconSymbol name="arrow.trianglehead.2.clockwise" size={32} color="#007AFF" />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 进度条 */}
        <View style={[styles.progressContainer, { backgroundColor: borderColor }]}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: secondaryTextColor }]}>{progress}%</Text>

        {/* 提示信息 */}
        <View style={[styles.tipCard, { backgroundColor: cardBackground, borderColor }]}>
          <IconSymbol name="lightbulb.fill" size={20} color="#FFD60A" />
          <View style={styles.tipTextContainer}>
            <Text style={[styles.tipText, { color: textColor }]}>生成需要 2-3 分钟</Text>
            <Text style={[styles.tipSubText, { color: secondaryTextColor }]}>
              您可以先去逛逛其他页面
            </Text>
          </View>
        </View>

        {/* 取消按钮 */}
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor }]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelButtonText, { color: '#FF3B30' }]}>取消生成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  promptCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  promptLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  placeholderBox: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  tipText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  tipSubText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
