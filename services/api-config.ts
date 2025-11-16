/**
 * API 配置
 */

// 后端 API 基础 URL
export const API_BASE_URL = 'http://192.168.200.97:4000';

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
} as const;

// 默认请求配置
export const DEFAULT_REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 秒超时
};
