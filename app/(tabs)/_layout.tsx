import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<Tabs
			initialRouteName="discover/index"
			screenOptions={{
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarActiveTintColor: isDark ? "#4A9EFF" : "#007AFF",
				tabBarInactiveTintColor: "#8E8E93",
				tabBarStyle: styles.tabBar,
				tabBarLabelStyle: styles.tabBarLabel,
				tabBarIconStyle: styles.tabBarIcon,
				tabBarBackground: () => (
					<BlurView
						intensity={100}
						tint={isDark ? "dark" : "light"}
						style={[
							styles.blurView,
							{
								borderTopColor: isDark
									? "rgba(255, 255, 255, 0.1)"
									: "rgba(0, 0, 0, 0.1)",
							},
						]}
					/>
				),
			}}
		>
			<Tabs.Screen
				name="discover/index"
				options={{
					title: "发现",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={24} name="safari" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="create/index"
				options={{
					title: "AI创作",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={24} name="sparkles" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "我的",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={24} name="person.crop.circle" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: "transparent",
		borderTopWidth: 0,
		position: "absolute",
		elevation: 0,
		...Platform.select({
			ios: {
				height: 83, // 49 content + 34 safe area
			},
			android: {
				height: 70,
			},
			default: {
				height: 70,
			},
		}),
	},
	blurView: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	tabBarLabel: {
		fontSize: 10,
		fontWeight: "500",
		marginTop: 4,
		marginBottom: Platform.OS === "ios" ? 0 : 8,
	},
	tabBarIcon: {
		marginTop: 8,
	},
});
