/**
 * 画廊 API 服务
 */

import { API_ENDPOINTS } from '@/config/api';
import type { GalleryListResponse, GalleryModel, GalleryQueryParams } from '@/types';
import { logger } from '@/utils/logger';
import { get, post } from '../http/client';

/**
 * 获取画廊模型列表
 */
export async function fetchGalleryModels(
  params: GalleryQueryParams = {},
  options?: { signal?: AbortSignal }
): Promise<GalleryListResponse> {
  const { sort = 'latest', limit = 20, offset = 0 } = params;

  return get<GalleryListResponse>(
    API_ENDPOINTS.gallery.models,
    {
      sort,
      limit,
      offset,
    },
    options
  );
}

/**
 * 获取单个模型详情
 */
export async function fetchModelDetail(id: string): Promise<GalleryModel> {
  const response = await get<{ status: 'success'; data: GalleryModel }>(
    API_ENDPOINTS.gallery.modelDetail(id)
  );
  return response.data;
}

/**
 * 记录模型下载
 */
export async function recordModelDownload(id: string): Promise<void> {
  try {
    await post(API_ENDPOINTS.gallery.modelDownload(id));
  } catch (error) {
    logger.error('记录下载失败:', error);
    // 不抛出错误,下载计数失败不应影响用户体验
  }
}
