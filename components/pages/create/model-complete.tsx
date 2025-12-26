import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { GenerationTask } from '@/stores/create/types';

interface ModelCompleteProps {
  task: GenerationTask;
  onView3D: () => void;
  onCreateNew: () => void;
  paddingBottom: number;
  isDark: boolean;
}

/**
 * 生成完成组件
 * 显示生成成功信息和操作按钮
 */
export function ModelComplete({
  task,
  onView3D,
  onCreateNew,
  paddingBottom,
  isDark,
}: ModelCompleteProps) {
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#98989D' : '#86868B';
  const cardBackground = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#38383A' : '#D1D1D6';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 成功图标 */}
        <View style={styles.successIconContainer}>
          <View style={[styles.successIconBg, { backgroundColor: '#34C759' }]}>
            <IconSymbol name="checkmark" size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.successTitle, { color: textColor }]}>3D 模型生成成功！</Text>
          <Text style={[styles.successSubtitle, { color: secondaryTextColor }]}>
            您的 3D 模型已准备就绪
          </Text>
        </View>

        {/* 3D 预览卡片 */}
        <View style={[styles.previewCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={[styles.previewPlaceholder, { backgroundColor: borderColor }]}>
            <IconSymbol name="cube.fill" size={80} color="#007AFF" />
            <Text style={[styles.previewHint, { color: secondaryTextColor }]}>
              点击下方按钮查看完整 3D 模型
            </Text>
          </View>
        </View>

        {/* 模型信息 */}
        <View style={[styles.infoCard, { backgroundColor: cardBackground, borderColor }]}>
          <Text style={[styles.infoTitle, { color: textColor }]}>模型信息</Text>
          <View style={styles.infoRow}>
            <IconSymbol name="doc.fill" size={20} color={secondaryTextColor} />
            <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>格式：</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>GLB</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="cube.fill" size={20} color={secondaryTextColor} />
            <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>类型：</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>3D 模型</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="clock.fill" size={20} color={secondaryTextColor} />
            <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>创建时间：</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {new Date(task.updatedAt).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: '#007AFF' }]}
          onPress={onView3D}
          activeOpacity={0.7}
        >
          <IconSymbol name="eye.fill" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>查看 3D 模型</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: cardBackground, borderColor }]}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.down.circle.fill" size={20} color="#007AFF" />
            <Text style={[styles.secondaryButtonText, { color: textColor }]}>下载</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: cardBackground, borderColor }]}
            activeOpacity={0.7}
          >
            <IconSymbol name="printer.fill" size={20} color="#007AFF" />
            <Text style={[styles.secondaryButtonText, { color: textColor }]}>一键打印</Text>
          </TouchableOpacity>
        </View>

        {/* 继续创作按钮 */}
        <TouchableOpacity
          style={[styles.createNewButton, { borderColor }]}
          onPress={onCreateNew}
          activeOpacity={0.7}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="#007AFF" />
          <Text style={[styles.createNewButtonText, { color: '#007AFF' }]}>继续创作新的</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  successIconContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewPlaceholder: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewHint: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    marginBottom: 20,
  },
  createNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
