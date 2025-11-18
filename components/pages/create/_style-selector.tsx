import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const STYLE_IMAGES = [
	{
		id: 1,
		uri: "https://via.placeholder.com/300x300/FF6B35/FFFFFF?text=Low-Poly",
	},
	{
		id: 2,
		uri: "https://via.placeholder.com/300x300/004E89/FFFFFF?text=Realistic",
	},
	{
		id: 3,
		uri: "https://via.placeholder.com/300x300/1AA7EC/FFFFFF?text=Cartoon",
	},
	{
		id: 4,
		uri: "https://via.placeholder.com/300x300/A23B72/FFFFFF?text=Portrait",
	},
];

interface StyleSelectorProps {
	selectedStyle: number | null;
	onStyleSelect: (styleId: number) => void;
	textColor: string;
}

export function StyleSelector({
	selectedStyle,
	onStyleSelect,
	textColor,
}: StyleSelectorProps) {
	return (
		<View style={styles.container}>
			<Text style={[styles.title, { color: textColor }]}>Choose a style</Text>
			<View style={styles.grid}>
				{STYLE_IMAGES.map((style) => (
					<TouchableOpacity
						key={style.id}
						style={[
							styles.styleCard,
							selectedStyle === style.id && styles.styleCardSelected,
						]}
						onPress={() => onStyleSelect(style.id)}
					>
						<Image
							source={{ uri: style.uri }}
							style={styles.styleImage}
							resizeMode="cover"
						/>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
		marginBottom: 32,
		marginTop: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 16,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 12,
	},
	styleCard: {
		width: "48%",
		aspectRatio: 1,
		borderRadius: 16,
		overflow: "hidden",
		borderWidth: 3,
		borderColor: "transparent",
	},
	styleCardSelected: {
		borderColor: "#007AFF",
	},
	styleImage: {
		width: "100%",
		height: "100%",
		backgroundColor: "#1C1C1E",
	},
});
