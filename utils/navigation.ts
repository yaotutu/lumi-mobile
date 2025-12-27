import React from 'react';
import { Colors } from '@/constants/theme';
import type { ColorSchemeName } from 'react-native';
import { HeaderGradientBackground } from '@/components/navigation/header-gradient';

interface ImmersiveHeaderOptions {
  title?: string;
  colorScheme: ColorSchemeName;
  transparent?: boolean;
  /**
   * 透明模式下文字/图标颜色，默认白色
   */
  transparentTintColor?: string;
}

/**
 * 统一创建带渐变背景的沉浸式导航栏配置
 */
export function createImmersiveHeaderOptions({
  title,
  colorScheme,
  transparent = false,
  transparentTintColor,
}: ImmersiveHeaderOptions) {
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];

  const tintColor = transparent ? transparentTintColor || '#FFFFFF' : palette.text;

  return {
    headerShown: true,
    headerTitle: title || '',
    headerTitleStyle: {
      color: tintColor,
      fontWeight: '600',
    },
    headerTintColor: tintColor,
    headerBackTitleVisible: false,
    headerTransparent: transparent,
    headerStyle: {
      backgroundColor: transparent ? 'transparent' : palette.background,
    },
    headerShadowVisible: !transparent,
    headerBackground: transparent
      ? function HeaderBackground() {
          return React.createElement(HeaderGradientBackground, null);
        }
      : undefined,
  };
}
