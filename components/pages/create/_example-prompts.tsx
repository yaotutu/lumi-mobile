import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EXAMPLE_PROMPTS = [
	"一只坐在石头上的低多边形狐狸",
	"赛博朋克风格的未来城市建筑",
	"卡通风格的可爱机器人",
];

interface ExamplePromptsProps {
	onPromptSelect: (prompt: string) => void;
	cardBackground: string;
	borderColor: string;
	textColor: string;
}

export function ExamplePrompts({
	onPromptSelect,
	cardBackground,
	borderColor,
	textColor,
}: ExamplePromptsProps) {
	return (
		<View style={styles.container}>
			{EXAMPLE_PROMPTS.map((example, index) => (
				<TouchableOpacity
					key={index}
					style={[
						styles.exampleCard,
						{ backgroundColor: cardBackground, borderColor },
					]}
					onPress={() => onPromptSelect(example)}
				>
					<Text
						style={[styles.exampleText, { color: textColor }]}
						numberOfLines={2}
					>
						{example}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 24,
		gap: 10,
	},
	exampleCard: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderRadius: 12,
		borderWidth: 1,
		minHeight: 64,
		justifyContent: "center",
	},
	exampleText: {
		fontSize: 13,
		lineHeight: 18,
		textAlign: "center",
	},
});
