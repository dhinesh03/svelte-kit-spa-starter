<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils';
	import { GripVertical } from '@lucide/svelte';

	interface Props {
		item: T;
		index: number;
		isDragging: boolean;
		isGrabbed: boolean;
		listIsDragging: boolean;
		disabled?: boolean;
		dragMode: 'handle' | 'item';
		itemClass?: string;
		ondragstart: (e: DragEvent, index: number) => void;
		ondragover: (e: DragEvent, index: number) => void;
		ondragleave: (e: DragEvent) => void;
		ondrop: (e: DragEvent) => void;
		ondragend: () => void;
		onkeydown: (e: KeyboardEvent, index: number) => void;
		children: Snippet<[T]>;
		handle?: Snippet;
	}

	let {
		item,
		index,
		isDragging,
		isGrabbed,
		listIsDragging,
		disabled = false,
		dragMode,
		itemClass,
		ondragstart,
		ondragover,
		ondragleave,
		ondrop,
		ondragend,
		onkeydown,
		children,
		handle
	}: Props = $props();

	let containerEl = $state<HTMLDivElement | undefined>(undefined);

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
		ondrop(e);
	}

	function handleDragLeave(e: DragEvent) {
		if (disabled) return;
		ondragleave(e);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		onkeydown(e, index);
	}

	function dragHandle(node: HTMLButtonElement) {
		if (dragMode !== 'handle') return () => {};

		const setDraggable = (value: boolean) => {
			if (containerEl) containerEl.draggable = value;
		};

		const handlePointerDown = () => setDraggable(true);
		const handlePointerUp = () => setDraggable(false);
		const handlePointerCancel = () => setDraggable(false);

		node.addEventListener('pointerdown', handlePointerDown);
		node.addEventListener('pointerup', handlePointerUp);
		node.addEventListener('pointercancel', handlePointerCancel);

		return () => {
			node.removeEventListener('pointerdown', handlePointerDown);
			node.removeEventListener('pointerup', handlePointerUp);
			node.removeEventListener('pointercancel', handlePointerCancel);
		};
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	bind:this={containerEl}
	draggable={dragMode === 'item' && !disabled}
	tabindex={dragMode === 'item' && !disabled ? 0 : undefined}
	ondragstart={handleDragStart}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	{ondragend}
	onkeydown={dragMode === 'item' ? handleKeyDown : undefined}
	class={cn(
		'group relative flex items-center gap-3 rounded-lg border bg-card p-2 transition-all duration-200',
		isDragging && 'scale-95 opacity-40',
		isGrabbed && 'border-primary ring-2 ring-primary/20',
		!disabled && 'hover:shadow-md',
		disabled && 'cursor-not-allowed opacity-60',
		itemClass
	)}
	role="listitem"
	aria-roledescription="sortable item"
	aria-label={dragMode === 'item' && isGrabbed ? 'Grabbed. Use arrow keys to move, Enter or Space to drop, Escape to cancel' : undefined}
	data-disabled={disabled || undefined}
>
	{#if dragMode === 'handle'}
		<button
			{@attach dragHandle}
			type="button"
			{disabled}
			class={cn(
				'touch-none text-muted-foreground transition-colors',
				listIsDragging ? 'cursor-grabbing' : 'cursor-grab',
				!disabled && 'hover:text-foreground',
				disabled && 'cursor-not-allowed',
				isGrabbed && 'text-primary'
			)}
			aria-label={isGrabbed
				? 'Grabbed. Use arrow keys to move, Enter or Space to drop, Escape to cancel'
				: 'Drag handle. Press Space or Enter to grab'}
			aria-pressed={isGrabbed}
			onkeydown={handleKeyDown}
		>
			{#if handle}
				{@render handle()}
			{:else}
				<GripVertical class="h-5 w-5" />
			{/if}
		</button>
	{/if}

	<div class={cn('flex-1', dragMode === 'item' && !disabled && (listIsDragging ? 'cursor-grabbing' : 'cursor-grab'))}>
		{@render children(item)}
	</div>
</div>
