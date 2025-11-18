import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GenerationButtonProps {
	onPress: () => void;
	disabled?: boolean;
}

export function GenerationButton({
	onPress,
	disabled = false,
}: GenerationButtonProps) {
	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[styles.button, disabled && styles.buttonDisabled]}
				onPress={onPress}
				disabled={disabled}
			>
				<Text style={styles.buttonText}>Generate 3D Model</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	button: {
		backgroundColor: "#007AFF",
		borderRadius: 16,
		paddingVertical: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 17,
		fontWeight: "600",
		letterSpacing: -0.4,
	},
});
