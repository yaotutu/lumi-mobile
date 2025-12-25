/**
 * 原生 3D 查看器 (expo-three)
 * 使用 expo-gl 和 Three.js 渲染 OBJ 模型
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
// @ts-ignore - OBJLoader 类型声明可能不完整
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import type { ViewerProps } from '@/types/models/3d-viewer';
import { useModelLoader } from '@/hooks/use-model-loader';
import { LoadingPlaceholder } from '../components/loading-placeholder';
import { ProgressBar } from '../components/progress-bar';
import { ErrorFallback } from '../components/error-fallback';
import { logger } from '@/utils/logger';

// 确保 THREE 在全局可用
if (typeof global !== 'undefined') {
  (global as any).THREE = (global as any).THREE || THREE;
}

export const ObjViewer: React.FC<ViewerProps> = ({
  modelUrl,
  showProgress = true,
  showPlaceholder = true,
  onLoad,
  onProgress,
  onError,
  style,
}) => {
  const [isGlReady, setIsGlReady] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false); // 新增：模型是否已加载到场景
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // 手势状态
  const rotationRef = useRef({ x: 0, y: 0 });
  const lastGestureRef = useRef({ x: 0, y: 0 });
  const baseScaleRef = useRef(1); // 模型的基础缩放（适配视口）
  const gestureScaleRef = useRef(1); // 手势缩放
  const lastScaleRef = useRef(1);
  const lastDistanceRef = useRef(0);

  // 存储回调的 ref（避免循环依赖）
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);
  const modelLoaderRef = useRef<any>(null);

  // 计算两点之间的距离
  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const [touch1, touch2] = touches;
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 创建 PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // 记录手势开始时的位置
        lastGestureRef.current = { ...rotationRef.current };
        lastScaleRef.current = gestureScaleRef.current;
        lastDistanceRef.current = 0; // 重置距离
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2) {
          // 双指缩放
          const currentDistance = getDistance(touches);

          // 第一次检测到双指时，初始化距离
          if (lastDistanceRef.current === 0) {
            lastDistanceRef.current = currentDistance;
            lastScaleRef.current = gestureScaleRef.current;
            return;
          }

          if (currentDistance > 0 && lastDistanceRef.current > 0) {
            // 计算缩放比例
            const scale = currentDistance / lastDistanceRef.current;
            gestureScaleRef.current = Math.max(0.5, Math.min(3, lastScaleRef.current * scale));
          }
        } else if (touches.length === 1) {
          // 单指旋转
          // 如果刚从双指变为单指，重置距离
          if (lastDistanceRef.current !== 0) {
            lastDistanceRef.current = 0;
            lastGestureRef.current = { ...rotationRef.current };
          }

          rotationRef.current = {
            x: lastGestureRef.current.x + gestureState.dy * 0.01,
            y: lastGestureRef.current.y + gestureState.dx * 0.01,
          };
        }
      },
    })
  ).current;

  useEffect(() => {
    onLoadRef.current = onLoad;
    onErrorRef.current = onError;
  }, [onLoad, onError]);

  // 加载 OBJ 模型到场景中
  const loadObjIntoScene = useCallback(async (objectUrl: string) => {
    if (!sceneRef.current || !cameraRef.current) {
      logger.warn('Scene or camera not ready, skipping model load', 'ObjViewer');
      return;
    }

    try {
      logger.info(`Loading OBJ from: ${objectUrl}`, 'ObjViewer');

      // 加载 OBJ 模型
      const loader = new OBJLoader();

      const object = await new Promise<THREE.Group>((resolve, reject) => {
        loader.load(
          objectUrl,
          (obj: any) => {
            logger.info('OBJ loaded successfully', 'ObjViewer');
            resolve(obj);
          },
          (progress: any) => {
            logger.debug(
              `OBJ loading progress: ${((progress.loaded / progress.total) * 100).toFixed(1)}%`,
              'ObjViewer'
            );
          },
          (error: any) => {
            logger.error(`OBJ load error: ${error}`, 'ObjViewer');
            reject(error);
          }
        );
      });

      // 移除旧模型
      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current);
        modelRef.current.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      // 应用默认材质（不加载纹理）
      logger.info('Applying default material (solid color)', 'ObjViewer');

      // 使用带光照的材质以获得更好的视觉效果
      const defaultMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
        flatShading: false,
      });

      object.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.material = defaultMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // 计算模型边界盒
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      logger.info(
        `Model bounds - Size: ${size.x.toFixed(2)}x${size.y.toFixed(2)}x${size.z.toFixed(2)}, Center: ${center.x.toFixed(2)},${center.y.toFixed(2)},${center.z.toFixed(2)}`,
        'ObjViewer'
      );

      // 居中模型
      object.position.sub(center);

      // 不修改模型的初始旋转，保持 OBJ 文件中的原始方向
      // 模型本身就有正确的位置和方向信息
      rotationRef.current = { x: 0, y: 0 };

      // 缩放模型以适应视口（更小的比例）
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.8 / maxDim; // 进一步缩小，让模型看起来更小

      // 保存基础缩放值
      baseScaleRef.current = scale;
      object.scale.setScalar(scale);

      logger.info(`Applied scale: ${scale.toFixed(4)}`, 'ObjViewer');

      modelRef.current = object;
      sceneRef.current.add(object);

      // 标记模型已加载完成
      setIsModelLoaded(true);

      logger.info('Model added to scene successfully', 'ObjViewer');
    } catch (error: any) {
      logger.error(`Failed to load OBJ: ${error.message}`, 'ObjViewer');
      // 即使失败也标记为已完成，避免一直显示 loading
      setIsModelLoaded(true);
      onErrorRef.current?.({
        type: 'parse',
        message: '模型解析失败',
        originalError: error,
      });
    }
  }, []);

  // 检查是否是本地文件
  const isLocalFile = useCallback((url: string) => {
    return url.startsWith('file://') || url.startsWith('/');
  }, []);

  // 使用模型加载 Hook
  const modelLoader = useModelLoader({
    onLoad: useCallback(
      (data: any) => {
        logger.info('Model URL ready, loading into scene', 'ObjViewer');
        const objectUrl = typeof data === 'string' ? data : data.url;
        loadObjIntoScene(objectUrl);
        onLoadRef.current?.(data);
      },
      [loadObjIntoScene]
    ),
    onProgress,
    onError,
  });

  // 存储 modelLoader 到 ref
  useEffect(() => {
    modelLoaderRef.current = modelLoader;
  }, [modelLoader]);

  // 初始化 Three.js 场景
  const onContextCreate = async (gl: any) => {
    logger.info('GLView context created', 'ObjViewer');

    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee); // 浅灰色背景，便于看清模型
    sceneRef.current = scene;

    // 创建相机（参考用户代码，更近的位置）
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(1, 1, 1); // 更近的相机位置
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 创建渲染器（直接使用 THREE.WebGLRenderer，iOS 兼容性更好）
    const renderer = new THREE.WebGLRenderer({
      canvas: {
        width,
        height,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: height,
        clientWidth: width,
        getContext: () => gl,
      } as any,
      context: gl,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0xeeeeee);
    rendererRef.current = renderer;

    // 添加更强的环境光（参考用户代码）
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // 增加亮度
    scene.add(ambientLight);

    // 添加主定向光
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight1.position.set(10, 10, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    // 添加补光（从另一个方向）
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight2.position.set(-10, 5, -5);
    scene.add(directionalLight2);

    // 添加顶部光源
    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight3.position.set(0, 10, 0);
    scene.add(directionalLight3);

    // 标记 GL 准备完成
    setIsGlReady(true);

    // 动画循环
    const animate = () => {
      timeoutRef.current = setTimeout(animate, 1000 / 60);

      // 应用手势旋转和缩放
      if (modelRef.current) {
        modelRef.current.rotation.x = rotationRef.current.x;
        modelRef.current.rotation.y = rotationRef.current.y;
        // 应用基础缩放 * 手势缩放
        modelRef.current.scale.setScalar(baseScaleRef.current * gestureScaleRef.current);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  // 当 modelUrl 变化时重置加载状态
  useEffect(() => {
    setIsModelLoaded(false);
  }, [modelUrl]);

  // GL 上下文准备完成后开始加载模型
  useEffect(() => {
    if (isGlReady && modelUrl) {
      // 如果是本地文件，直接加载到场景
      if (isLocalFile(modelUrl)) {
        logger.info('Loading local model file directly', 'ObjViewer');
        loadObjIntoScene(modelUrl);
        onLoadRef.current?.(modelUrl as any);
      } else {
        // 网络文件需要下载
        logger.info('Starting model download', 'ObjViewer');
        modelLoader.loadModel(modelUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGlReady, modelUrl, isLocalFile]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 清理 Three.js 资源
      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current);
        modelRef.current.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (modelLoaderRef.current) {
        modelLoaderRef.current.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* 加载状态 - 显示到模型真正加载完成 */}
      {!isModelLoaded && (
        <View style={styles.overlayContainer}>
          {showPlaceholder && <LoadingPlaceholder />}
          {showProgress && modelLoader.state === 'loading' && (
            <ProgressBar progress={modelLoader.progress} />
          )}
        </View>
      )}

      {/* 错误状态 */}
      {modelLoader.state === 'error' && modelLoader.error && (
        <View style={styles.overlayContainer}>
          <ErrorFallback error={modelLoader.error} onRetry={modelLoader.retry} />
        </View>
      )}

      {/* 3D 渲染视图 */}
      <View style={styles.glView} {...panResponder.panHandlers}>
        <GLView style={styles.glView} onContextCreate={onContextCreate} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
});
