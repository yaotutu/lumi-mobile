import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import type { HapticTabProps } from './types';

export function HapticTab(props: HapticTabProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={ev => {
        // iOS: 轻量触觉反馈
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
}
