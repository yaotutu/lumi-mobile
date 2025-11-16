/**
 * 画廊 API 服务
 */

import { API_BASE_URL, API_ENDPOINTS } from './api-config';
import type { GalleryResponse, GalleryQueryParams, GalleryModel } from '@/types/gallery';

/**
 * 获取画廊模型列表
 */
export async function fetchGalleryModels(
  params: GalleryQueryParams = {}
): Promise<GalleryResponse> {
  const { sortBy = 'latest', limit = 20, offset = 0 } = params;

  const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.gallery.models}`);
  url.searchParams.append('sortBy', sortBy);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GalleryResponse = await response.json();
    return data;
  } catch (error) {
    console.error('获取画廊模型失败:', error);
    throw error;
  }
}

/**
 * 获取单个模型详情
 */
export async function fetchModelDetail(id: string): Promise<GalleryModel> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.gallery.modelDetail(id)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data as GalleryModel;
  } catch (error) {
    console.error('获取模型详情失败:', error);
    throw error;
  }
}

/**
 * 记录模型下载
 */
export async function recordModelDownload(id: string): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.gallery.modelDownload(id)}`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('记录下载失败:', error);
    // 不抛出错误,下载计数失败不应影响用户体验
  }
}
