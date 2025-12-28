/**
 * MenuGroup 组件统一入口
 *
 * 平台选择逻辑：自动加载 iOS 或 Android 平台特定实现
 */

import { Platform } from 'react-native';
import { MenuGroup as MenuGroupIOS } from './menu-group.ios';
import { MenuGroup as MenuGroupAndroid } from './menu-group.android';

/**
 * MenuGroup 组件
 *
 * 根据平台自动选择合适的实现：
 * - iOS: 使用细腻阴影和圆角卡片
 * - Android: 使用 Elevation 阴影系统
 */
const MenuGroupComponent =
  Platform.select({
    ios: MenuGroupIOS,
    android: MenuGroupAndroid,
    web: MenuGroupAndroid,
    default: MenuGroupAndroid,
  }) || MenuGroupAndroid;

export const MenuGroup = MenuGroupComponent;

// 导出类型
export type { MenuGroupProps } from './types';
