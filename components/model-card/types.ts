export interface ModelCardProps {
  modelId: string;
  title: string;
  creator: string;
  imageUrl: string;
  likes: number;
  onPress?: (modelId: string) => void;
}

export interface CardContentProps {
  title: string;
  creator: string;
  likes: number;
}

export interface CardActionsProps {
  likes: number;
  onBookmark?: () => void;
}
