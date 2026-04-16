<script lang="ts" generics="T extends ItemType">
	import { tick, type Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';
	import { type CommandInputProps } from 'bits-ui';
	import { VList } from 'virtua/svelte';

	import { ComboBoxGroups } from './combobox-groups.svelte.js';
	import { ComboBoxSearch } from './combobox-search.svelte.js';
	import { ComboBoxSelection } from './combobox-selection.svelte.js';
	import { SIZE_CONFIG, TRIGGER_PADDING } from './size-config.js';
	import { isGroupHeader, type ComboBoxSize, type FlatListItem, type ItemType } from './types.js';

	type SelectionType = 'single' | 'multiple';

	type Props = {
		/** The list of items to display */
		items: T[];
		/** Selection mode */
		type: SelectionType;
		/** Currently selected value(s) - string for single, string[] for multiple */
		value?: string | string[];
		/** Whether the popover is open */
		open?: boolean;
		/** Whether the combobox is disabled */
		disabled?: boolean;
		/** Size variant */
		size?: ComboBoxSize;
		/** Props to pass to the search input */
		inputProps?: CommandInputProps;
		/** Additional class names for the trigger button */
		class?: ClassValue;
		/** Height of the dropdown list */
		listHeight?: string;
		/** Maximum lines for selected tags before collapsing (multiple mode) */
		maxLines?: number;
		/** Custom snippet for rendering each item in the dropdown */
		itemSnippet?: Snippet<[T]>;
		/** Custom snippet for rendering selected items in the trigger (single) or tags (multiple) */
		selectedSnippet?: Snippet<[T]>;
		/** Placeholder text when no item is selected */
		placeholder?: string;
		/** Whether to show the search input */
		searchable?: boolean;
		/** Text for search input placeholder */
		searchPlaceholder?: string;
		/** Text shown when no items match the search */
		emptyText?: string;
		/** Label for the ungrouped items section */
		ungroupedLabel?: string;
		/** Label for "Select all" button */
		selectAllLabel?: string;
		/** Label for "Clear all" button */
		clearAllLabel?: string;
		/** Accessible label for the trigger button */
		'aria-label'?: string;
		/** Callback when value changes - receives string | undefined for single, string[] for multiple */
		onchange?: (value: string | string[] | undefined) => void;
	};

	let {
		items = [],
		type,
		value = $bindable(),
		open = $bindable(false),
		disabled = false,
		size = 'default',
		inputProps,
		listHeight = '220px',
		maxLines = 1,
		class: customClass = '',
		itemSnippet,
		selectedSnippet,
		placeholder = 'Select an item...',
		searchable = true,
		searchPlaceholder = 'Search...',
		emptyText = 'No items found.',
		ungroupedLabel = 'Other',
		selectAllLabel = 'Select all',
		clearAllLabel = 'Clear all',
		'aria-label': ariaLabel,
		onchange
	}: Props = $props();

	// ── Extracted logic ─────────────────────────────────────────────────

	const s = $derived(SIZE_CONFIG[size]);

	const search = new ComboBoxSearch(() => items);

	const groups = new ComboBoxGroups(
		() => items,
		() => search.filteredItems,
		() => ungroupedLabel
	);

	const selection = new ComboBoxSelection(
		() => type,
		() => items,
		() => search.filteredItems,
		() => groups.groupItemsMap,
		{
			onchange: (v) => {
				value = v;
				onchange?.(v);
			},
			onclose: () => closeAndFocusTrigger()
		}
	);

	// Sync $bindable value → selection (when parent changes value externally)
	$effect(() => {
		selection.value = value;
	});

	// ── Tag overflow measurement (DOM-coupled, stays here) ──────────────

	let triggerRef = $state<HTMLButtonElement | null>(null);
	let measureContainerRef = $state<HTMLDivElement | null>(null);
	let tagsContainerRef = $state<HTMLDivElement | null>(null);
	let visibleCount = $state<number>(Infinity);
	let triggerWidth = $state(0);
	let measuredLineHeight = $state(0);
	let measuredGap = $state(4);

	const tagMaxWidth = $derived(Math.max(100, triggerWidth - TRIGGER_PADDING[size]));
	const visibleTags = $derived(selection.selectedValues.slice(0, visibleCount));
	const hiddenCount = $derived(Math.max(0, selection.selectedValues.length - visibleCount));
	const containerMaxHeight = $derived(
		measuredLineHeight > 0 ? `${maxLines * measuredLineHeight + Math.max(0, maxLines - 1) * measuredGap}px` : undefined
	);

	const MEASURE_TAGS_PER_LINE = 20;
	const measureCap = $derived((maxLines + 1) * MEASURE_TAGS_PER_LINE);
	const measureTags = $derived(selection.selectedValues.slice(0, measureCap));

	function calculateVisibleTags() {
		if (!measureContainerRef || selection.selectedValues.length === 0) {
			visibleCount = Infinity;
			return;
		}

		const tags = Array.from(measureContainerRef.querySelectorAll('[data-measure-tag]')) as HTMLElement[];
		if (tags.length === 0) {
			visibleCount = Infinity;
			return;
		}

		const moreIndicator = measureContainerRef.querySelector('[data-measure-more]') as HTMLElement;
		const gap = parseFloat(getComputedStyle(measureContainerRef).gap) || 4;
		const lineHeight = tags[0].offsetHeight;
		const indicatorWidth = moreIndicator?.offsetWidth ?? 60;
		const containerWidth = measureContainerRef.offsetWidth;

		measuredLineHeight = lineHeight;
		measuredGap = gap;

		let currentLineTop = tags[0].offsetTop;
		let currentLine = 1;
		let lastValidIndex = 0;

		for (let i = 0; i < tags.length; i++) {
			const tag = tags[i];

			if (tag.offsetTop > currentLineTop + lineHeight / 2) {
				currentLine++;
				currentLineTop = tag.offsetTop;
			}

			if (currentLine > maxLines) {
				break;
			}

			const isLastTag = i === tags.length - 1;
			const rightEdge = tag.offsetLeft + tag.offsetWidth;
			const remainingItems = tags.length - (i + 1);

			if (isLastTag && remainingItems === 0) {
				lastValidIndex = tags.length;
			} else if (currentLine < maxLines) {
				lastValidIndex = i + 1;
			} else {
				const hasRoomForIndicator = containerWidth - rightEdge - gap >= indicatorWidth;
				if (hasRoomForIndicator) {
					lastValidIndex = i + 1;
				}
			}
		}

		visibleCount = Math.max(1, lastValidIndex);
	}

	$effect(() => {
		if (!triggerRef) return;

		const resizeObserver = new ResizeObserver((entries) => {
			triggerWidth = entries[0]?.contentRect.width ?? 0;
		});
		resizeObserver.observe(triggerRef);

		return () => resizeObserver.disconnect();
	});

	$effect(() => {
		void selection.selectedValues.length;

		if (!measureContainerRef) return;

		const rafId = requestAnimationFrame(() => calculateVisibleTags());

		const resizeObserver = new ResizeObserver(() => calculateVisibleTags());
		resizeObserver.observe(measureContainerRef);

		return () => {
			cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
		};
	});

	$effect(() => {
		if (!tagsContainerRef || visibleCount === Infinity || selection.selectedValues.length === 0) return;
		void visibleCount;

		const rafId = requestAnimationFrame(() => {
			if (!tagsContainerRef) return;
			const children = Array.from(tagsContainerRef.children) as HTMLElement[];
			if (children.length < 2) return;

			const firstTop = children[0].offsetTop;
			const threshold = firstTop + children[0].offsetHeight * 0.5;

			for (let i = children.length - 1; i >= 1; i--) {
				if (children[i].offsetTop > threshold) {
					visibleCount = Math.max(1, visibleCount - 1);
					return;
				}
			}
		});

		return () => cancelAnimationFrame(rafId);
	});

	// ── Event handlers (DOM-coupled wrappers) ───────────────────────────

	function closeAndFocusTrigger() {
		open = false;
		search.reset();
		tick().then(() => triggerRef?.focus());
	}

	function handleRemoveItem(itemValue: string, e: Event) {
		e.stopPropagation();
		selection.removeItem(itemValue);
		tick().then(() => triggerRef?.focus());
	}

	function handleClearAll(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		selection.clearAll();
		tick().then(() => triggerRef?.focus());
	}

	function handleClearFiltered(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		selection.clearFiltered();
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'Backspace' && !open && selection.handleBackspace()) {
			e.preventDefault();
		}
	}
</script>

{#snippet itemRow(item: FlatListItem<T>)}
	{#if isGroupHeader(item)}
		<div class={cn('flex items-center justify-between', s.groupHeader)}>
			<span class={cn('font-semibold text-muted-foreground', s.groupText)}>{item.group}</span>
			{#if type === 'multiple'}
				<div class="flex gap-2">
					<button
						type="button"
						class={cn(
							'cursor-pointer rounded font-medium text-foreground underline-offset-2 hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default disabled:text-muted-foreground disabled:no-underline disabled:opacity-50',
							s.groupText
						)}
						aria-label={`Select all in ${item.group}`}
						disabled={selection.isGroupAllSelected(item.group)}
						onclick={() => selection.selectGroup(item.group)}
					>
						{selectAllLabel}
					</button>
					<button
						type="button"
						class={cn(
							'cursor-pointer rounded font-medium text-foreground underline-offset-2 hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default disabled:text-muted-foreground disabled:no-underline disabled:opacity-50',
							s.groupText
						)}
						aria-label={`Clear ${item.group}`}
						disabled={!selection.isGroupSomeSelected(item.group)}
						onclick={() => selection.clearGroup(item.group)}
					>
						{clearAllLabel}
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<Command.Item value={item.value} disabled={item.disabled} onSelect={() => selection.handleItemSelect(item.value)} title={item.label}>
			<CheckIcon class={cn(!selection.isSelected(item.value) && 'text-transparent')} />
			{#if itemSnippet}
				{@render itemSnippet(item)}
			{:else}
				<span class="min-w-0 flex-1 truncate">{item.label}</span>
			{/if}
		</Command.Item>
	{/if}
{/snippet}

<Popover.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) search.reset();
	}}
>
	<Popover.Trigger bind:ref={triggerRef} {disabled}>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				class={cn(
					'relative w-full min-w-32 cursor-pointer justify-between',
					s.text,
					type === 'multiple' && selection.selectedValues.length > 0 ? s.triggerMulti : s.trigger,
					disabled && 'pointer-events-none opacity-50',
					customClass
				)}
				role="combobox"
				aria-expanded={open}
				aria-label={ariaLabel ?? placeholder}
				onkeydown={handleTriggerKeydown}
				{disabled}
			>
				{#if type === 'single'}
					{#if selection.selectedItem && selectedSnippet}
						<span class="min-w-0 flex-1 truncate text-left">{@render selectedSnippet(selection.selectedItem)}</span>
					{:else}
						<span class="min-w-0 flex-1 truncate text-left">{selection.selectedLabel || placeholder}</span>
					{/if}
				{:else if selection.selectedValues.length > 0}
					<div
						bind:this={measureContainerRef}
						class={cn('pointer-events-none absolute inset-y-0 flex flex-wrap content-start items-start opacity-0', s.measureContainer)}
						aria-hidden="true"
					>
						{#each measureTags as tag (tag.value)}
							<span
								data-measure-tag
								class={cn('inline-flex items-center bg-secondary font-medium', s.tag)}
								style:max-width="{tagMaxWidth}px"
							>
								{#if selectedSnippet}
									<span class="truncate">{@render selectedSnippet(tag)}</span>
								{:else}
									<span class="truncate">{tag.label}</span>
								{/if}
								<span class={cn('shrink-0', s.tagSpacer)}></span>
							</span>
						{/each}
						<span data-measure-more class={cn('inline-flex items-center gap-0.5 rounded-md bg-secondary font-medium', s.more)}>
							+99 more
						</span>
					</div>
					<!-- Visible tags container -->
					<div
						bind:this={tagsContainerRef}
						class={cn('flex flex-1 flex-wrap content-start items-start overflow-hidden', s.tagContainer)}
						style:max-height={containerMaxHeight}
					>
						{#each visibleTags as tag (tag.value)}
							<span
								class={cn('inline-flex items-center bg-secondary font-medium text-secondary-foreground', s.tag)}
								style:max-width="{tagMaxWidth}px"
								title={tag.label}
							>
								{#if selectedSnippet}
									<span class="truncate">{@render selectedSnippet(tag)}</span>
								{:else}
									<span class="truncate">{tag.label}</span>
								{/if}
								{#if !tag.disabled}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										class={cn('shrink-0 cursor-pointer hover:ring-1 hover:ring-border', s.tagRemoveBtn)}
										onclick={(e) => handleRemoveItem(tag.value, e)}
									>
										<XIcon class={s.tagRemoveIcon} />
										<span class="sr-only">Remove {tag.label}</span>
									</Button>
								{/if}
							</span>
						{/each}
						{#if hiddenCount > 0}
							<span class={cn('inline-flex items-center gap-0.5 rounded-md bg-secondary font-medium text-secondary-foreground', s.more)}>
								+{hiddenCount} more
							</span>
						{/if}
					</div>
				{:else}
					<span class="truncate">{placeholder}</span>
				{/if}
				<div class="flex shrink-0 items-center gap-1">
					{#if selection.hasClearableSelection}
						<Button type="button" variant="ghost" size="icon" class={cn('hover:bg-muted', s.clearBtn)} onclick={handleClearAll}>
							<XIcon class={s.clearIcon} />
							<span class="sr-only">{clearAllLabel}</span>
						</Button>
					{/if}
					<ChevronsUpDownIcon class={cn('shrink-0 opacity-50', s.chevron)} />
				</div>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content onCloseAutoFocus={(e) => e.preventDefault()} class="w-(--bits-popover-anchor-width) p-0">
			<Command.Root shouldFilter={false}>
				{#if searchable}
					<Command.Input placeholder={searchPlaceholder} bind:value={search.searchValue} {...inputProps} />
				{/if}
				{#if type === 'multiple' && search.filteredItems.length > 0}
					<div class={cn('flex items-center justify-between border-b', s.statusBar)}>
						<span class={cn('text-muted-foreground', s.statusText)}>
							{selection.selectedValues.length} of {items.length} selected
						</span>
						<div class="flex gap-1">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class={s.actionBtn}
								disabled={selection.allFilteredSelected}
								onclick={() => selection.selectAllFiltered()}
							>
								{selectAllLabel}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class={s.actionBtn}
								disabled={!selection.someFilteredSelected}
								onclick={handleClearFiltered}
							>
								{search.isSearching ? 'Clear filtered' : clearAllLabel}
							</Button>
						</div>
					</div>
				{/if}
				<Command.List
					class={cn(searchable ? 'overflow-hidden' : 'overflow-y-auto', 'px-1')}
					style={searchable
						? `max-height: ${listHeight}`
						: `max-height: min(${listHeight}, var(--bits-popover-content-available-height, ${listHeight}))`}
				>
					<Command.Empty>{emptyText}</Command.Empty>
					<Command.Group>
						{#if searchable}
							<VList
								data={groups.flatList}
								style="height: {listHeight}"
								getKey={(item: FlatListItem<T>) => (isGroupHeader(item) ? `__group__${item.group}` : item.value)}
							>
								{#snippet children(item: FlatListItem<T>)}
									{@render itemRow(item)}
								{/snippet}
							</VList>
						{:else}
							{#each groups.flatList as item (isGroupHeader(item) ? `__group__${item.group}` : item.value)}
								{@render itemRow(item)}
							{/each}
						{/if}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
