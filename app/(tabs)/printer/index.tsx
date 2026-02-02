/**
 * 3D 打印页面
 *
 * 功能：实时监控 3D 打印机状态、任务进度和打印参数
 *
 * 设计原则（基于 UI/UX Pro Max）：
 * - IoT Dashboard - 实时监控仪表板
 * - Glassmorphism - 毛玻璃卡片风格
 * - Real-Time Updates - 实时数据更新（5秒轮询）
 * - Clear Hierarchy - 清晰的信息层次
 *
 * 数据来源：
 * - 使用 Zustand Store 管理打印机状态
 * - 通过轮询机制实时更新打印机数据
 * - 支持下拉刷新手动更新
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { AuthGuard } from '@/components/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';
import { logger } from '@/utils/logger';
import { usePrinterStore } from '@/stores';

// 导入打印页面组件
import { PrinterStatusCard, type PrinterStatus } from '@/components/pages/printer/printer-status-card';
import { TaskProgressCard } from '@/components/pages/printer/task-progress-card';
import { PrinterParametersCard } from '@/components/pages/printer/printer-parameters-card';
import { ControlButtons } from '@/components/pages/printer/control-buttons';
import { PrinterSelector } from '@/components/printer-selector';

/**
 * 3D 打印页面主组件
 */
export default function PrinterScreen() {
  // 获取主题配置
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;

  // 路由
  const router = useRouter();

  // 从 Store 获取状态和操作
  const currentPrinter = usePrinterStore((state) => state.currentPrinter);
  const printers = usePrinterStore((state) => state.printers);
  const selectedPrinterId = usePrinterStore((state) => state.selectedPrinterId);
  const loading = usePrinterStore((state) => state.loading);
  const refreshing = usePrinterStore((state) => state.refreshing);
  const error = usePrinterStore((state) => state.error);
  const fetchPrinters = usePrinterStore((state) => state.fetchPrinters);
  const fetchPrinterDetail = usePrinterStore((state) => state.fetchPrinterDetail);
  const refreshCurrentPrinter = usePrinterStore((state) => state.refreshCurrentPrinter);
  const setPollingEnabled = usePrinterStore((state) => state.setPollingEnabled);
  const clearError = usePrinterStore((state) => state.clearError);
  const unbindPrinter = usePrinterStore((state) => state.unbindPrinter);

  // 打印机选择器显示状态
  const [selectorVisible, setSelectorVisible] = useState(false);

  /**
   * 初始化：获取打印机列表
   */
  useEffect(() => {
    logger.info('[PrinterScreen] 组件挂载，获取打印机列表');
    fetchPrinters();
  }, [fetchPrinters]);

  /**
   * 初始化：获取第一台打印机的详情
   * 只在没有选中打印机时执行（首次加载）
   */
  useEffect(() => {
    // 如果已经有选中的打印机，不执行初始化
    if (selectedPrinterId) {
      return;
    }

    // 如果有打印机列表且没有选中打印机，获取第一台打印机的详情
    if (printers.length > 0) {
      const firstPrinter = printers[0];

      // 检查 deviceId 是否存在
      if (!firstPrinter.deviceId) {
        logger.error('[PrinterScreen] 第一台打印机没有 deviceId');
        return;
      }

      logger.info('[PrinterScreen] 首次加载，获取第一台打印机详情:', firstPrinter.deviceId);
      fetchPrinterDetail(firstPrinter.deviceId);
    }
  }, [printers, selectedPrinterId, fetchPrinterDetail]);

  /**
   * 轮询机制：每 5 秒刷新打印机状态
   */
  useEffect(() => {
    // 如果没有选中的打印机 ID，不启动轮询
    if (!selectedPrinterId) {
      return;
    }

    logger.info('[PrinterScreen] 启动轮询机制，间隔 5 秒');

    // 启用轮询
    setPollingEnabled(true);

    // 创建 AbortController 用于取消请求
    const controller = new AbortController();

    // 轮询函数
    const poll = async () => {
      try {
        await refreshCurrentPrinter();
      } catch (error) {
        // 轮询失败不显示错误提示，只记录日志
        logger.error('[PrinterScreen] 轮询失败:', error);
      }
    };

    // 立即执行一次
    poll();

    // 设置定时器，每 5 秒执行一次
    const interval = setInterval(poll, 5000);

    // 清理函数
    return () => {
      logger.info('[PrinterScreen] 停止轮询机制');
      clearInterval(interval);
      controller.abort();
      setPollingEnabled(false);
    };
  }, [selectedPrinterId, refreshCurrentPrinter, setPollingEnabled]);

  /**
   * 错误处理：显示错误提示
   */
  useEffect(() => {
    if (error) {
      Alert.alert('错误', error, [{ text: '确定', onPress: () => clearError() }]);
    }
  }, [error, clearError]);

  /**
   * 处理下拉刷新
   */
  const handleRefresh = async () => {
    logger.info('[PrinterScreen] 手动刷新打印机数据');
    await refreshCurrentPrinter();
  };

  /**
   * 处理切换打印机按钮点击
   */
  const handleSwitchPrinter = () => {
    logger.info('[PrinterScreen] 切换打印机');

    // 直接显示打印机选择器（即使只有一台打印机，也允许用户添加新打印机）
    setSelectorVisible(true);
  };

  /**
   * 处理选择打印机
   */
  const handleSelectPrinter = (deviceId: string) => {
    logger.info('[PrinterScreen] 切换到打印机:', deviceId);
    // 获取选中打印机的详细信息
    fetchPrinterDetail(deviceId);
    // 关闭选择器
    setSelectorVisible(false);
  };

  /**
   * 处理添加打印机
   */
  const handleAddPrinter = () => {
    logger.info('[PrinterScreen] 添加打印机');
    // 关闭选择器
    setSelectorVisible(false);
    // 跳转到扫码页面
    router.push('/scan-printer');
  };

  /**
   * 处理删除打印机
   */
  const handleDeletePrinter = async (deviceId: string) => {
    logger.info('[PrinterScreen] 删除打印机:', deviceId);

    try {
      // 调用解绑 API
      await unbindPrinter(deviceId);

      logger.info('[PrinterScreen] 删除打印机成功');

      // 触觉反馈
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 关闭选择器
      setSelectorVisible(false);
    } catch (error) {
      // 删除失败
      logger.error('[PrinterScreen] 删除打印机失败:', error);

      // 触觉反馈
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // 显示错误提示
      Alert.alert('解绑失败', error instanceof Error ? error.message : '未知错误', [
        { text: '确定' },
      ]);
    }
  };

  /**
   * 处理暂停操作
   */
  const handlePause = async () => {
    logger.info('[PrinterScreen] 暂停打印');
    Alert.alert('暂停打印', '暂停功能开发中...', [{ text: '确定' }]);
  };

  /**
   * 处理继续操作
   */
  const handleResume = async () => {
    logger.info('[PrinterScreen] 继续打印');
    Alert.alert('继续打印', '继续功能开发中...', [{ text: '确定' }]);
  };

  /**
   * 处理停止操作
   */
  const handleStop = async () => {
    logger.info('[PrinterScreen] 停止打印');
    Alert.alert('停止打印', '停止功能开发中...', [{ text: '确定' }]);
  };

  // 加载状态：显示加载指示器
  if (loading && !currentPrinter) {
    return (
      <AuthGuard>
        <ScreenWrapper edges={['top']}>
          <View style={[styles.loadingContainer, { backgroundColor }]}>
            <ActivityIndicator size="large" color={isDark ? Colors.dark.tint : Colors.light.tint} />
            <Text style={[styles.loadingText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              加载中...
            </Text>
          </View>
        </ScreenWrapper>
      </AuthGuard>
    );
  }

  // 空状态：没有打印机
  if (!currentPrinter && !loading) {
    return (
      <AuthGuard>
        <ScreenWrapper edges={['top']}>
          <View style={[styles.emptyContainer, { backgroundColor }]}>
            {/* 图标 */}
            <Ionicons
              name="hardware-chip-outline"
              size={80}
              color={isDark ? Colors.dark.icon : Colors.light.icon}
              style={styles.emptyIcon}
            />

            {/* 提示文字 */}
            <Text style={[styles.emptyText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              暂无打印机
            </Text>
            <Text style={[styles.emptyHint, { color: isDark ? Colors.dark.icon : Colors.light.icon }]}>
              扫描打印机二维码进行绑定
            </Text>

            {/* 添加打印机按钮 */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/scan-printer');
              }}
              style={({ pressed }) => [
                styles.emptyButton,
                {
                  backgroundColor: '#007AFF',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>扫码添加打印机</Text>
            </Pressable>
          </View>
        </ScreenWrapper>
      </AuthGuard>
    );
  }

  // 正常状态：显示打印机数据
  // 类型守卫：确保 currentPrinter 不为 null
  if (!currentPrinter) {
    return null;
  }

  return (
    <AuthGuard>
      <ScreenWrapper edges={['top']}>
        {/* 页面内容（可滚动） */}
        <ScrollView
          style={[styles.scrollView, { backgroundColor }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? Colors.dark.text : Colors.light.text}
            />
          }
        >
          {/* 打印机状态卡片 */}
          <PrinterStatusCard
            printerName={currentPrinter.deviceName}
            printerModel={currentPrinter.model}
            status={currentPrinter.status as PrinterStatus}
            onSwitchPress={handleSwitchPrinter}
          />

          {/* 任务进度卡片 */}
          <TaskProgressCard
            taskName={currentPrinter.currentTask?.taskName || ''}
            progress={currentPrinter.currentTask?.progress || 0}
            elapsedTime={currentPrinter.currentTask?.elapsedTime || 0}
            remainingTime={currentPrinter.currentTask?.remainingTime || 0}
            currentLayer={currentPrinter.currentTask?.currentLayer || 0}
            totalLayers={currentPrinter.currentTask?.totalLayers || 0}
          />

          {/* 打印参数卡片 */}
          <PrinterParametersCard
            nozzleTemp={currentPrinter.nozzleTemp}
            nozzleTargetTemp={currentPrinter.nozzleTargetTemp}
            bedTemp={currentPrinter.bedTemp}
            bedTargetTemp={currentPrinter.bedTargetTemp}
            printSpeed={currentPrinter.printSpeed}
            fanSpeed={currentPrinter.fanSpeed}
          />

          {/* 操作按钮组 */}
          <ControlButtons
            status={currentPrinter.status as PrinterStatus}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        </ScrollView>

        {/* 打印机选择器 */}
        <PrinterSelector
          visible={selectorVisible}
          printers={printers}
          selectedPrinterId={selectedPrinterId}
          onSelect={handleSelectPrinter}
          onClose={() => setSelectorVisible(false)}
          onAddPrinter={handleAddPrinter}
          onDelete={handleDeletePrinter}
        />
      </ScreenWrapper>
    </AuthGuard>
  );
}

/**
 * 样式定义
 */
const styles = StyleSheet.create({
  // ScrollView 容器
  scrollView: {
    flex: 1, // 占满剩余空间
  },

  // ScrollView 内容容器
  scrollContent: {
    paddingTop: Spacing.lg, // 顶部内边距 - 16px，与其他页面一致
    paddingHorizontal: Spacing.lg, // 横向内边距 - 16px，避免内容贴边
    paddingBottom: Spacing.xxxl, // 底部内边距 - 32px，避免被 Tab Bar 遮挡
    gap: Spacing.md, // 卡片之间的间距 - 12px
  },

  // 加载容器
  loadingContainer: {
    flex: 1, // 占满整个屏幕
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    gap: Spacing.md, // 指示器和文本之间的间距
  },

  // 加载文本
  loadingText: {
    fontSize: 16, // 字体大小
    fontWeight: '500', // 字体粗细
  },

  // 空状态容器
  emptyContainer: {
    flex: 1, // 占满整个屏幕
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    paddingHorizontal: Spacing.xl, // 横向内边距
  },

  // 空状态图标
  emptyIcon: {
    marginBottom: Spacing.lg, // 图标和文字之间的间距
    opacity: 0.5, // 半透明效果
  },

  // 空状态文本
  emptyText: {
    fontSize: 20, // 字体大小
    fontWeight: '600', // 字体粗细
    marginBottom: Spacing.xs, // 与提示文字的间距
  },

  // 空状态提示
  emptyHint: {
    fontSize: 14, // 字体大小
    fontWeight: '400', // 字体粗细
    marginBottom: Spacing.xxl, // 与按钮的间距
    textAlign: 'center', // 文字居中
  },

  // 空状态按钮
  emptyButton: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    paddingHorizontal: 24, // 横向内边距
    paddingVertical: 14, // 纵向内边距
    borderRadius: 12, // 圆角
    gap: 8, // 图标和文字之间的间距
  },

  // 空状态按钮文字
  emptyButtonText: {
    fontSize: 16, // 字体大小
    fontWeight: '600', // 字体粗细
    color: '#FFFFFF', // 白色文字
  },
});
