import { Platform } from 'react-native';
import { ThemedText as ThemedTextIOS } from './themed-text.ios';
import { ThemedText as ThemedTextAndroid } from './themed-text.android';
import type { ThemedTextProps } from './types';

// 根据平台自动选择对应的组件实现
export const ThemedText = Platform.select({
  ios: ThemedTextIOS,
  android: ThemedTextAndroid,
  default: ThemedTextIOS, // 默认使用iOS版本
}) as React.ComponentType<ThemedTextProps>;

export type { ThemedTextProps };
