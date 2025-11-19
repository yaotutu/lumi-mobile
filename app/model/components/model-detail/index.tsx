import { Platform } from 'react-native';

// 根据平台自动选择对应的实现
const modelDetailModule = Platform.select({
  ios: require('./ios/model-detail'),
  android: require('./android/model-detail'),
  default: require('./ios/model-detail'),
});

export const ModelDetail = modelDetailModule!.ModelDetail;
export type { ModelDetailProps } from './types';
