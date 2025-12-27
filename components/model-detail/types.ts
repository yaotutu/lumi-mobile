import type { GalleryModel } from '@/types';

export interface ModelDetailProps {
  model: GalleryModel;
  onBack?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onDownload?: () => void;
  onAddToQueue?: () => void;
  on3DPreview?: () => void;
  /** 是否显示内部浮动头部（默认 true，用于覆盖层场景） */
  showFloatingHeader?: boolean;
}
