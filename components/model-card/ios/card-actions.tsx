import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatLikes } from '@/constants/mock-data';
import { Colors, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CardActionsProps } from '../types';

export function CardActions({ likes, onBookmark }: CardActionsProps) {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<View style={styles.container}>
			{/* 点赞 */}
			<View style={styles.likes}>
				<Ionicons
					name="heart-outline"
					size={20}
					color={isDark ? '#FF453A' : '#FF3B30'}
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

			{/* 收藏按钮 - iOS 文字样式,纯黑配色 */}
			<TouchableOpacity
				style={styles.bookmarkButton}
				activeOpacity={0.5}
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				onPress={onBookmark}
			>
				<Ionicons
					name="bookmark-outline"
					size={16}
					color={isDark ? '#FFFFFF' : '#000000'}
				/>
				<Text
					style={[
						styles.bookmarkText,
						{ color: isDark ? '#FFFFFF' : '#000000' },
					]}
				>
					收藏
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	likes: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.xs + 2,
	},
	likesText: {
		fontSize: 11,
		fontWeight: FontWeight.medium,
		lineHeight: 16,
	},
	bookmarkButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.xs,
		paddingHorizontal: Spacing.xs,
		paddingVertical: 2,
	},
	bookmarkText: {
		fontSize: 13,
		fontWeight: FontWeight.medium,
		lineHeight: 18,
	},
});