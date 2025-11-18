import { Platform } from 'react-native';
import { HapticTab as HapticTabIOS } from './haptic-tab.ios';
import { HapticTab as HapticTabAndroid } from './haptic-tab.android';
import type { HapticTabProps } from './types';

// 根据平台自动选择对应的组件实现
export const HapticTab = Platform.select({
  ios: HapticTabIOS,
  android: HapticTabAndroid,
  default: HapticTabIOS, // 默认使用iOS版本
}) as (props: HapticTabProps) => React.JSX.Element;

export type { HapticTabProps };