/**
 * 认证守卫 Hook
 * 用于需要登录才能访问的页面
 *
 * 使用方式：
 * 在页面组件中调用 useAuthGuard()
 * 如果用户未登录，会自动跳转到登录页
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores';
import { logger } from '@/utils/logger';

interface UseAuthGuardOptions {
  /**
   * 自定义未登录时的跳转路径
   * @default '/login'
   */
  redirectTo?: string;
  /**
   * 页面标识，用于日志记录
   */
  pageName?: string;
  /**
   * 是否静默跳转（不显示加载状态）
   * @default true
   */
  silent?: boolean;
}

/**
 * 认证守卫 Hook
 * 如果用户未登录，会自动跳转到登录页
 * 主要用作额外的防护层，防止用户通过其他方式访问受保护页面
 *
 * @returns 认证状态信息
 * - isAuthenticated: 是否已认证
 * - isLoading: 是否正在检查认证状态（仅在非静默模式下有意义）
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { redirectTo = '/login', pageName = '受保护页面', silent = true } = options;
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // 在静默模式下，不等待加载完成，立即检查
    // 在非静默模式下，等待加载完成后再检查
    const shouldCheck = silent ? true : !isLoading;

    if (shouldCheck && !isAuthenticated) {
      logger.info(`访问 ${pageName} 需要登录，跳转到登录页`);
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, pageName, silent]);

  return {
    isAuthenticated,
    isLoading: silent ? false : isLoading, // 静默模式下不返回加载状态
  };
}
