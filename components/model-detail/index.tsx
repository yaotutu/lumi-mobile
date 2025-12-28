// 平台特定组件的统一入口
// 根据平台自动选择对应的实现
import { Platform } from 'react-native';
import { ModelDetail as ModelDetailIOS } from './model-detail.ios';
import { ModelDetail as ModelDetailAndroid } from './model-detail.android';

const ModelDetailComponent =
  Platform.select({
    ios: ModelDetailIOS,
    android: ModelDetailAndroid,
    default: ModelDetailIOS,
  }) || ModelDetailIOS;

export const ModelDetail = ModelDetailComponent;

export type { ModelDetailProps } from './types';
