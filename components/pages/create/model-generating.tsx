import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { GenerationTask } from '@/stores/create/types';

interface ModelGeneratingProps {
  task: GenerationTask;
  onCancel: () => void;
  paddingBottom: number;
  isDark: boolean;
}

/**
 * 3D 模型生成中组件
 * 显示生成进度和选中的图片
 */
export function ModelGenerating({
  task,
  onCancel,
  paddingBottom,
  isDark,
}: ModelGeneratingProps) {
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#98989D' : '#86868B';
  const cardBackground = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#38383A' : '#D1D1D6';

  const progress = task.modelProgress || 0;

  // 获取选中的图片
  const selectedImage = task.images?.find(img => img.id === task.selectedImageId);

  // 估算剩余时间（简单计算）
  const estimatedMinutes = Math.max(1, Math.ceil((100 - progress) / 20));

  return (
    <View style={[styles.container, { paddingBottom }]}>
      {/* 选中的图片 */}
      {selectedImage && (
        <View style={styles.imageContainer}>
          <View style={[styles.imageCard, { backgroundColor: cardBackground, borderColor }]}>
            <Image source={{ uri: selectedImage.url }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageBadge}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
              <Text style={[styles.imageBadgeText, { color: textColor }]}>已选择</Text>
            </View>
          </View>
        </View>
      )}

      {/* 生成状态 */}
      <View style={styles.content}>
        <Text style={[styles.statusTitle, { color: textColor }]}>正在生成 3D 模型...</Text>

        {/* 3D 模型占位符 */}
        <View style={[styles.modelPlaceholder, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.loadingIndicator}>
            <IconSymbol name="cube.fill" size={64} color="#007AFF" />
            <Text style={[styles.loadingText, { color: textColor }]}>处理中</Text>
          </View>
        </View>

        {/* 进度条 */}
        <View style={[styles.progressContainer, { backgroundColor: borderColor }]}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: secondaryTextColor }]}>{progress}%</Text>

        {/* 预计时间 */}
        <View style={[styles.tipCard, { backgroundColor: cardBackground, borderColor }]}>
          <IconSymbol name="clock.fill" size={20} color="#007AFF" />
          <View style={styles.tipTextContainer}>
            <Text style={[styles.tipText, { color: textColor }]}>
              预计还需 {estimatedMinutes} 分钟
            </Text>
            <Text style={[styles.tipSubText, { color: secondaryTextColor }]}>
              您可以先去其他页面，完成后会通知您
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
  imageContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  imageCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  imageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  imageBadgeText: {
    fontSize: 14,
    fontWeight: '600',
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
  modelPlaceholder: {
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
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
