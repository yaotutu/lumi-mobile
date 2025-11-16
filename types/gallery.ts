/**
 * 画廊 API 数据类型定义
 * 基于后端 OpenAPI Schema
 */

// 模型状态
export type ModelStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

// 画廊模型(简化版,用于列表显示)
export interface GalleryModel {
  id: string;
  name: string;
  description?: string | null;
  modelUrl: string;
  previewImageUrl: string;
  format: string;
  fileSize?: number | null;
  faceCount?: number | null;
  vertexCount?: number | null;
  quality?: string | null;
  visibility: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  user?: {
    id: string;
    name: string | null;
  };
}

// API 响应格式
export interface GalleryResponse {
  success: boolean;
  data: {
    models: GalleryModel[];
    total: number;
    hasMore: boolean;
  };
}

// API 错误响应
export interface APIErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

// 查询参数
export interface GalleryQueryParams {
  sortBy?: 'latest' | 'popular';
  limit?: number;
  offset?: number;
}
