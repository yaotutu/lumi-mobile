export interface ModelCardProps {
  modelId: string;
  title: string;
  creator?: string; // 可选,API 可能不返回
  imageUrl: string;
  likes: number;
  onPress?: (modelId: string) => void;
}

export interface CardContentProps {
  title: string;
  creator?: string; // 可选,API 可能不返回
  likes: number;
}

export interface CardActionsProps {
  likes: number;
  onBookmark?: () => void;
}
