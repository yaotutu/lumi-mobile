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
import type { AuthState, AuthActions, UserProfile } from './types';

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
            return true; // 返回成功状态
          } else {
            logger.warn('❌ 获取用户信息失败:', result.error.message);
            return false; // 返回失败状态
          }
        } catch (error) {
          logger.error('获取用户信息失败:', error);
          return false; // 返回失败状态
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
            const success = await get().fetchProfile();

            // 如果获取用户信息失败（Token 无效），清除认证状态
            if (!success) {
              logger.warn('Token 无效，清除认证状态');
              await tokenManager.clearToken();
              set(
                produce((state: AuthStore) => {
                  state.isAuthenticated = false;
                  state.token = null;
                  state.user = null;
                })
              );
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
          logger.error('检查登录状态失败', error);
          set(
            produce((state: AuthStore) => {
              state.isAuthenticated = false;
              state.token = null;
              state.user = null;
            })
          );
        } finally {
          // 清除加载状态
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
