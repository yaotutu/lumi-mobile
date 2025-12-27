/**
 * MenuItem 组件统一入口
 *
 * 平台选择逻辑：自动加载 iOS 或 Android 平台特定实现
 */

import { Platform } from 'react-native';
import type { MenuItemProps } from './types';

// 平台特定导入
const MenuItemIOS = require('./menu-item.ios').MenuItem;
const MenuItemAndroid = require('./menu-item.android').MenuItem;

/**
 * MenuItem 组件
 *
 * 根据平台自动选择合适的实现：
 * - iOS: 使用毛玻璃效果和 SF Symbols
 * - Android: 使用 Material Design 和涟漪效果
 */
export const MenuItem = Platform.select({
  ios: () => MenuItemIOS,
  android: () => MenuItemAndroid,
  // Web 平台默认使用 Android 版本
  web: () => MenuItemAndroid,
  default: () => MenuItemAndroid,
})();

// 导出类型
export type { MenuItemProps } from './types';
