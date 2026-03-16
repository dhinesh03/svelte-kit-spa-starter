<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils';
	import { GripVertical } from '@lucide/svelte';

	interface Props {
		item: T;
		index: number;
		isDragging: boolean;
		isOver: boolean;
		disabled?: boolean;
		dragMode: 'handle' | 'item';
		itemClass?: string;
		ondragstart: (e: DragEvent, index: number) => void;
		ondragover: (e: DragEvent, index: number) => void;
		ondragleave: (e: DragEvent) => void;
		ondrop: (e: DragEvent, index: number) => void;
		ondragend: () => void;
		children: Snippet<[T]>;
		handle?: Snippet;
	}

	let {
		item,
		index,
		isDragging,
		isOver,
		disabled = false,
		dragMode,
		itemClass,
		ondragstart,
		ondragover,
		ondragleave,
		ondrop,
		ondragend,
		children,
		handle
	}: Props = $props();

	function handleDragStart(e: DragEvent) {
		if (disabled) return;
		ondragstart(e, index);
	}

	function handleDragOver(e: DragEvent) {
		if (disabled) return;
		ondragover(e, index);
	}

	function handleDrop(e: DragEvent) {
		if (disabled) return;
		ondrop(e, index);
	}

	function handleDragLeave(e: DragEvent) {
		if (disabled) return;
		ondragleave(e);
	}

	// Attachment to make the parent draggable when handle is pressed
	function dragHandle(node: HTMLButtonElement) {
		if (dragMode !== 'handle') return;

		const handlePointerDown = () => {
			const parentDiv = node.closest('[role="listitem"]') as HTMLDivElement;
			if (parentDiv) {
				parentDiv.draggable = true;
			}
		};

		const handlePointerUp = () => {
			const parentDiv = node.closest('[role="listitem"]') as HTMLDivElement;
			if (parentDiv) {
				parentDiv.draggable = false;
			}
		};

		node.addEventListener('pointerdown', handlePointerDown);
		node.addEventListener('pointerup', handlePointerUp);

		return () => {
			node.removeEventListener('pointerdown', handlePointerDown);
			node.removeEventListener('pointerup', handlePointerUp);
		};
	}
</script>

<div
	draggable={dragMode === 'item' && !disabled}
	ondragstart={handleDragStart}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	{ondragend}
	class={cn(
		'group relative flex items-center gap-3 rounded-lg border bg-card p-2 transition-all duration-200',
		isDragging && 'scale-95 opacity-40',
		isOver && !isDragging && 'border-primary ring-2 ring-primary/20',
		!disabled && 'hover:shadow-md',
		disabled && 'cursor-not-allowed opacity-60',
		itemClass
	)}
	role="listitem"
	aria-roledescription="sortable item"
>
	{#if dragMode === 'handle'}
		<button
			{@attach dragHandle}
			type="button"
			{disabled}
			class={cn(
				'cursor-grab touch-none text-muted-foreground transition-colors active:cursor-grabbing',
				!disabled && 'hover:text-foreground',
				disabled && 'cursor-not-allowed'
			)}
			aria-label="Drag handle"
		>
			{#if handle}
				{@render handle()}
			{:else}
				<GripVertical class="h-5 w-5" />
			{/if}
		</button>
	{/if}

	<div class={cn('flex-1', dragMode === 'item' && !disabled && 'cursor-grab active:cursor-grabbing')}>
		{@render children(item)}
	</div>
</div>
