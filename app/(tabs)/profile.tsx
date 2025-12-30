/**
 * 个人中心页面 - 对齐设计稿的 iOS 风格
 *
 * Mock 数据即可，无需接入真实 API。
 */

import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRef, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { ScreenWrapper } from '@/components/screen-wrapper';
import { AuthGuard } from '@/components/auth';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores';
import { logger } from '@/utils/logger';
import { LoadingScreen } from '@/components/ui/loading-screen';

const DEFAULT_PROFILE = {
  name: 'Alex Chroma',
  email: 'alex.chroma@example.com',
  id: 'ID: 3D-884-219',
  avatar: 'https://images.unsplash.com/illustrations/2?auto=format&fit=crop&w=120&h=120&q=80',
};

// 默认统计数据（当 API 未返回时使用）
const DEFAULT_STATS = {
  totalModels: 0,
  totalFavorites: 0,
  totalViews: 0,
};

// 统计数据配置（标签）
const STATS_CONFIG = [
  { key: 'totalModels' as const, label: '3D模型' },
  { key: 'totalFavorites' as const, label: '收藏' },
  { key: 'totalViews' as const, label: '浏览量' },
];

const MENU_SECTIONS = [
  [
    { label: 'Creation History', icon: 'time-outline' },
    { label: 'My Favorites', icon: 'heart' },
    { label: 'My Print Tasks', icon: 'print-outline' },
    { label: 'My Devices', icon: 'phone-portrait-outline' },
  ],
  [
    { label: 'Account Security', icon: 'lock-closed-outline' },
    { label: 'Help & Support', icon: 'help-circle-outline' },
  ],
];

type IoniconName = keyof typeof Ionicons.glyphMap;

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const { user, fetchProfile, logout } = useAuthStore();

  // 使用 ref 标记是否是首次加载
  const isFirstLoadRef = useRef(!user);
  // 用于触发重新渲染的状态
  const [, forceUpdate] = useState(0);

  // 使用 useFocusEffect：每次页面获得焦点时执行
  useFocusEffect(
    useCallback(() => {
      const refreshProfile = async () => {
        logger.info('刷新用户信息');

        // 保存是否是首次加载的状态（在修改前）
        const isFirstLoad = isFirstLoadRef.current;

        const success = await fetchProfile();

        // 首次加载完成后，更新标记并触发重新渲染
        if (isFirstLoad) {
          isFirstLoadRef.current = false;
          forceUpdate(prev => prev + 1);
        }

        // 如果不是首次加载且刷新失败，弹窗提示
        if (!isFirstLoad && !success) {
          Alert.alert('提示', '获取用户信息失败，请检查网络连接', [{ text: '确定' }]);
        }
      };

      refreshProfile();
    }, [fetchProfile])
  );

  // 首次加载且无数据，显示 loading
  if (isFirstLoadRef.current && !user) {
    return (
      <AuthGuard>
        <LoadingScreen />
      </AuthGuard>
    );
  }

  const profile = {
    name: user?.nickName || user?.userName || DEFAULT_PROFILE.name,
    email: user?.email || DEFAULT_PROFILE.email,
    id: user?.id ? `ID: ${user.id}` : DEFAULT_PROFILE.id,
    avatar: user?.avatar || DEFAULT_PROFILE.avatar,
  };

  // 获取真实的统计数据，如果没有则使用默认值
  const stats = user?.stats || DEFAULT_STATS;

  const colors = getPalette(isDark);

  const handleLogout = async () => {
    logger.info('用户点击退出登录');
    // 调用 Store 的 logout 方法，清除认证状态和 Token
    await logout();
    // 退出后立即跳转到登录页
    // 使用 replace 而不是 push，避免用户通过返回按钮回到个人中心
    router.replace('/login');
  };

  return (
    <AuthGuard>
      <ScreenWrapper edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={[styles.card, styles.sectionSpacing, { backgroundColor: colors.card }]}>
          {/* 头像：如果用户有头像则显示图片，否则显示默认 emoji */}
          {user?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.iconBackground }]}>
              <ThemedText style={styles.avatarEmoji}>😊</ThemedText>
            </View>
          )}
          <View style={styles.textContainer}>
            <ThemedText style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {profile.name}
            </ThemedText>
            <ThemedText
              style={[styles.email, { color: colors.secondaryText }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {profile.email}
            </ThemedText>
            <ThemedText
              style={[styles.id, { color: colors.secondaryText }]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {profile.id}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.statsCard, styles.sectionSpacing, { backgroundColor: colors.card }]}>
          {STATS_CONFIG.map((config, index) => (
            <View
              key={config.key}
              style={[
                styles.statItem,
                index === 1 && {
                  borderLeftWidth: StyleSheet.hairlineWidth,
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.statDivider,
                },
              ]}
            >
              <ThemedText style={[styles.statValue, { color: colors.headerText }]}>
                {stats[config.key]}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.link }]}>
                {config.label}
              </ThemedText>
            </View>
          ))}
        </View>

        {MENU_SECTIONS.map((group, groupIndex) => (
          <View
            key={`group-${groupIndex}`}
            style={[styles.menuCard, styles.sectionSpacing, { backgroundColor: colors.card }]}
          >
            {group.map((item, index) => (
              <TouchableOpacity key={item.label} style={styles.menuRow} activeOpacity={0.8}>
                <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
                  <Ionicons name={item.icon as IoniconName} size={20} color={colors.iconTint} />
                </View>
                <ThemedText style={[styles.menuLabel, { color: colors.headerText }]}>
                  {item.label}
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={colors.chevron} />
                {index !== group.length - 1 && (
                  <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.logoutButton, styles.sectionSpacing, { backgroundColor: colors.logout }]}
          onPress={handleLogout}
          activeOpacity={0.9}
        >
          <ThemedText style={styles.logoutLabel}>Log Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
    </AuthGuard>
  );
}

function getPalette(isDark: boolean) {
  return {
    screen: isDark ? '#0B0B0F' : '#F3F6FA',
    card: isDark ? '#1C1E26' : '#FFFFFF',
    headerText: isDark ? '#F5F6F8' : '#111A2C',
    secondaryText: isDark ? '#B0B6C3' : '#576482',
    link: isDark ? '#7ab5ff' : '#2B65D9',
    iconBackground: isDark ? 'rgba(53,108,244,0.15)' : '#E4EEFF',
    iconTint: '#3F7EEC',
    chevron: isDark ? '#98A0B1' : '#9BA4B7',
    divider: isDark ? 'rgba(255,255,255,0.1)' : '#EDF1F7',
    statDivider: isDark ? 'rgba(255,255,255,0.2)' : '#E6EBF3',
    logout: '#E74343',
  };
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionSpacing: {
    marginTop: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
    lineHeight: 32,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 4,
  },
  id: {
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 24,
    paddingVertical: 18,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  menuCard: {
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    position: 'relative',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  rowDivider: {
    position: 'absolute',
    bottom: 0,
    left: 56,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  logoutButton: {
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#F03D3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  logoutLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
