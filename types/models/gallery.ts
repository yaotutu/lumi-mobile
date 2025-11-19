/**
 * 画廊模型数据类型
 */

// 模型状态
export type ModelStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

// 用户信息
export interface UserInfo {
  id: string;
  name: string | null;
}

// 画廊模型(用于列表和详情显示)
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
  user?: UserInfo;
}
