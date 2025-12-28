/**
 * MenuItem 组件统一入口
 *
 * 平台选择逻辑：自动加载 iOS 或 Android 平台特定实现
 */

import { Platform } from 'react-native';
import { MenuItem as MenuItemIOS } from './menu-item.ios';
import { MenuItem as MenuItemAndroid } from './menu-item.android';

/**
 * MenuItem 组件
 *
 * 根据平台自动选择合适的实现：
 * - iOS: 使用毛玻璃效果和 SF Symbols
 * - Android: 使用 Material Design 和涟漪效果
 */
const MenuItemComponent =
  Platform.select({
    ios: MenuItemIOS,
    android: MenuItemAndroid,
    web: MenuItemAndroid,
    default: MenuItemAndroid,
  }) || MenuItemAndroid;

export const MenuItem = MenuItemComponent;

// 导出类型
export type { MenuItemProps } from './types';
