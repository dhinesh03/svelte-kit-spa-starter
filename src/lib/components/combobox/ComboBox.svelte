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
	import Fuse from 'fuse.js';
	import { VList } from 'virtua/svelte';

	import { isGroupHeader, type ComboBoxSize, type FlatListItem, type GroupHeaderItem, type ItemType } from './types.js';

	type SelectionType = 'single' | 'multiple';

	// ── Size configuration ───────────────────────────────────────────────

	const SIZE_CONFIG = {
		xs: {
			trigger: 'h-7',
			triggerMulti: 'h-auto min-h-7 py-1',
			text: 'text-xs',
			tag: 'gap-0.5 rounded px-1 py-0 text-[10px]',
			tagSpacer: 'size-3',
			tagRemoveBtn: 'size-3',
			tagRemoveIcon: 'size-2',
			more: 'px-1.5 py-0 text-[10px]',
			clearBtn: 'size-4 rounded-sm',
			clearIcon: 'size-2.5',
			chevron: 'size-3',
			statusBar: 'px-2 py-1',
			statusText: 'text-[10px]',
			actionBtn: 'h-5 px-1.5 text-[10px]',
			groupHeader: 'px-2 py-1',
			groupText: 'text-[10px]',
			measureContainer: 'right-12 left-3 gap-0.5 py-1',
			tagContainer: 'gap-0.5'
		},
		sm: {
			trigger: 'h-8',
			triggerMulti: 'h-auto min-h-8 py-1',
			text: 'text-sm',
			tag: 'gap-0.5 rounded-md px-1 py-0.5 text-xs',
			tagSpacer: 'size-3.5',
			tagRemoveBtn: 'size-3.5',
			tagRemoveIcon: 'size-2',
			more: 'px-1.5 py-0.5 text-xs',
			clearBtn: 'size-4 rounded-sm',
			clearIcon: 'size-2.5',
			chevron: 'size-3.5',
			statusBar: 'px-2 py-1',
			statusText: 'text-xs',
			actionBtn: 'h-5 px-1.5 text-xs',
			groupHeader: 'px-2 py-1',
			groupText: 'text-xs',
			measureContainer: 'right-14 left-3 gap-0.5 py-1',
			tagContainer: 'gap-0.5'
		},
		default: {
			trigger: 'h-9',
			triggerMulti: 'h-auto min-h-10 py-2',
			text: 'text-sm',
			tag: 'gap-0.5 rounded-md px-1 py-0.5 text-xs',
			tagSpacer: 'size-4',
			tagRemoveBtn: 'size-4',
			tagRemoveIcon: 'size-2.5',
			more: 'px-2 py-0.5 text-xs',
			clearBtn: 'size-5 rounded-sm',
			clearIcon: 'size-3',
			chevron: 'size-4',
			statusBar: 'px-2 py-1.5',
			statusText: 'text-xs',
			actionBtn: 'h-6 px-2 text-xs',
			groupHeader: 'px-2 py-1.5',
			groupText: 'text-xs',
			measureContainer: 'right-16 left-4 gap-1 py-2',
			tagContainer: 'gap-1'
		},
		lg: {
			trigger: 'h-10',
			triggerMulti: 'h-auto min-h-10 py-2',
			text: 'text-base',
			tag: 'gap-1 rounded-md px-1.5 py-0.5 text-sm',
			tagSpacer: 'size-4',
			tagRemoveBtn: 'size-4',
			tagRemoveIcon: 'size-3',
			more: 'px-2 py-0.5 text-sm',
			clearBtn: 'size-5 rounded-sm',
			clearIcon: 'size-3',
			chevron: 'size-4',
			statusBar: 'px-2 py-2',
			statusText: 'text-sm',
			actionBtn: 'h-6 px-2 text-sm',
			groupHeader: 'px-2 py-2',
			groupText: 'text-sm',
			measureContainer: 'right-16 left-4 gap-1 py-2',
			tagContainer: 'gap-1'
		}
	} as const satisfies Record<ComboBoxSize, Record<string, string>>;

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
		/** Callback when value changes */
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
		searchPlaceholder = 'Search...',
		emptyText = 'No items found.',
		ungroupedLabel = 'Other',
		selectAllLabel = 'Select all',
		clearAllLabel = 'Clear all',
		'aria-label': ariaLabel,
		onchange
	}: Props = $props();

	const s = $derived(SIZE_CONFIG[size]);

	let triggerRef = $state<HTMLButtonElement | null>(null);
	let measureContainerRef = $state<HTMLDivElement | null>(null);
	let visibleCount = $state<number>(Infinity);
	let triggerWidth = $state(0);

	// Calculate tag max-width: trigger width minus padding (left: 12px, right: 36px for chevron) minus 20px buffer
	const tagMaxWidth = $derived(Math.max(100, triggerWidth - 68));

	// O(1) selection lookup
	const selectedLookup = $derived.by(() => {
		const lookup = Object.create(null) as Record<string, true>;
		if (type === 'multiple' && Array.isArray(value)) {
			for (const v of value) lookup[v] = true;
		}
		return lookup;
	});

	function isSelected(itemValue: string): boolean {
		if (type === 'single') return value === itemValue;
		return selectedLookup[itemValue] === true;
	}

	// Handle both single and multiple selection types
	const selectedItem = $derived(type === 'single' ? items.find((f) => f.value === value) : undefined);
	const selectedValue = $derived(selectedItem?.label);

	const selectedValues = $derived.by(() => {
		if (type === 'multiple' && Array.isArray(value) && value.length > 0) {
			const itemLookup = Object.create(null) as Record<string, T>;
			for (const item of items) itemLookup[item.value] = item;
			return value.map((v) => itemLookup[v]).filter((item): item is T => item != null);
		}
		return [];
	});

	const visibleTags = $derived(selectedValues.slice(0, visibleCount));
	const hiddenCount = $derived(Math.max(0, selectedValues.length - visibleCount));

	// Cap measurement to avoid rendering all tags in the hidden container.
	// We only need enough to fill maxLines + 1 extra row to detect overflow.
	// Estimate ~20 tags per line as a generous upper bound.
	const MEASURE_TAGS_PER_LINE = 20;
	const measureCap = $derived((maxLines + 1) * MEASURE_TAGS_PER_LINE);
	const measureTags = $derived(selectedValues.slice(0, measureCap));

	// ── Tag measurement ──────────────────────────────────────────────────

	function calculateVisibleTags() {
		if (!measureContainerRef || selectedValues.length === 0) {
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

		let currentLineTop = tags[0].offsetTop;
		let currentLine = 1;
		let lastValidIndex = 1; // Always show at least one tag

		for (let i = 0; i < tags.length; i++) {
			const tag = tags[i];

			// Check if tag wrapped to new line
			if (tag.offsetTop > currentLineTop + lineHeight / 2) {
				currentLine++;
				currentLineTop = tag.offsetTop;
			}

			// Exceeded maxLines - use last valid index
			if (currentLine > maxLines) {
				break;
			}

			// Last tag fits within maxLines - show all (no indicator needed)
			if (i === tags.length - 1) {
				lastValidIndex = tags.length;
				break;
			}

			// Check if "+N more" indicator would fit after this tag on the same line
			const rightEdge = tag.offsetLeft + tag.offsetWidth;
			const hasRoomForIndicator = containerWidth - rightEdge - gap >= indicatorWidth;

			// On last allowed line, only valid if indicator fits; otherwise always valid
			if (currentLine < maxLines || hasRoomForIndicator) {
				lastValidIndex = i + 1;
			}
		}

		visibleCount = lastValidIndex;
	}

	// Track trigger width for dynamic tag max-width
	$effect(() => {
		if (!triggerRef) return;

		const resizeObserver = new ResizeObserver((entries) => {
			triggerWidth = entries[0]?.contentRect.width ?? 0;
		});
		resizeObserver.observe(triggerRef);

		return () => resizeObserver.disconnect();
	});

	// Recalculate when selected values change or container resizes
	$effect(() => {
		// Track dependency on selectedValues
		void selectedValues.length;

		if (!measureContainerRef) return;

		const rafId = requestAnimationFrame(() => calculateVisibleTags());

		const resizeObserver = new ResizeObserver(() => calculateVisibleTags());
		resizeObserver.observe(measureContainerRef);

		return () => {
			cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
		};
	});

	// ── Search ────────────────────────────────────────────────────────────

	let searchValue = $state('');

	const fuse = $derived(
		new Fuse(items, {
			keys: ['label', 'keywords'],
			threshold: 0.3,
			ignoreLocation: true
		})
	);

	const filteredItems = $derived.by(() => {
		if (!searchValue.trim()) return items;
		return fuse.search(searchValue.trim()).map((result) => result.item);
	});

	const isSearching = $derived(searchValue.trim().length > 0);

	// ── Group data (cached) ───────────────────────────────────────────────

	const hasGroups = $derived(items.some((item) => item.group));

	// Pre-compute group → items mapping from filtered items
	const groupItemsMap = $derived.by(() => {
		const map = Object.create(null) as Record<string, T[]>;
		for (const item of filteredItems) {
			const key = item.group || ungroupedLabel;
			if (!map[key]) map[key] = [];
			map[key].push(item);
		}
		return map;
	});

	// Stable group order derived from original items (not affected by search filtering)
	const stableGroupOrder = $derived.by(() => {
		const order: string[] = [];
		const seen = Object.create(null) as Record<string, true>;
		for (const item of items) {
			if (item.group && !seen[item.group]) {
				seen[item.group] = true;
				order.push(item.group);
			}
		}
		return order;
	});

	// Create a flat list with group headers for virtualized rendering
	const flatListWithGroups = $derived.by<FlatListItem<T>[]>(() => {
		if (!hasGroups) return filteredItems;

		const hasUngrouped = filteredItems.some((item) => !item.group);

		const result: FlatListItem<T>[] = [];

		for (const groupName of stableGroupOrder) {
			const groupItems = groupItemsMap[groupName];
			if (groupItems && groupItems.length > 0) {
				result.push({ _isGroupHeader: true, group: groupName } as GroupHeaderItem);
				result.push(...groupItems);
			}
		}

		if (hasUngrouped) {
			const ungroupedItems = groupItemsMap[ungroupedLabel];
			if (ungroupedItems && ungroupedItems.length > 0) {
				if (result.length > 0) {
					result.push({ _isGroupHeader: true, group: ungroupedLabel } as GroupHeaderItem);
				}
				result.push(...ungroupedItems);
			}
		}

		return result;
	});

	// ── Selection actions ─────────────────────────────────────────────────

	function closeAndFocusTrigger() {
		open = false;
		searchValue = '';
		tick().then(() => triggerRef?.focus());
	}

	function handleItemSelect(itemValue: string) {
		if (type === 'single') {
			value = itemValue;
			onchange?.(value);
			closeAndFocusTrigger();
		} else {
			const currentValues = Array.isArray(value) ? value : [];
			if (selectedLookup[itemValue]) {
				value = currentValues.filter((v) => v !== itemValue);
			} else {
				value = [...currentValues, itemValue];
			}
			onchange?.(value);
		}
	}

	function removeItem(itemValue: string, e: Event) {
		e.stopPropagation();
		if (Array.isArray(value)) {
			value = value.filter((v) => v !== itemValue);
			onchange?.(value);
		}
		tick().then(() => triggerRef?.focus());
	}

	function clearAll(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (type === 'multiple') {
			value = [];
		} else {
			value = undefined;
		}
		onchange?.(value);
		tick().then(() => triggerRef?.focus());
	}

	function selectAllFiltered() {
		if (type !== 'multiple') return;
		const currentValues = Array.isArray(value) ? value : [];
		const toAdd = filteredItems.filter((item) => !selectedLookup[item.value]).map((item) => item.value);
		value = [...currentValues, ...toAdd];
		onchange?.(value);
	}

	function clearFiltered(e: Event) {
		e.stopPropagation();
		if (type !== 'multiple' || !Array.isArray(value)) return;
		const filteredLookup = Object.create(null) as Record<string, true>;
		for (const item of filteredItems) filteredLookup[item.value] = true;
		value = value.filter((v) => !filteredLookup[v]);
		onchange?.(value);
	}

	const allFilteredSelected = $derived.by(() => {
		if (type !== 'multiple' || filteredItems.length === 0) return false;
		return filteredItems.every((item) => selectedLookup[item.value] === true);
	});

	const someFilteredSelected = $derived.by(() => {
		if (type !== 'multiple' || filteredItems.length === 0) return false;
		return filteredItems.some((item) => selectedLookup[item.value] === true);
	});

	// ── Group-level selection ─────────────────────────────────────────────

	function getGroupItems(groupName: string): T[] {
		return groupItemsMap[groupName] ?? [];
	}

	function isGroupAllSelected(groupName: string): boolean {
		if (type !== 'multiple') return false;
		const groupItems = getGroupItems(groupName);
		return groupItems.length > 0 && groupItems.every((item) => selectedLookup[item.value] === true);
	}

	function toggleGroup(groupName: string) {
		if (type !== 'multiple') return;
		const currentValues = Array.isArray(value) ? value : [];
		const groupValues = getGroupItems(groupName).map((item) => item.value);

		if (isGroupAllSelected(groupName)) {
			const removeLookup = Object.create(null) as Record<string, true>;
			for (const v of groupValues) removeLookup[v] = true;
			value = currentValues.filter((v) => !removeLookup[v]);
		} else {
			value = [...currentValues, ...groupValues.filter((v) => !selectedLookup[v])];
		}
		onchange?.(value);
	}

	// ── Misc ──────────────────────────────────────────────────────────────
</script>

<Popover.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) searchValue = '';
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
					type === 'multiple' && selectedValues.length > 0 ? s.triggerMulti : s.trigger,
					disabled && 'pointer-events-none opacity-50',
					customClass
				)}
				role="combobox"
				aria-expanded={open}
				aria-label={ariaLabel ?? placeholder}
				{disabled}
			>
				{#if type === 'single'}
					{#if selectedItem && selectedSnippet}
						<span class="min-w-0 flex-1 truncate text-left">{@render selectedSnippet(selectedItem)}</span>
					{:else}
						<span class="min-w-0 flex-1 truncate text-left">{selectedValue || placeholder}</span>
					{/if}
				{:else if selectedValues.length > 0}
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
					<div class={cn('flex flex-1 flex-wrap content-start items-start', s.tagContainer)}>
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
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class={cn('shrink-0 cursor-pointer hover:ring-1 hover:ring-border', s.tagRemoveBtn)}
									onclick={(e) => removeItem(tag.value, e)}
								>
									<XIcon class={s.tagRemoveIcon} />
									<span class="sr-only">Remove {tag.label}</span>
								</Button>
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
					{#if (type === 'single' && value) || (type === 'multiple' && selectedValues.length > 0)}
						<Button type="button" variant="ghost" size="icon" class={cn('hover:bg-muted', s.clearBtn)} onclick={clearAll}>
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
				<Command.Input placeholder={searchPlaceholder} bind:value={searchValue} {...inputProps} />
				{#if type === 'multiple' && filteredItems.length > 0}
					<div class={cn('flex items-center justify-between border-b', s.statusBar)}>
						<span class={cn('text-muted-foreground', s.statusText)}>
							{selectedValues.length} of {items.length} selected
						</span>
						<div class="flex gap-1">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class={s.actionBtn}
								disabled={allFilteredSelected}
								onclick={selectAllFiltered}
							>
								{selectAllLabel}
							</Button>
							<Button type="button" variant="ghost" size="sm" class={s.actionBtn} disabled={!someFilteredSelected} onclick={clearFiltered}>
								{isSearching ? 'Clear filtered' : clearAllLabel}
							</Button>
						</div>
					</div>
				{/if}
				<Command.List class="overflow-hidden px-1" style="max-height: {listHeight}">
					<Command.Empty>{emptyText}</Command.Empty>
					<Command.Group>
						<VList
							data={flatListWithGroups}
							style="height: {listHeight}"
							getKey={(item: FlatListItem<T>) => (isGroupHeader(item) ? `__group__${item.group}` : item.value)}
						>
							{#snippet children(item: FlatListItem<T>)}
								{#if isGroupHeader(item)}
									<div class={cn('flex items-center justify-between', s.groupHeader)}>
										<span class={cn('font-semibold text-muted-foreground', s.groupText)}>{item.group}</span>
										{#if type === 'multiple'}
											<button
												type="button"
												class={cn('cursor-pointer text-muted-foreground hover:text-foreground', s.groupText)}
												aria-label={isGroupAllSelected(item.group) ? `Clear ${item.group}` : `Select all in ${item.group}`}
												onclick={() => toggleGroup(item.group)}
											>
												{isGroupAllSelected(item.group) ? 'Clear' : 'Select all'}
											</button>
										{/if}
									</div>
								{:else}
									<Command.Item
										value={item.value}
										disabled={item.disabled}
										onSelect={() => handleItemSelect(item.value)}
										title={item.label}
									>
										<CheckIcon class={cn(!isSelected(item.value) && 'text-transparent')} />
										{#if itemSnippet}
											{@render itemSnippet(item)}
										{:else}
											<span class="min-w-0 flex-1 truncate">{item.label}</span>
										{/if}
									</Command.Item>
								{/if}
							{/snippet}
						</VList>
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
