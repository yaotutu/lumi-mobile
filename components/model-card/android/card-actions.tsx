import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatLikes } from '@/constants/mock-data';
import { BorderRadius, Colors, FontWeight, Spacing } from '@/constants/theme';
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
					color={isDark ? '#FF6B6B' : '#F44336'}
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
							? 'rgba(66, 133, 244, 0.12)'
							: 'rgba(25, 118, 210, 0.08)',
					},
				]}
				activeOpacity={0.7}
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				onPress={onBookmark}
			>
				<Ionicons
					name="bookmark-outline"
					size={16}
					color={isDark ? '#4285F4' : '#1976D2'}
				/>
				<Text
					style={[
						styles.bookmarkText,
						{ color: isDark ? '#4285F4' : '#1976D2' },
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
		fontSize: 12,
		fontWeight: FontWeight.regular,
		lineHeight: 16,
	},
	bookmarkButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.xs,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 6,
		borderRadius: BorderRadius.sm,
		borderWidth: 1,
		borderColor: 'transparent',
	},
	bookmarkText: {
		fontSize: 13,
		fontWeight: FontWeight.medium,
		lineHeight: 18,
		fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'system',
	},
});