/**
 * 3D 打印页面
 *
 * 功能：实时监控 3D 打印机状态、任务进度和打印参数
 *
 * 设计原则（基于 UI/UX Pro Max）：
 * - IoT Dashboard - 实时监控仪表板
 * - Glassmorphism - 毛玻璃卡片风格
 * - Real-Time Updates - 实时数据更新
 * - Clear Hierarchy - 清晰的信息层次
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { AuthGuard } from '@/components/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';
import { logger } from '@/utils/logger';

// 导入打印页面组件
import { PrinterStatusCard, type PrinterStatus } from '@/components/pages/printer/printer-status-card';
import { TaskProgressCard } from '@/components/pages/printer/task-progress-card';
import { PrinterParametersCard } from '@/components/pages/printer/printer-parameters-card';
import { ControlButtons } from '@/components/pages/printer/control-buttons';

/**
 * 打印机数据接口
 */
interface PrinterData {
  // 打印机信息
  name: string;
  model: string;
  status: PrinterStatus;

  // 任务信息
  taskName: string;
  progress: number;
  elapsedTime: number;
  remainingTime: number;
  currentLayer: number;
  totalLayers: number;

  // 打印参数
  nozzleTemp: number;
  nozzleTargetTemp: number;
  bedTemp: number;
  bedTargetTemp: number;
  printSpeed: number;
  fanSpeed: number;
}

/**
 * Mock 数据 - 模拟打印中状态
 */
const MOCK_PRINTER_DATA: PrinterData = {
  // 打印机信息
  name: 'Lumi Pro X1',
  model: 'LPX-2024',
  status: 'printing',

  // 任务信息
  taskName: 'dragon_sculpture_v3.gcode',
  progress: 42.5,
  elapsedTime: 3600, // 1小时
  remainingTime: 4860, // 1小时21分钟
  currentLayer: 127,
  totalLayers: 298,

  // 打印参数
  nozzleTemp: 205,
  nozzleTargetTemp: 210,
  bedTemp: 58,
  bedTargetTemp: 60,
  printSpeed: 60,
  fanSpeed: 100,
};

/**
 * 3D 打印页面主组件
 */
export default function PrinterScreen() {
  // 获取主题配置
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;

  // 打印机数据状态
  const [printerData, setPrinterData] = useState<PrinterData>(MOCK_PRINTER_DATA);

  // 下拉刷新状态
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 模拟实时更新
   * 每秒更新进度、时间、温度等参数
   */
  useEffect(() => {
    // 只在打印中状态才更新
    if (printerData.status !== 'printing') {
      return;
    }

    const interval = setInterval(() => {
      setPrinterData((prev) => {
        // 计算新的进度（每秒增加约 0.01%）
        const newProgress = Math.min(prev.progress + 0.01, 100);

        // 计算新的已打印时间（增加 1 秒）
        const newElapsedTime = prev.elapsedTime + 1;

        // 计算新的剩余时间（减少 1 秒，最小为 0）
        const newRemainingTime = Math.max(prev.remainingTime - 1, 0);

        // 计算新的当前层数（根据进度比例）
        const newCurrentLayer = Math.floor((newProgress / 100) * prev.totalLayers);

        // 模拟温度波动（±2℃）
        const nozzleTempDelta = (Math.random() - 0.5) * 4;
        const bedTempDelta = (Math.random() - 0.5) * 4;
        const newNozzleTemp = Math.max(0, prev.nozzleTemp + nozzleTempDelta);
        const newBedTemp = Math.max(0, prev.bedTemp + bedTempDelta);

        return {
          ...prev,
          progress: newProgress,
          elapsedTime: newElapsedTime,
          remainingTime: newRemainingTime,
          currentLayer: newCurrentLayer,
          nozzleTemp: newNozzleTemp,
          bedTemp: newBedTemp,
        };
      });
    }, 1000); // 每秒更新一次

    // 清理定时器
    return () => clearInterval(interval);
  }, [printerData.status]);

  /**
   * 处理下拉刷新
   */
  const handleRefresh = async () => {
    logger.info('🔄 [PrinterScreen] 刷新打印机数据');
    setRefreshing(true);

    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 重置为初始数据
    setPrinterData(MOCK_PRINTER_DATA);

    setRefreshing(false);
  };

  /**
   * 处理设置按钮点击
   */
  const handleSettingsPress = () => {
    logger.info('⚙️ [PrinterScreen] 打开打印机设置');
    Alert.alert('打印机设置', '设置功能开发中...', [{ text: '确定' }]);
  };

  /**
   * 处理暂停操作
   */
  const handlePause = async () => {
    logger.info('⏸️ [PrinterScreen] 暂停打印');

    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 更新状态为暂停
    setPrinterData((prev) => ({
      ...prev,
      status: 'paused',
    }));

    Alert.alert('已暂停', '打印已暂停', [{ text: '确定' }]);
  };

  /**
   * 处理继续操作
   */
  const handleResume = async () => {
    logger.info('▶️ [PrinterScreen] 继续打印');

    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 更新状态为打印中
    setPrinterData((prev) => ({
      ...prev,
      status: 'printing',
    }));

    Alert.alert('已继续', '打印已继续', [{ text: '确定' }]);
  };

  /**
   * 处理停止操作
   */
  const handleStop = async () => {
    logger.info('⏹️ [PrinterScreen] 停止打印');

    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 更新状态为空闲
    setPrinterData((prev) => ({
      ...prev,
      status: 'idle',
      progress: 0,
      elapsedTime: 0,
      remainingTime: 0,
      currentLayer: 0,
    }));

    Alert.alert('已停止', '打印已停止', [{ text: '确定' }]);
  };

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
            printerName={printerData.name}
            printerModel={printerData.model}
            status={printerData.status}
            onSettingsPress={handleSettingsPress}
          />

          {/* 任务进度卡片 */}
          <TaskProgressCard
            taskName={printerData.taskName}
            progress={printerData.progress}
            elapsedTime={printerData.elapsedTime}
            remainingTime={printerData.remainingTime}
            currentLayer={printerData.currentLayer}
            totalLayers={printerData.totalLayers}
          />

          {/* 打印参数卡片 */}
          <PrinterParametersCard
            nozzleTemp={printerData.nozzleTemp}
            nozzleTargetTemp={printerData.nozzleTargetTemp}
            bedTemp={printerData.bedTemp}
            bedTargetTemp={printerData.bedTargetTemp}
            printSpeed={printerData.printSpeed}
            fanSpeed={printerData.fanSpeed}
          />

          {/* 操作按钮组 */}
          <ControlButtons
            status={printerData.status}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        </ScrollView>
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
});
