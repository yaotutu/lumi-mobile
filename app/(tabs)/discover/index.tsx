import { useEffect } from "react";
import {
	ActivityIndicator,
	Platform,
	RefreshControl,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SearchBar } from "@/components/search-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ModelCard } from "@/components/model-card";
import {
	useGalleryStore,
	useGalleryModels,
	useGalleryLoading,
	useGalleryRefreshing,
	useGalleryError,
} from "@/stores";

export default function DiscoverScreen() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	// 从 Gallery Store 获取状态和方法
	const models = useGalleryModels();
	const loading = useGalleryLoading();
	const refreshing = useGalleryRefreshing();
	const error = useGalleryError();
	const { fetchModels, refreshModels, clearError } = useGalleryStore();

	// 组件挂载时加载数据
	useEffect(() => {
		fetchModels();
	}, [fetchModels]);

	// 下拉刷新
	const handleRefresh = () => {
		refreshModels();
	};

	// 重新加载
	const handleRetry = () => {
		clearError();
		fetchModels();
	};

	// 将模型数组分成两列
	const leftColumn = models?.filter((_, index) => index % 2 === 0) || [];
	const rightColumn = models?.filter((_, index) => index % 2 === 1) || [];

	return (
		<ThemedView style={styles.container}>
			{/* 状态栏 */}
			<StatusBar
				barStyle={isDark ? "light-content" : "dark-content"}
				backgroundColor={
					isDark ? Colors.dark.background : Colors.light.background
				}
			/>

			{/* 顶部安全区域 - 使用背景色 */}
			<View
				style={[
					styles.safeArea,
					{
						backgroundColor: isDark
							? Colors.dark.background
							: Colors.light.background,
					},
				]}
			/>

			{/* 搜索栏 */}
			<SearchBar placeholder="Search for models..." />

			{/* 加载状态 */}
			{loading && !refreshing && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator
						size="large"
						color={isDark ? Colors.dark.tint : Colors.light.tint}
					/>
					<ThemedText style={styles.loadingText}>加载中...</ThemedText>
				</View>
			)}

			{/* 错误状态 */}
			{error && !loading && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorIcon}>⚠️</Text>
					<ThemedText style={styles.errorText}>{error}</ThemedText>
					<TouchableOpacity
						style={[
							styles.retryButton,
							{
								backgroundColor: isDark
									? "rgba(74, 144, 226, 0.2)"
									: "rgba(0, 122, 255, 0.1)",
								borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
							},
						]}
						onPress={handleRetry}
					>
						<Text
							style={[
								styles.retryButtonText,
								{ color: isDark ? Colors.dark.tint : Colors.light.tint },
							]}
						>
							重新加载
						</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* 模型网格 */}
			{!loading && !error && (
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="handled"
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={isDark ? Colors.dark.tint : Colors.light.tint}
						/>
					}
				>
					{models.length === 0 ? (
						<View style={styles.emptyContainer}>
							<ThemedText style={styles.emptyText}>暂无模型</ThemedText>
						</View>
					) : (
						<View style={styles.grid}>
							{/* 左列 */}
							<View style={styles.column}>
								{leftColumn.map((model) => (
									<ModelCard
										key={model.id}
										title={model.name}
										creator={model.user?.name || "匿名用户"}
										imageUrl={model.previewImageUrl}
										likes={model.likeCount}
									/>
								))}
							</View>

							{/* 右列 */}
							<View style={styles.column}>
								{rightColumn.map((model) => (
									<ModelCard
										key={model.id}
										title={model.name}
										creator={model.user?.name || "匿名用户"}
										imageUrl={model.previewImageUrl}
										likes={model.likeCount}
									/>
								))}
							</View>
						</View>
					)}
				</ScrollView>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		paddingTop: Platform.select({
			ios: 44,
			android: StatusBar.currentHeight || 0,
			default: 0,
		}),
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: Platform.select({
			ios: 90, // 83 tabBar + 7 spacing
			android: 85, // 75 tabBar + 10 spacing
			default: 85,
		}),
	},
	grid: {
		flexDirection: "row",
		paddingHorizontal: Spacing.lg,
		gap: Spacing.md,
	},
	column: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.xxxl,
	},
	loadingText: {
		marginTop: Spacing.lg,
		opacity: 0.6,
	},
	errorContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.xxxl,
	},
	errorIcon: {
		fontSize: 48,
		marginBottom: Spacing.lg,
	},
	errorText: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: Spacing.xl,
		opacity: 0.7,
		lineHeight: 22,
	},
	retryButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 12,
		borderWidth: 1,
	},
	retryButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	emptyContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Spacing.xxxl * 2,
	},
	emptyText: {
		opacity: 0.5,
	},
});
