import type { GalleryModel } from '@/types';

export interface ModelDetailProps {
  model: GalleryModel;
  onBack?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onDownload?: () => void;
  onAddToQueue?: () => void;
}
