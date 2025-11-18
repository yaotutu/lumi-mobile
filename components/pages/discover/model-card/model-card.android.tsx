import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { formatLikes } from "@/constants/mock-data";
import { BorderRadius, Colors, FontWeight, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ModelCardProps } from './types';

export function ModelCard({ title, creator, imageUrl, likes }: ModelCardProps) {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const cardContent = (
		<>
			{/* 标题 */}
			<Text
				style={[
					styles.title,
					{ color: isDark ? Colors.dark.text : Colors.light.text },
				]}
				numberOfLines={1}
			>
				{title}
			</Text>

			{/* 创作者 */}
			<Text
				style={[styles.creator, { color: isDark ? "#4285F4" : "#1976D2" }]}
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
						color={isDark ? "#FF6B6B" : "#F44336"}
					/>
					<Text
						style={[
							styles.likesText,
							{
								color: isDark
									? Colors.dark.secondaryText
									: Colors.light.secondaryText,
							},
						]}
					>
						{formatLikes(likes)}
					</Text>
				</View>

				{/* 收藏按钮 - Android Material风格 */}
				<TouchableOpacity
					style={[
						styles.bookmarkButton,
						{
							backgroundColor: isDark
								? "rgba(66, 133, 244, 0.12)"
								: "rgba(25, 118, 210, 0.08)",
						}
					]}
					activeOpacity={0.7}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<Ionicons
						name="bookmark-outline"
						size={16}
						color={isDark ? "#4285F4" : "#1976D2"}
					/>
					<Text
						style={[
							styles.bookmarkText,
							{ color: isDark ? "#4285F4" : "#1976D2" },
						]}
					>
						收藏
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);

	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: isDark
						? Colors.dark.cardBackground
						: Colors.light.cardBackground,
					// Material Design Elevation
					elevation: 2,
					// Material阴影色
					shadowColor: isDark ? "#000" : "#1976D2",
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: isDark ? 0.3 : 0.1,
					shadowRadius: 4,
				},
			]}
		>
			{/* 图片 */}
			<Image
				source={{ uri: imageUrl }}
				style={styles.image}
				resizeMode="cover"
			/>

			{/* Android Material Design内容区 */}
			<View
				style={[
					styles.content,
					{
						backgroundColor: isDark
							? Colors.dark.cardBackground
							: Colors.light.cardBackground,
						borderTopWidth: 1,
						borderTopColor: isDark
							? "rgba(255, 255, 255, 0.12)"
							: "rgba(0, 0, 0, 0.08)",
					},
				]}
			>
				{cardContent}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: BorderRadius.md, // Material Design 适中圆角
		overflow: "hidden",
		marginBottom: Spacing.xl,
		// Material Design特征：更紧凑的布局
		marginHorizontal: Spacing.sm,
	},
	image: {
		width: "100%",
		height: 180,
		backgroundColor: "#E5E5EA",
	},
	content: {
		padding: Spacing.md, // Material Design: 稍大的内边距
	},
	title: {
		fontSize: 16, // Material Design: 标题稍大
		fontWeight: FontWeight.medium, // Material用medium而非bold
		marginBottom: Spacing.xs,
		lineHeight: 22,
		// Material字体样式
		fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'system',
	},
	creator: {
		fontSize: 14,
		fontWeight: FontWeight.regular,
		marginBottom: Spacing.lg, // Material: 更大的间距
		lineHeight: 20,
		// Material字体样式
		fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'system',
	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	likes: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs + 2,
	},
	likesText: {
		fontSize: 12, // Material: 稍大的辅助文字
		fontWeight: FontWeight.regular,
		lineHeight: 16,
	},
	bookmarkButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 6, // Material: 更大的触摸区域
		borderRadius: BorderRadius.sm, // Material: 小圆角按钮
		// Material Design状态层
		borderWidth: 1,
		borderColor: 'transparent',
	},
	bookmarkText: {
		fontSize: 13,
		fontWeight: FontWeight.medium,
		lineHeight: 18,
		// Material字体样式
		fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'system',
	},
});