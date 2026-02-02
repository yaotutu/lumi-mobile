/**
 * 认证 Store 类型定义
 */

/**
 * 用户统计数据
 */
export interface UserStats {
  /** 模型总数 */
  totalModels: number;
  /** 公开模型数 */
  publicModels: number;
  /** 私有模型数 */
  privateModels: number;
  /** 获赞总数 */
  totalLikes: number;
  /** 收藏总数 */
  totalFavorites: number;
  /** 浏览总数 */
  totalViews: number;
  /** 下载总数 */
  totalDownloads: number;
  /** 点赞的模型数 */
  likedModelsCount: number;
  /** 收藏的模型数 */
  favoritedModelsCount: number;
  /** 请求总数 */
  totalRequests: number;
  /** 完成的请求数 */
  completedRequests: number;
  /** 失败的请求数 */
  failedRequests: number;
}

/**
 * 用户信息（匹配后端外部用户服务 UserInfoData 结构）
 */
export interface UserProfile {
  id: string;
  userName: string;
  nickName: string;
  email?: string;
  avatar?: string | null;
  gender?: string;
  createdAt?: number; // Unix 时间戳（秒）
  updatedAt?: number; // Unix 时间戳（秒）
  /** 用户统计数据 */
  stats?: UserStats;
}

/**
 * 认证状态
 */
export interface AuthState {
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 用户信息 */
  user: UserProfile | null;
  /** Token */
  token: string | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否正在提交（登录/注册/登出） */
  isSubmitting: boolean;
  /** 是否正在发送验证码 */
  isSendingCode: boolean;
}

/**
 * fetchProfile 返回结果
 */
export interface FetchProfileResult {
  success: boolean;
  error?: {
    message: string;
    status?: number;
    code?: string;
  };
}

/**
 * 认证操作
 */
export interface AuthActions {
  /** 发送验证码 */
  sendVerificationCode: (email: string, type: 'login' | 'register') => Promise<boolean>;
  /** 注册 */
  register: (email: string, code: string) => Promise<boolean>;
  /** 登录 */
  login: (email: string, code: string) => Promise<boolean>;
  /** 登出 */
  logout: () => Promise<void>;
  /** 获取用户信息 */
  fetchProfile: () => Promise<FetchProfileResult>;
  /** 检查登录状态 */
  checkAuth: () => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 认证 Store 实现
 * 管理用户登录状态和用户信息
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { produce } from 'immer';

import { tokenManager } from '@/services/api-client';
import * as authApi from '@/services/api/auth';
import { logger } from '@/utils/logger';

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      isSubmitting: false,
      isSendingCode: false,

      // 发送验证码
      sendVerificationCode: async (email, type) => {
        set(
          produce((state: AuthStore) => {
            state.isSendingCode = true;
          })
        );

        try {
          const result = await authApi.sendVerificationCode({ email, type });

          set(
            produce((state: AuthStore) => {
              state.isSendingCode = false;
            })
          );

          if (result.success) {
            return true;
          } else {
            // 错误已经在 API 层记录，这里只需要返回 false
            return false;
          }
        } catch (error) {
          set(
            produce((state: AuthStore) => {
              state.isSendingCode = false;
            })
          );

          logger.error('发送验证码异常:', error);
          return false;
        }
      },

      // 注册
      register: async (email, code) => {
        set(
          produce((state: AuthStore) => {
            state.isSubmitting = true;
            state.isLoading = true;
          })
        );

        try {
          const result = await authApi.register({ email, code });

          set(
            produce((state: AuthStore) => {
              state.isSubmitting = false;
              state.isLoading = false;
            })
          );

          if (result.success) {
            return true;
          } else {
            return false;
          }
        } catch (error) {
          set(
            produce((state: AuthStore) => {
              state.isSubmitting = false;
              state.isLoading = false;
            })
          );

          logger.error('注册异常:', error);
          return false;
        }
      },

      // 登录
      login: async (email, code) => {
        set(
          produce((state: AuthStore) => {
            state.isSubmitting = true;
            state.isLoading = true;
          })
        );

        try {
          const result = await authApi.login({ email, code });

          if (result.success) {
            const { token } = result.data;

            // 保存 Token
            await tokenManager.setToken(token);

            set(
              produce((state: AuthStore) => {
                state.isLoading = false;
                state.isSubmitting = false;
                state.isAuthenticated = true;
                state.token = token;
              })
            );

            // 登录成功后获取用户信息
            await get().fetchProfile();

            return true;
          } else {
            set(
              produce((state: AuthStore) => {
                state.isLoading = false;
                state.isSubmitting = false;
              })
            );

            return false;
          }
        } catch (error) {
          set(
            produce((state: AuthStore) => {
              state.isLoading = false;
              state.isSubmitting = false;
            })
          );

          logger.error('登录异常:', error);
          return false;
        }
      },

      // 登出
      logout: async () => {
        set(
          produce((state: AuthStore) => {
            state.isSubmitting = true;
            state.isLoading = true;
          })
        );

        try {
          // 调用登出 API
          await authApi.logout();
        } catch (error) {
          logger.error('登出 API 调用失败:', error);
        } finally {
          // 无论 API 调用成功与否，都清除本地状态
          await tokenManager.clearToken();

          set(
            produce((state: AuthStore) => {
              state.isLoading = false;
              state.isSubmitting = false;
              state.isAuthenticated = false;
              state.user = null;
              state.token = null;
            })
          );
        }
      },

      // 获取用户信息
      fetchProfile: async () => {
        try {
          const result = await authApi.getUserProfile();

          if (result.success) {
            // 打印获取到的用户数据，用于调试
            logger.info('✅ 用户信息获取成功');
            logger.info('👤 用户 ID:', result.data.id);
            logger.info('👤 用户昵称:', result.data.nickName);
            logger.info('📊 统计数据:', JSON.stringify(result.data.stats, null, 2));

            set(
              produce((state: AuthStore) => {
                state.user = result.data;
              })
            );
            return { success: true }; // 返回成功状态
          } else {
            logger.warn('❌ 获取用户信息失败:', result.error.message);
            // 返回失败状态，包含错误信息
            return {
              success: false,
              error: result.error,
            };
          }
        } catch (error) {
          logger.error('获取用户信息异常:', error);
          // 返回失败状态，包含错误信息
          return {
            success: false,
            error: {
              message: error instanceof Error ? error.message : '未知错误',
              status: 0,
            },
          };
        }
      },

      // 检查登录状态
      checkAuth: async () => {
        // 设置加载状态
        set(
          produce((state: AuthStore) => {
            state.isLoading = true;
          })
        );

        try {
          const token = await tokenManager.getToken();
          logger.info('📌 当前 Token:', token ? token.substring(0, 50) + '...' : 'null');

          if (token) {
            set(
              produce((state: AuthStore) => {
                state.isAuthenticated = true;
                state.token = token;
              })
            );

            // 获取用户信息
            const result = await get().fetchProfile();

            // ✅ 修复：只在真正的认证错误（401）时清除认证状态
            if (!result.success) {
              // 检查是否是认证错误（401 或 UNAUTHORIZED）
              const isAuthError =
                result.error.status === 401 ||
                result.error.code === 'UNAUTHORIZED' ||
                result.error.code === 'UNAUTHENTICATED';

              if (isAuthError) {
                // 认证错误：清除 token 和认证状态
                logger.warn('Token 无效（401），清除认证状态');
                await tokenManager.clearToken();
                set(
                  produce((state: AuthStore) => {
                    state.isAuthenticated = false;
                    state.token = null;
                    state.user = null;
                  })
                );
              } else {
                // 其他错误（网络错误、500、502 等）：保持登录状态
                logger.warn('获取用户信息失败，但保持登录状态:', result.error.message);
                // 保持 isAuthenticated = true 和 token，只是 user 为 null
              }
            }
          } else {
            set(
              produce((state: AuthStore) => {
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
              })
            );
          }
        } catch (error) {
          logger.error('检查登录状态异常:', error);
          // ✅ 修复：异常情况下也保持登录状态（如果有 token）
          const token = await tokenManager.getToken();
          if (token) {
            logger.warn('检查登录状态异常，但保持登录状态');
            set(
              produce((state: AuthStore) => {
                state.isAuthenticated = true;
                state.token = token;
                state.user = null;
              })
            );
          } else {
            set(
              produce((state: AuthStore) => {
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
              })
            );
          }
        } finally {
          set(
            produce((state: AuthStore) => {
              state.isLoading = false;
            })
          );
        }
      },

      // 重置状态
      reset: () => {
        set(
          produce((state: AuthStore) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.isLoading = false;
            state.isSubmitting = false;
            state.isSendingCode = false;
          })
        );
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化这些字段
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
