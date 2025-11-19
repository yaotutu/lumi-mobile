import { Platform } from 'react-native';
import { SearchBar as SearchBarIOS } from './search-bar.ios';
import { SearchBar as SearchBarAndroid } from './search-bar.android';
import type { SearchBarProps } from './types';

// 根据平台自动选择对应的组件实现
export const SearchBar = Platform.select({
  ios: SearchBarIOS,
  android: SearchBarAndroid,
  default: SearchBarIOS, // 默认使用iOS版本
}) as React.ComponentType<SearchBarProps>;

export type { SearchBarProps };
