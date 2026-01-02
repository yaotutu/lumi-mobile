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
  // AI 创作任务相关端点
  tasks: {
    // 创建文生图任务
    create: '/api/tasks',
    // 查询任务详情
    detail: (id: string) => `/api/tasks/${id}`,
    // 查询任务状态（支持 since 参数实现 HTTP 304 优化）
    status: (id: string) => `/api/tasks/${id}/status`,
    // 选择图片生成 3D 模型
    selectImage: (id: string) => `/api/tasks/${id}`,
  },
} as const;

// 默认请求头
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;
