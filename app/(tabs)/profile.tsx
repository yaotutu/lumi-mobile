/**
 * 个人中心页面 - 对齐设计稿的 iOS 风格
 *
 * Mock 数据即可，无需接入真实 API。
 */

import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ScreenWrapper } from '@/components/screen-wrapper';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores';
import { logger } from '@/utils/logger';
import { SimpleTabHeader } from '@/components/layout/simple-tab-header';

const DEFAULT_PROFILE = {
  name: 'Alex Chroma',
  email: 'alex.chroma@example.com',
  id: 'ID: 3D-884-219',
  avatar: 'https://images.unsplash.com/illustrations/2?auto=format&fit=crop&w=120&h=120&q=80',
};

const MOCK_STATS = [
  { label: 'Creations', value: '128' },
  { label: 'Favorites', value: '256' },
  { label: 'Tasks', value: '3' },
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
  const { user, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const profile = {
    name: user?.nickName || user?.userName || DEFAULT_PROFILE.name,
    email: user?.email || DEFAULT_PROFILE.email,
    id: user?.id ? `ID: ${user.id}` : DEFAULT_PROFILE.id,
    avatar: user?.avatar || DEFAULT_PROFILE.avatar,
  };

  const colors = getPalette(isDark);

  const handleLogout = async () => {
    logger.info('用户点击退出登录');
    await logout();
  };

  return (
    <ScreenWrapper edges={['top']}>
      <SimpleTabHeader title="我的" subtitle="管理账号、设备与创作" />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.screen }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.card, styles.sectionSpacing, { backgroundColor: colors.card }]}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View>
            <ThemedText style={styles.name}>{profile.name}</ThemedText>
            <ThemedText style={[styles.email, { color: colors.secondaryText }]}>
              {profile.email}
            </ThemedText>
            <ThemedText style={[styles.id, { color: colors.secondaryText }]}>{profile.id}</ThemedText>
          </View>
        </View>

        <View style={[styles.statsCard, styles.sectionSpacing, { backgroundColor: colors.card }]}>
          {MOCK_STATS.map((item, index) => (
            <View
              key={item.label}
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
                {item.value}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.link }]}>{item.label}</ThemedText>
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
                {index !== group.length - 1 && <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />}
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
