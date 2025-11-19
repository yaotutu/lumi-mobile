import { Platform } from 'react-native';
import { ModelCard as ModelCardIOS } from './ios/model-card';
import { ModelCard as ModelCardAndroid } from './android/model-card';
import type { ModelCardProps } from './types';

// 根据平台自动选择对应的组件实现
export const ModelCard = Platform.select({
  ios: ModelCardIOS,
  android: ModelCardAndroid,
  default: ModelCardIOS, // 默认使用iOS版本
}) as React.ComponentType<ModelCardProps>;

export type { ModelCardProps, CardContentProps, CardActionsProps } from './types';