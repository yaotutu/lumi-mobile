import { StyleSheet, View, ScrollView, Platform, StatusBar } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';
import { SearchBar } from '@/components/search-bar';
import { ModelCard } from '@/components/model-card';
import { MOCK_MODELS } from '@/constants/mock-data';
import { ThemedView } from '@/components/themed-view';

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 将模型数组分成两列
  const leftColumn = MOCK_MODELS.filter((_, index) => index % 2 === 0);
  const rightColumn = MOCK_MODELS.filter((_, index) => index % 2 === 1);

  return (
    <ThemedView style={styles.container}>
      {/* 状态栏 */}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? Colors.dark.background : Colors.light.background}
      />

      {/* 顶部安全区域 */}
      <View style={[
        styles.safeArea,
        {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
        }
      ]} />

      {/* 搜索栏 */}
      <SearchBar placeholder="Search for models..." />

      {/* 模型网格 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {/* 左列 */}
          <View style={styles.column}>
            {leftColumn.map((model) => (
              <ModelCard
                key={model.id}
                title={model.title}
                creator={model.creator}
                imageUrl={model.imageUrl}
                likes={model.likes}
              />
            ))}
          </View>

          {/* 右列 */}
          <View style={styles.column}>
            {rightColumn.map((model) => (
              <ModelCard
                key={model.id}
                title={model.title}
                creator={model.creator}
                imageUrl={model.imageUrl}
                likes={model.likes}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    paddingTop: Platform.select({
      ios: 44, // iOS 状态栏高度
      android: StatusBar.currentHeight || 0,
      default: 0,
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
});
