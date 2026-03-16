export interface ReorderEvent<T> {
	items: T[];
	from: number;
	to: number;
}

export interface SortableListProps<T> {
	/**
	 * Array of items to display in the sortable list
	 */
	items: T[];

	/**
	 * Function to extract unique key from each item
	 */
	keyFn: (item: T) => string | number;

	/**
	 * Callback fired when items are reordered
	 */
	onReorder?: (event: ReorderEvent<T>) => void;

	/**
	 * Custom CSS classes for the container
	 */
	class?: string;

	/**
	 * Disable drag-and-drop functionality
	 */
	disabled?: boolean;

	/**
	 * Drag mode: 'handle' shows a grip icon to drag, 'item' makes entire item draggable
	 * @default 'handle'
	 */
	dragMode?: 'handle' | 'item';

	/**
	 * Custom CSS classes for individual items
	 */
	itemClass?: string;
}

export interface DragState {
	draggedIndex: number | null;
	draggedOverIndex: number | null;
	originalIndex: number | null;
}
