/**
 * WebView 3D 查看器（备用方案）
 * 在 WebView 中使用 Three.js 渲染 OBJ 模型
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { ViewerProps, ModelError } from '@/types/models/3d-viewer';
import { LoadingPlaceholder } from '../components/loading-placeholder';
import { ErrorFallback } from '../components/error-fallback';
import { logger } from '@/utils/logger';

export const ObjViewerWebView: React.FC<ViewerProps> = ({
  modelUrl,
  showPlaceholder = true,
  onLoad,
  onError,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ModelError | null>(null);

  // 生成 HTML 页面内容
  const generateHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      overflow: hidden;
      background-color: #f0f0f0;
      touch-action: none;
    }
    #container {
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="container"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r166/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.166.0/examples/js/loaders/OBJLoader.js"></script>

  <script>
    let scene, camera, renderer, model;
    let isDragging = false;
    let previousTouch = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };
    let scale = 1;
    let initialDistance = 0;

    function init() {
      // 创建场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);

      // 创建相机
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      // 创建渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      document.getElementById('container').appendChild(renderer.domElement);

      // 添加光照
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      scene.add(directionalLight);

      // 加载 OBJ 模型
      loadModel('${modelUrl}');

      // 监听窗口大小变化
      window.addEventListener('resize', onWindowResize);

      // 触摸事件
      setupTouchEvents();

      // 开始动画循环
      animate();
    }

    function loadModel(url) {
      const loader = new THREE.OBJLoader();

      loader.load(
        url,
        function(object) {
          // 居中模型
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          object.position.sub(center);

          // 缩放模型
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleValue = 2 / maxDim;
          object.scale.multiplyScalar(scaleValue);

          model = object;
          scene.add(model);

          // 通知 React Native 加载完成
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'load',
            success: true
          }));
        },
        function(xhr) {
          // 加载进度
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'progress',
            percentage: percentComplete
          }));
        },
        function(error) {
          // 加载错误
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: error.message || '加载失败'
          }));
        }
      );
    }

    function setupTouchEvents() {
      const canvas = renderer.domElement;

      // 单指拖动旋转
      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          isDragging = true;
          previousTouch = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          };
        } else if (e.touches.length === 2) {
          // 双指缩放
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          initialDistance = Math.sqrt(dx * dx + dy * dy);
        }
      });

      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();

        if (e.touches.length === 1 && isDragging) {
          // 旋转
          const deltaX = e.touches[0].clientX - previousTouch.x;
          const deltaY = e.touches[0].clientY - previousTouch.y;

          rotation.y += deltaX * 0.005;
          rotation.x += deltaY * 0.005;

          previousTouch = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          };
        } else if (e.touches.length === 2) {
          // 缩放
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (initialDistance > 0) {
            const scaleChange = distance / initialDistance;
            scale *= scaleChange;
            scale = Math.max(0.5, Math.min(5.0, scale));
          }

          initialDistance = distance;
        }
      });

      canvas.addEventListener('touchend', () => {
        isDragging = false;
        initialDistance = 0;
      });
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);

      // 应用旋转和缩放
      if (model) {
        model.rotation.y = rotation.y;
        model.rotation.x = rotation.x;
        model.scale.setScalar(scale);
      }

      renderer.render(scene, camera);
    }

    // 启动
    init();
  </script>
</body>
</html>
    `;
  };

  // 处理 WebView 消息
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'load':
          setLoading(false);
          onLoad?.(data);
          logger.info('Model loaded in WebView', 'ObjViewerWebView');
          break;

        case 'error':
          setLoading(false);
          const errorObj: ModelError = {
            type: 'parse',
            message: data.message || '加载失败',
          };
          setError(errorObj);
          onError?.(errorObj);
          logger.error(`WebView load error: ${data.message}`, 'ObjViewerWebView');
          break;

        case 'progress':
          // 可以在这里处理进度更新
          break;
      }
    } catch (parseError) {
      logger.error('Failed to parse WebView message', 'ObjViewerWebView');
      logger.error(
        parseError instanceof Error ? parseError.message : String(parseError),
        'ObjViewerWebView'
      );
    }
  };

  // 重试加载
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <View style={[styles.container, style]}>
      {/* 加载状态 */}
      {loading && showPlaceholder && (
        <View style={styles.overlayContainer}>
          <LoadingPlaceholder />
        </View>
      )}

      {/* 错误状态 */}
      {error && (
        <View style={styles.overlayContainer}>
          <ErrorFallback error={error} onRetry={handleRetry} />
        </View>
      )}

      {/* WebView */}
      {!error && (
        <WebView
          ref={webViewRef}
          source={{ html: generateHTML() }}
          style={styles.webView}
          onMessage={handleMessage}
          onError={() => {
            setLoading(false);
            const errorObj: ModelError = {
              type: 'unknown',
              message: 'WebView 加载失败',
            };
            setError(errorObj);
            onError?.(errorObj);
          }}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          originWhitelist={['*']}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
});
