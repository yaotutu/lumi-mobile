import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import type { HapticTabProps } from './types';

export function HapticTab(props: HapticTabProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Android: 更强的触觉反馈 (如果支持)
        if (process.env.EXPO_OS === 'android') {
          // Android设备通常支持更强烈的触觉反馈
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            .catch(() => {
              // 如果不支持触觉反馈，静默失败
            });
        }
        props.onPressIn?.(ev);
      }}
      // Android: 添加涟漪效果
      android_ripple={{
        color: 'rgba(255, 255, 255, 0.1)',
        borderless: false,
      }}
    />
  );
}