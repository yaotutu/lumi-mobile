import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { GenerationTask } from '@/stores/create/types';

interface ImageSelectorProps {
  task: GenerationTask;
  onSelectImage: (imageId: string) => void;
  onGenerateModel: () => void;
  onCancel: () => void;
  paddingBottom: number;
  isDark: boolean;
}

/**
 * 图片选择器组件
 * 显示生成的4张图片，用户选择一张作为3D模型参考
 */
export function ImageSelector({
  task,
  onSelectImage,
  onGenerateModel,
  onCancel,
  paddingBottom,
  isDark,
}: ImageSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(task.selectedImageId || null);

  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#98989D' : '#86868B';
  const cardBackground = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#38383A' : '#D1D1D6';

  const handleSelectImage = (imageId: string) => {
    setSelectedId(imageId);
    onSelectImage(imageId);
  };

  const handleGenerate = () => {
    if (!selectedId) return;
    onGenerateModel();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 原始描述 */}
        <View style={[styles.promptCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.promptHeader}>
            <Text style={[styles.promptLabel, { color: secondaryTextColor }]}>原始描述</Text>
            <TouchableOpacity style={styles.regenerateButton} activeOpacity={0.7}>
              <IconSymbol name="arrow.trianglehead.2.clockwise" size={16} color="#007AFF" />
              <Text style={[styles.regenerateText, { color: '#007AFF' }]}>重新生成</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.promptText, { color: textColor }]}>{task.prompt}</Text>
        </View>

        {/* 选择提示 */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>选择一个作为 3D 模型参考</Text>

        {/* 图片网格 */}
        <View style={styles.grid}>
          {task.images?.map((image, index) => (
            <TouchableOpacity
              key={image.id}
              style={[
                styles.imageCard,
                selectedId === image.id && styles.imageCardSelected,
                { borderColor: selectedId === image.id ? '#007AFF' : borderColor },
              ]}
              onPress={() => handleSelectImage(image.id)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: image.thumbnail }} style={styles.image} resizeMode="cover" />
              {selectedId === image.id && (
                <View style={styles.selectedBadge}>
                  <IconSymbol name="checkmark.circle.fill" size={28} color="#007AFF" />
                </View>
              )}
              <View style={styles.imageNumber}>
                <Text style={styles.imageNumberText}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 生成按钮 */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            !selectedId && styles.generateButtonDisabled,
            { backgroundColor: selectedId ? '#007AFF' : borderColor },
          ]}
          onPress={handleGenerate}
          disabled={!selectedId}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.generateButtonText, { color: selectedId ? '#FFFFFF' : textColor }]}
          >
            生成 3D 模型
          </Text>
        </TouchableOpacity>

        {/* 取消按钮 */}
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor }]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelButtonText, { color: '#FF3B30' }]}>取消</Text>
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
  promptCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regenerateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  promptText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  imageCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  imageCardSelected: {
    borderColor: '#007AFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  imageNumber: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  generateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
