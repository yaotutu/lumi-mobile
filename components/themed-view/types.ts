import { ViewProps } from 'react-native';

export interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
  elevation?: number; // Android专属：海拔高度
  shadow?: boolean; // iOS专属：是否显示阴影
}
