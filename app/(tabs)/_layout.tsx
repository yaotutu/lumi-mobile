import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaSpacing } from '@/hooks/use-safe-area-spacing';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;
  const { tabBarHeight } = useSafeAreaSpacing();

  return (
    <Tabs
      initialRouteName="discover/index"
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: isDark ? '#4A9EFF' : '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: [
          styles.tabBar,
          { height: tabBarHeight },
          Platform.OS === 'android' && {
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
      <Tabs.Screen
        name="discover/index"
        options={{
          title: '发现',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="safari" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create/index"
        options={{
          title: 'AI创作',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="printer/index"
        options={{
          title: '打印',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="cube.box.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.crop.circle" color={color} />
          ),
        }}
      />
      {/* 任务详情页 - 隐藏在 Tab 栏中，但保持底部 Tab 可见 */}
      <Tabs.Screen
        name="task/[id]"
        options={{
          href: null, // 不在 Tab 栏中显示
          headerShown: true, // 显示导航栏（由页面内的 Stack.Screen 控制）
          title: 'AI 创作',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    // height 通过 useSafeAreaSpacing 动态设置
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
      },
      android: {
        // backgroundColor 在 screenOptions 中动态设置
        elevation: 8, // Material Design 阴影
      },
      default: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
      },
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
