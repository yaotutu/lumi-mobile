import { Platform } from 'react-native';
import { ThemedView as ThemedViewIOS } from './themed-view.ios';
import { ThemedView as ThemedViewAndroid } from './themed-view.android';
import type { ThemedViewProps } from './types';

// 根据平台自动选择对应的组件实现
export const ThemedView = Platform.select({
  ios: ThemedViewIOS,
  android: ThemedViewAndroid,
  default: ThemedViewIOS, // 默认使用iOS版本
}) as React.ComponentType<ThemedViewProps>;

export type { ThemedViewProps };
