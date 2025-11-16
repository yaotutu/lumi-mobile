import { StyleSheet, View, Image, TouchableOpacity, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/theme';
import { formatLikes } from '@/constants/mock-data';

interface ModelCardProps {
  title: string;
  creator: string;
  imageUrl: string;
  likes: number;
}

export function ModelCard({ title, creator, imageUrl, likes }: ModelCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


  const cardContent = (
    <>
      {/* 标题 */}
      <Text
        style={[
          styles.title,
          { color: isDark ? Colors.dark.text : Colors.light.text }
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* 创作者 */}
      <Text
        style={[
          styles.creator,
          { color: isDark ? '#0A84FF' : '#007AFF' }
        ]}
        numberOfLines={1}
      >
        by {creator}
      </Text>

      {/* 底部操作栏 */}
      <View style={styles.footer}>
        {/* 点赞 */}
        <View style={styles.likes}>
          <Ionicons
            name="heart-outline"
            size={20}
            color={isDark ? '#FF453A' : '#FF3B30'}
          />
          <Text
            style={[
              styles.likesText,
              { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
            ]}
          >
            {formatLikes(likes)}
          </Text>
        </View>

        {/* 收藏按钮 - iOS 文字样式,纯黑配色 */}
        <TouchableOpacity
          style={styles.bookmarkButton}
          activeOpacity={0.5}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="bookmark-outline"
            size={16}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
          <Text
            style={[
              styles.bookmarkText,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}
          >
            收藏
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
      },
      Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },      // 4 → 2
          shadowOpacity: isDark ? 0.3 : 0.08,          // 0.5/0.15 → 0.3/0.08
          shadowRadius: 8,                             // 12 → 8
        },
        android: {
          elevation: 3,                                // 6 → 3
        },
      }),
      {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: isDark ? Colors.dark.border : Colors.light.border,
      },
    ]}>
      {/* 图片 */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* iOS 使用毛玻璃内容区 */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={isDark ? 40 : 60}                 // 50/70 → 40/60
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.blurContent,
            {
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              borderTopWidth: StyleSheet.hairlineWidth,
            }
          ]}
        >
          {cardContent}
        </BlurView>
      ) : (
        /* Android/Web 使用普通背景 */
        <View style={[
          styles.content,
          {
            backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
          }
        ]}>
          {cardContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,      // 12 → 16px
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5EA',
  },
  blurContent: {
    padding: Spacing.sm + Spacing.xs,   // 12px
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.sm + Spacing.xs,   // 12px
  },
  title: {
    fontSize: 15,                        // 16 → 15px
    fontWeight: FontWeight.bold,         // semibold → bold
    marginBottom: Spacing.xs,            // 6 → 4px
    lineHeight: 20,
  },
  creator: {
    fontSize: 13,                        // 14 → 13px
    fontWeight: FontWeight.regular,
    marginBottom: Spacing.md,            // 16 → 12px
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,                 // 6px
  },
  likesText: {
    fontSize: 11,                        // 12 → 11px
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  bookmarkText: {
    fontSize: 13,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
});
