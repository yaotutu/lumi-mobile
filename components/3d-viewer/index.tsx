/**
 * 3D 查看器智能选择器
 * 根据环境和配置自动选择最佳的渲染方案
 */

import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import type { ExtendedViewerProps, ViewerMode } from './types';
import { logger } from '@/utils/logger';
import { ObjViewer } from './native/obj-viewer';
import { ObjViewerWebView } from './web/obj-viewer-webview';

const NativeViewer = ObjViewer;
const WebViewViewer = ObjViewerWebView;

/**
 * 检测是否可以使用原生查看器
 */
const canUseNativeViewer = (): boolean => {
  // Web 平台不支持 expo-gl
  if (Platform.OS === 'web') {
    return false;
  }

  // 检查是否成功导入了原生查看器
  if (!NativeViewer) {
    return false;
  }

  // 这里可以添加更多的兼容性检测
  // 例如检测 SDK 版本、设备性能等

  return true;
};

/**
 * 决定使用哪个查看器
 */
const selectViewerMode = (requestedMode: ViewerMode = 'auto'): 'native' | 'webview' => {
  if (requestedMode === 'native') {
    if (canUseNativeViewer()) {
      return 'native';
    }
    logger.warn('Native viewer requested but not available, falling back to WebView', '3DViewer');
    return 'webview';
  }

  if (requestedMode === 'webview') {
    return 'webview';
  }

  // 自动模式：优先使用原生查看器
  if (canUseNativeViewer()) {
    logger.info('Using native viewer (expo-three)', '3DViewer');
    return 'native';
  }

  logger.info('Using WebView viewer (fallback)', '3DViewer');
  return 'webview';
};

/**
 * 3D 查看器主组件
 */
export const Viewer3D: React.FC<ExtendedViewerProps> = props => {
  const { mode = 'auto', ...viewerProps } = props;
  const [selectedMode, setSelectedMode] = useState<'native' | 'webview'>('webview');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const chosenMode = selectViewerMode(mode);
    setSelectedMode(chosenMode);
    setIsReady(true);
  }, [mode]);

  // 等待模式选择完成
  if (!isReady) {
    return null;
  }

  // 渲染对应的查看器
  if (selectedMode === 'native' && NativeViewer) {
    return <NativeViewer {...viewerProps} />;
  }

  if (WebViewViewer) {
    return <WebViewViewer {...viewerProps} />;
  }

  // 如果两个查看器都不可用，显示错误
  logger.error('No viewer available', '3DViewer');
  return null;
};

// 默认导出
export default Viewer3D;
export * from './types';
