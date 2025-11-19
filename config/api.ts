/**
 * API 配置
 * 集中管理所有 API 相关配置
 */

import { ENV } from './env';

// API 基础配置
export const API_CONFIG = {
  baseURL: ENV.API_URL,
  timeout: 30000, // 30秒超时
  retryAttempts: 3, // 重试次数
  retryDelay: 1000, // 重试延迟(毫秒)
} as const;

// API 端点
export const API_ENDPOINTS = {
  gallery: {
    models: '/api/gallery/models',
    modelDetail: (id: string) => `/api/gallery/models/${id}`,
    modelDownload: (id: string) => `/api/gallery/models/${id}/download`,
  },
  proxy: {
    image: '/api/proxy/image',
    model: '/api/proxy/model',
  },
  user: {
    profile: '/api/user/profile',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
} as const;

// 默认请求头
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;
