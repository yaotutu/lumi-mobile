/**
 * 画廊 API 类型定义
 */

import type { GalleryModel } from "../models/gallery";
import type { APIResponse, PaginatedData } from "./common";

// 画廊列表响应
export interface GalleryListResponse extends APIResponse {
	data: {
		models: GalleryModel[];
		total: number;
		hasMore: boolean;
	};
}

// 画廊查询参数
export interface GalleryQueryParams {
	sortBy?: "latest" | "popular";
	limit?: number;
	offset?: number;
}

// 画廊模型详情响应
export type GalleryDetailResponse = APIResponse<GalleryModel>;
