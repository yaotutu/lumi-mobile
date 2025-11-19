import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CardContent } from './card-content';
import { CardActions } from './card-actions';
import type { ModelCardProps } from '../types';

export function ModelCard({ title, creator, imageUrl, likes }: ModelCardProps) {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

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
					shadowColor: isDark ? '#000' : '#1976D2',
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
							? 'rgba(255, 255, 255, 0.12)'
							: 'rgba(0, 0, 0, 0.08)',
					},
				]}
			>
				<CardContent title={title} creator={creator} likes={likes} />
				<CardActions likes={likes} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: BorderRadius.md,
		overflow: 'hidden',
		marginBottom: Spacing.xl,
		marginHorizontal: Spacing.sm,
	},
	image: {
		width: '100%',
		height: 180,
		backgroundColor: '#E5E5EA',
	},
	content: {
		padding: Spacing.md,
	},
});