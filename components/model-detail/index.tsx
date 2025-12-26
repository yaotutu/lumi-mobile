// 平台特定组件的统一入口
// 根据平台自动选择对应的实现
import { Platform } from 'react-native';

// 动态导入平台特定的组件
export const ModelDetail = Platform.select({
  ios: require('./model-detail.ios').ModelDetail,
  android: require('./model-detail.android').ModelDetail,
  default: require('./model-detail.ios').ModelDetail, // 默认使用 iOS 版本
});

export type { ModelDetailProps } from './types';
