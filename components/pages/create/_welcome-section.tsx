import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, Text, View } from "react-native";

interface WelcomeSectionProps {
	isDark: boolean;
	textColor: string;
	secondaryTextColor: string;
}

export function WelcomeSection({
	isDark,
	textColor,
	secondaryTextColor,
}: WelcomeSectionProps) {
	return (
		<View style={styles.container}>
			{/* 渐变色装饰圆形 */}
			<View style={styles.decorationContainer}>
				<LinearGradient
					colors={isDark ? ["#4A90E2", "#9B59B6"] : ["#667EEA", "#764BA2"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.gradientCircle}
				/>
			</View>

			{/* 欢迎文字 */}
			<View style={styles.welcomeTextContainer}>
				<Text style={[styles.welcomeTitle, { color: textColor }]}>
					开始创作你的3D模型
				</Text>
				<Text style={[styles.welcomeSubtitle, { color: secondaryTextColor }]}>
					描述你的创意,AI为你实现
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 32,
	},
	decorationContainer: {
		alignItems: "center",
		marginBottom: 32,
	},
	gradientCircle: {
		width: 120,
		height: 120,
		borderRadius: 60,
		...Platform.select({
			ios: {
				shadowColor: "#667EEA",
				shadowOffset: { width: 0, height: 8 },
				shadowOpacity: 0.3,
				shadowRadius: 16,
			},
			android: {
				elevation: 8,
			},
		}),
	},
	welcomeTextContainer: {
		alignItems: "center",
		marginBottom: 32,
	},
	welcomeTitle: {
		fontSize: 24,
		fontWeight: "700",
		letterSpacing: -0.5,
		marginBottom: 8,
		textAlign: "center",
	},
	welcomeSubtitle: {
		fontSize: 16,
		lineHeight: 22,
		textAlign: "center",
	},
});
