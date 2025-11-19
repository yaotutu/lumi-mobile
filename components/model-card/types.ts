export interface ModelCardProps {
	title: string;
	creator: string;
	imageUrl: string;
	likes: number;
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