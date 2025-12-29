import { BlurView } from 'expo-blur';
import { Tabs, router } from 'expo-router';
import { Platform, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const tabHeight = 60 + insets.bottom;

  // 获取认证状态
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  /**
   * 检查认证状态的拦截器
   * 如果未登录，显示提示框询问用户是否要登录
   */
  const handleProtectedTabPress = (e: any, pageName: string) => {
    if (!isAuthenticated) {
      // 阻止默认的导航行为
      e.preventDefault();

      // 显示登录提示
      Alert.alert(
        '需要登录',
        `访问${pageName}需要先登录账号`,
        [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '去登录',
            onPress: () => {
              // 用户点击"去登录"后跳转到登录页
              router.push('/login');
            },
          },
        ],
        { cancelable: true }
      );
    }
    // 如果已登录，不阻止默认行为，正常导航
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: isDark ? '#4A9EFF' : '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabHeight,
            paddingBottom: insets.bottom,
            backgroundColor: themeColors.secondaryBackground,
            borderTopColor: themeColors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => (
                <BlurView
                  intensity={100}
                  tint={isDark ? 'dark' : 'light'}
                  style={[
                    styles.blurView,
                    {
                      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                  ]}
                />
              )
            : undefined,
      }}
    >
      {/* 发现 Tab - 公开访问 */}
      <Tabs.Screen
        name="discover/index"
        options={{
          title: '发现',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="safari" color={color} />,
        }}
      />

      {/* AI创作 Tab - 需要认证 */}
      <Tabs.Screen
        name="create/index"
        options={{
          title: 'AI创作',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="sparkles" color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleProtectedTabPress(e, 'AI创作'),
        }}
      />

      {/* 打印 Tab - 需要认证 */}
      <Tabs.Screen
        name="printer/index"
        options={{
          title: '打印',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="cube.box.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleProtectedTabPress(e, '打印'),
        }}
      />

      {/* 我的 Tab - 需要认证 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.crop.circle" color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => handleProtectedTabPress(e, '我的'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    ...Platform.select({
      ios: {
        borderTopWidth: 0,
        elevation: 0,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  tabBarIcon: {
    marginTop: 8,
  },
});
