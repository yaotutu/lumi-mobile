/**
 * 认证守卫组件
 *
 * 功能：保护需要登录的页面，未登录时显示弹窗提示后跳转到登录页
 *
 * 使用场景：
 * - 在需要登录的页面组件中包裹内容
 * - 页面仍在 Tab 导航器内，保持 Tab Bar 可见
 * - 未登录时先显示弹窗提示，用户确认后跳转到登录页
 *
 * 示例：
 * ```tsx
 * export default function CreateScreen() {
 *   return (
 *     <AuthGuard>
 *       <ScreenWrapper>
 *         {/* 页面内容 *\/}
 *       </ScreenWrapper>
 *     </AuthGuard>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useRef, type PropsWithChildren } from 'react';
import { Alert } from 'react-native';
import { router, usePathname, useFocusEffect } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

import { useSession } from '@/contexts/session';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { logger } from '@/utils/logger';

/**
 * AuthGuard 组件参数
 */
export type AuthGuardProps = PropsWithChildren;

/**
 * 认证守卫组件
 *
 * 检查用户登录状态：
 * - 首次检查时（isLoading=true）：显示 LoadingScreen
 * - 已知未登录（isLoading=false && !session）：显示弹窗提示，用户确认后跳转登录页
 * - 已登录（session存在）：显示页面内容
 */
export function AuthGuard({ children }: AuthGuardProps) {
  // 从 SessionProvider 获取认证状态
  const { session, isLoading } = useSession();

  // 获取当前路径，用于登录后返回
  const pathname = usePathname();

  // 检查当前页面是否聚焦
  const isFocused = useIsFocused();

  // 记录是否已显示弹窗（本次页面聚焦期间）
  const hasShownAlertRef = useRef(false);

  // 每次页面聚焦时，重置弹窗标记
  useFocusEffect(
    useCallback(() => {
      logger.debug('页面聚焦，重置弹窗标记', { pathname });
      hasShownAlertRef.current = false;
    }, [pathname])
  );

  // 监听认证状态，未登录时显示弹窗提示
  useEffect(() => {
    // ✅ 关键修复：只在页面聚焦、加载完成、未登录且本次聚焦未显示过弹窗时才处理
    if (isFocused && !isLoading && !session && !hasShownAlertRef.current) {
      logger.info('用户未登录，显示登录提示弹窗', { pathname, isFocused });

      // 标记已显示弹窗
      hasShownAlertRef.current = true;

      // 显示登录提示弹窗
      Alert.alert(
        '提示',
        '请先登录后再进行操作',
        [
          {
            text: '取消',
            style: 'cancel',
            onPress: () => {
              logger.debug('用户取消登录，返回发现页');
              // 返回到发现页
              router.replace('/(tabs)/discover');
            },
          },
          {
            text: '去登录',
            onPress: () => {
              logger.info('用户选择去登录，跳转到登录页');
              // 跳转到登录页
              router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
            },
          },
        ],
        {
          // 禁止点击外部关闭弹窗
          cancelable: false,
        }
      );
    }
  }, [isFocused, session, isLoading, pathname]);

  // 加载中显示 loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 未登录返回 null（等待弹窗操作）
  if (!session) {
    return null;
  }

  // 已登录，显示页面内容
  return <>{children}</>;
}
