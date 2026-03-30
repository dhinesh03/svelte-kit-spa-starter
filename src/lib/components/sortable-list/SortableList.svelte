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
		originalIndex: null
	});

	let isDragging = $derived(dragState.draggedIndex !== null);
	let tempItems = $state.raw<T[]>([]);
	let displayItems = $derived(isDragging ? tempItems : items);

	let keyboardGrabIndex = $state<number | null>(null);

	function resetDragState() {
		dragState.draggedIndex = null;
		dragState.originalIndex = null;
	}

	function handleDragStart(e: DragEvent, index: number) {
		if (!e.dataTransfer) return;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', index.toString());

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

		const newItems = [...tempItems];
		const draggedItem = newItems[dragState.draggedIndex];
		newItems.splice(dragState.draggedIndex, 1);
		newItems.splice(index, 0, draggedItem);

		tempItems = newItems;
		dragState.draggedIndex = index;
	}

	function handleDragLeave(_e: DragEvent) {
		// no-op: live reorder is handled in handleDragOver
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();

		if (dragState.draggedIndex === null || dragState.originalIndex === null) return;

		onReorder?.({
			items: tempItems,
			from: dragState.originalIndex,
			to: dragState.draggedIndex
		});

		resetDragState();
	}

	function handleDragEnd() {
		if (dragState.originalIndex === null) return;
		resetDragState();
	}

	function handleContainerDragOver(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		e.dataTransfer.dropEffect = 'move';
	}

	let liveMessage = $state('');

	function commitKeyboardReorder(fromIndex: number, toIndex: number) {
		if (!onReorder) {
			keyboardGrabIndex = null;
			return;
		}

		const newItems = [...items];
		const [moved] = newItems.splice(fromIndex, 1);
		newItems.splice(toIndex, 0, moved);

		onReorder({
			items: newItems,
			from: fromIndex,
			to: toIndex
		});

		liveMessage = `Item moved to position ${toIndex + 1} of ${items.length}`;
	}

	function handleKeyDown(e: KeyboardEvent, index: number) {
		if (disabled) return;

		if (keyboardGrabIndex === null) {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				keyboardGrabIndex = index;
				liveMessage = `Grabbed item at position ${index + 1} of ${items.length}. Use arrow keys to move.`;
			}
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			liveMessage = 'Reorder cancelled';
			keyboardGrabIndex = null;
			return;
		}

		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			liveMessage = `Item dropped at position ${keyboardGrabIndex + 1} of ${items.length}`;
			keyboardGrabIndex = null;
			return;
		}

		if (e.key === 'ArrowUp' && keyboardGrabIndex > 0) {
			e.preventDefault();
			const from = keyboardGrabIndex;
			const to = from - 1;
			commitKeyboardReorder(from, to);
			keyboardGrabIndex = to;
		}

		if (e.key === 'ArrowDown' && keyboardGrabIndex < items.length - 1) {
			e.preventDefault();
			const from = keyboardGrabIndex;
			const to = from + 1;
			commitKeyboardReorder(from, to);
			keyboardGrabIndex = to;
		}
	}
</script>

<div aria-live="assertive" class="sr-only">{liveMessage}</div>
<div
	class={cn('space-y-2', isDragging && 'cursor-grabbing', className)}
	role="list"
	aria-label={disabled ? 'Sortable list (disabled)' : undefined}
	ondragover={handleContainerDragOver}
>
	{#each displayItems as item, index (keyFn(item))}
		<SortableItem
			{item}
			{index}
			{disabled}
			{dragMode}
			{itemClass}
			isDragging={dragState.draggedIndex === index}
			listIsDragging={isDragging}
			isGrabbed={keyboardGrabIndex === index}
			ondragstart={handleDragStart}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			ondragend={handleDragEnd}
			onkeydown={handleKeyDown}
			{handle}
		>
			{@render children(item)}
		</SortableItem>
	{/each}
</div>
