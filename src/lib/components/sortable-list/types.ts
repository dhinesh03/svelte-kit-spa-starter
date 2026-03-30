export interface ReorderEvent<T> {
	items: T[];
	from: number;
	to: number;
}

export interface SortableListProps<T> {
	items: T[];
	keyFn: (item: T) => string | number;
	onReorder?: (event: ReorderEvent<T>) => void;
	class?: string;
	disabled?: boolean;
	dragMode?: 'handle' | 'item';
	itemClass?: string;
}

export interface DragState {
	draggedIndex: number | null;
	originalIndex: number | null;
}
