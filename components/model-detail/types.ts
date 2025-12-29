import type { GalleryModel } from '@/types';

export interface ModelDetailProps {
  model: GalleryModel;
  onDownload?: () => void;
  onAddToQueue?: () => void;
  on3DPreview?: () => void;
}
