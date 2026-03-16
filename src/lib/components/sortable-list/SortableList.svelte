<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils';

	import type { DragState, SortableListProps } from './types';

	import SortableItem from './SortableItem.svelte';

	interface Props extends SortableListProps<T> {
		children: Snippet<[T]>;
		handle?: Snippet;
	}

	let { items, keyFn, onReorder, class: className, disabled = false, dragMode = 'handle', itemClass, children, handle }: Props = $props();

	let dragState = $state<DragState>({
		draggedIndex: null,
		draggedOverIndex: null,
		originalIndex: null
	});

	// Track if we're currently dragging
	let isDragging = $derived(dragState.draggedIndex !== null);

	// Use temporary array during drag, otherwise use original items
	let tempItems = $state.raw<T[]>([]);
	let displayItems = $derived(isDragging ? tempItems : items);

	function resetDragState() {
		dragState.draggedIndex = null;
		dragState.draggedOverIndex = null;
		dragState.originalIndex = null;
	}

	function handleDragStart(e: DragEvent, index: number) {
		if (!e.dataTransfer) return;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', index.toString());

		// Start dragging - copy items to temp array
		tempItems = [...items];
		dragState.draggedIndex = index;
		dragState.originalIndex = index;
	}

	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		e.dataTransfer.dropEffect = 'move';

		if (dragState.draggedIndex === null || dragState.draggedIndex === index) {
			return;
		}

		dragState.draggedOverIndex = index;

		// Perform the reorder in real-time for smooth animation
		const newItems = [...tempItems];
		const draggedItem = newItems[dragState.draggedIndex];
		newItems.splice(dragState.draggedIndex, 1);
		newItems.splice(index, 0, draggedItem);

		tempItems = newItems;
		dragState.draggedIndex = index;
	}

	function handleDragLeave(e: DragEvent) {
		// Only reset if we're actually leaving the item (not just moving to a child element)
		if (e.currentTarget instanceof HTMLElement) {
			if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) {
				dragState.draggedOverIndex = null;
			}
		}
	}

	function handleDrop(e: DragEvent, index: number) {
		e.preventDefault();
		e.stopPropagation();

		if (dragState.draggedIndex === null || dragState.originalIndex === null) return;

		// Call the onReorder callback with the new order and indices
		onReorder?.({
			items: tempItems,
			from: dragState.originalIndex,
			to: index
		});

		resetDragState();
	}

	function handleDragEnd() {
		resetDragState();
	}

	function handleContainerDragOver(e: DragEvent) {
		// Prevent default to allow drop
		e.preventDefault();
		if (!e.dataTransfer) return;
		e.dataTransfer.dropEffect = 'move';
	}
</script>

<div class={cn('space-y-2', className)} role="list" ondragover={handleContainerDragOver}>
	{#each displayItems as item, index (keyFn(item))}
		<SortableItem
			{item}
			{index}
			{disabled}
			{dragMode}
			{itemClass}
			isDragging={dragState.draggedIndex === index}
			isOver={dragState.draggedOverIndex === index && dragState.draggedIndex !== index}
			ondragstart={handleDragStart}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			ondragend={handleDragEnd}
			{handle}
		>
			{@render children(item)}
		</SortableItem>
	{/each}
</div>
