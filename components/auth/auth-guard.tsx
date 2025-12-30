/**
 * 认证守卫组件
 *
 * 功能：保护需要登录的页面，未登录时自动跳转到登录页
 *
 * 使用场景：
 * - 在需要登录的页面组件中包裹内容
 * - 页面仍在 Tab 导航器内，保持 Tab Bar 可见
 * - 未登录时跳转到全屏登录页
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

import { useEffect, type PropsWithChildren } from 'react';
import { router, usePathname } from 'expo-router';

import { useSession } from '@/app/ctx';
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
 * - 已知未登录（isLoading=false && !session）：直接跳转登录页
 * - 已登录（session存在）：显示页面内容
 */
export function AuthGuard({ children }: AuthGuardProps) {
  // 从 SessionProvider 获取认证状态
  const { session, isLoading } = useSession();

  // 获取当前路径，用于登录后返回
  const pathname = usePathname();

  // 监听认证状态，未登录时跳转到登录页
  useEffect(() => {
    // 只有在加载完成且未登录时才跳转
    if (!isLoading && !session) {
      logger.info('用户未登录，跳转到登录页', { pathname });

      // 使用 replace 而不是 push，避免用户按返回键回到受保护页面
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [session, isLoading, pathname]);

  // 仅在首次检查认证状态时显示 loading
  // 后续已知未登录时，直接返回 null（已触发跳转）
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 未登录返回 null（useEffect 已触发跳转）
  if (!session) {
    return null;
  }

  // 已登录，显示页面内容
  return <>{children}</>;
}
