// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  magnifyingglass: 'search',
  'wand.and.stars': 'auto-fix-high',
  'person.fill': 'person',
  sparkles: 'auto-awesome',
  'person.crop.circle': 'account-circle',
  safari: 'explore',
  bookmark: 'bookmark',
  'square.and.arrow.up': 'share',
  heart: 'favorite',
  'arrow.down.circle': 'cloud-download',
  clock: 'schedule',
  'plus.circle': 'add-circle-outline',
  'triangle.fill': 'change-history',
  'arrow.clockwise': 'autorenew',
  'cube.fill': 'view-in-ar',
  cube: 'view-in-ar',
  'printer.fill': 'print',
  ellipsis: 'more-horiz',
  'exclamationmark.triangle.fill': 'warning',
  'photo.on.rectangle': 'photo',
  hourglass: 'hourglass-bottom',
  'pawprint.fill': 'pets',
  'building.2.fill': 'apartment',
  'cpu.fill': 'memory',
  'leaf.fill': 'eco',
  'building.columns': 'account-balance',
  'car.fill': 'directions-car',
  'cube.box.fill': 'view-in-ar', // 3D 打印机图标 - 使用 AR 立方体图标
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
