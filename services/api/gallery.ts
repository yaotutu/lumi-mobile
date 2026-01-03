/**
 * 画廊 API 服务
 */

import { API_ENDPOINTS } from '@/config/api';
import type { GalleryListResponse, GalleryModel, GalleryQueryParams } from '@/types';
import { logger } from '@/utils/logger';
import { apiGet, apiPost } from '../api-client';

/**
 * 获取画廊模型列表
 */
export async function fetchGalleryModels(
  params: GalleryQueryParams = {},
  options?: { signal?: AbortSignal }
): Promise<GalleryListResponse['data']> {
  const { sort = 'latest', limit = 20, offset = 0 } = params;

  const query = new URLSearchParams({
    sort,
    limit: String(limit),
    offset: String(offset),
    ...(params.category ? { category: params.category } : {}),
  });

  const result = await apiGet<GalleryListResponse['data']>(
    `${API_ENDPOINTS.gallery.models}?${query.toString()}`,
    {
      signal: options?.signal,
    }
  );

  if (!result.success) {
    logger.error('获取画廊列表失败:', result.error);
    throw result.error;
  }

  return result.data;
}

/**
 * 获取单个模型详情
 */
export async function fetchModelDetail(id: string): Promise<GalleryModel> {
  const result = await apiGet<GalleryModel>(API_ENDPOINTS.gallery.modelDetail(id));

  if (!result.success) {
    logger.error('获取模型详情失败:', result.error);
    throw result.error;
  }

  return result.data;
}

/**
 * 记录模型下载
 */
export async function recordModelDownload(id: string): Promise<void> {
  try {
    const result = await apiPost<null>(API_ENDPOINTS.gallery.modelDownload(id), {});
    if (!result.success) {
      logger.error('记录下载失败:', result.error);
    }
  } catch (error) {
    logger.error('记录下载失败:', error);
    // 不抛出错误,下载计数失败不应影响用户体验
  }
}

/**
 * 获取我创建的模型列表
 */
export async function fetchMyModels(
  params: GalleryQueryParams = {},
  options?: { signal?: AbortSignal }
): Promise<GalleryListResponse['data']> {
  const { sort = 'latest', limit = 20, offset = 0 } = params;

  const query = new URLSearchParams({
    sort,
    limit: String(limit),
    offset: String(offset),
  });

  const result = await apiGet<GalleryListResponse['data']>(
    `${API_ENDPOINTS.user.myModels}?${query.toString()}`,
    {
      signal: options?.signal,
    }
  );

  if (!result.success) {
    logger.error('获取我的模型列表失败:', result.error);
    throw result.error;
  }

  return result.data;
}

/**
 * 获取我收藏的模型列表
 */
export async function fetchMyFavorites(
  params: GalleryQueryParams = {},
  options?: { signal?: AbortSignal }
): Promise<GalleryListResponse['data']> {
  const { sort = 'latest', limit = 20, offset = 0 } = params;

  const query = new URLSearchParams({
    sort,
    limit: String(limit),
    offset: String(offset),
  });

  const result = await apiGet<GalleryListResponse['data']>(
    `${API_ENDPOINTS.user.myFavorites}?${query.toString()}`,
    {
      signal: options?.signal,
    }
  );

  if (!result.success) {
    logger.error('获取我的收藏列表失败:', result.error);
    throw result.error;
  }

  return result.data;
}

/**
 * 获取我喜欢的模型列表
 */
export async function fetchMyLikes(
  params: GalleryQueryParams = {},
  options?: { signal?: AbortSignal }
): Promise<GalleryListResponse['data']> {
  const { sort = 'latest', limit = 20, offset = 0 } = params;

  const query = new URLSearchParams({
    sort,
    limit: String(limit),
    offset: String(offset),
  });

  const result = await apiGet<GalleryListResponse['data']>(
    `${API_ENDPOINTS.user.myLikes}?${query.toString()}`,
    {
      signal: options?.signal,
    }
  );

  if (!result.success) {
    logger.error('获取我喜欢的列表失败:', result.error);
    throw result.error;
  }

  return result.data;
}
