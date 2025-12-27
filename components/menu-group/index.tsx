/**
 * MenuGroup 组件统一入口
 *
 * 平台选择逻辑：自动加载 iOS 或 Android 平台特定实现
 */

import { Platform } from 'react-native';
import type { MenuGroupProps } from './types';

// 平台特定导入
const MenuGroupIOS = require('./menu-group.ios').MenuGroup;
const MenuGroupAndroid = require('./menu-group.android').MenuGroup;

/**
 * MenuGroup 组件
 *
 * 根据平台自动选择合适的实现：
 * - iOS: 使用细腻阴影和圆角卡片
 * - Android: 使用 Elevation 阴影系统
 */
export const MenuGroup = Platform.select({
  ios: () => MenuGroupIOS,
  android: () => MenuGroupAndroid,
  // Web 平台默认使用 Android 版本
  web: () => MenuGroupAndroid,
  default: () => MenuGroupAndroid,
})();

// 导出类型
export type { MenuGroupProps } from './types';
