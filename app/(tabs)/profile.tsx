import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ProfileScreen() {
	return (
		<ThemedView style={styles.container}>
			<View style={styles.content}>
				<ThemedText type="title">我的</ThemedText>
				<ThemedText style={styles.subtitle}>此页面即将推出</ThemedText>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	subtitle: {
		marginTop: 8,
		opacity: 0.6,
	},
});
