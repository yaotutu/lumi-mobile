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

        {/* 收藏按钮 */}
        <TouchableOpacity
          style={[
            styles.bookmarkButton,
            { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="bookmark-outline"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={[
      styles.card,
      Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      })
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
          intensity={isDark ? 50 : 70}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.blurContent,
            {
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
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
    borderRadius: BorderRadius.md,
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
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs + 2, // 6px
    lineHeight: 22,
  },
  creator: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  likesText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm + 2, // 10px
    alignItems: 'center',
    justifyContent: 'center',
  },
});
