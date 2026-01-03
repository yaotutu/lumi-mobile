export interface ModelCardProps {
  modelId: string;
  title: string;
  creator?: string; // 可选,API 可能不返回
  imageUrl: string | null; // 图片URL可能为null
  likes: number;
  favorites: number; // 新增：收藏数
  onPress?: (modelId: string) => void;
}

export interface CardContentProps {
  title: string;
  creator?: string; // 可选,API 可能不返回
  likes: number;
}

export interface CardActionsProps {
  likes: number;
  favorites: number; // 新增：收藏数
  isLiked?: boolean; // 新增：是否已点赞
  isFavorited?: boolean; // 新增：是否已收藏
  isLoading?: boolean; // 新增：是否正在操作中
  onLike?: () => void; // 新增：点赞回调
  onFavorite?: () => void; // 新增：收藏回调
}
