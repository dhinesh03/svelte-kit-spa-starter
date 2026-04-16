import { describe, expect, it, vi } from 'vitest';

import type { ItemType } from './types.js';

import { ComboBoxSelection } from './combobox-selection.svelte.js';

const ITEMS: ItemType[] = [
	{ value: 'a', label: 'Apple' },
	{ value: 'b', label: 'Banana' },
	{ value: 'c', label: 'Cherry', disabled: true },
	{ value: 'd', label: 'Date' }
];

const GROUPED_ITEMS: ItemType[] = [
	{ value: '1', label: 'NYC', group: 'East' },
	{ value: '2', label: 'Boston', group: 'East' },
	{ value: '3', label: 'LA', group: 'West' },
	{ value: '4', label: 'SF', group: 'West', disabled: true }
];

function makeMultiSelection(overrides: { items?: ItemType[]; onchange?: (v: string | string[] | undefined) => void } = {}) {
	const items = overrides.items ?? ITEMS;
	const groupMap: Record<string, ItemType[]> = {};
	for (const item of items) {
		const key = item.group || 'Other';
		if (!groupMap[key]) groupMap[key] = [];
		groupMap[key].push(item);
	}

	return new ComboBoxSelection(
		() => 'multiple',
		() => items,
		() => items,
		() => groupMap,
		{ onchange: overrides.onchange }
	);
}

describe('ComboBoxSelection - multi-select', () => {
	it('toggles items on and off', () => {
		const onchange = vi.fn();
		const sel = makeMultiSelection({ onchange });
		sel.value = [];

		sel.handleItemSelect('a');
		expect(sel.value).toEqual(['a']);
		expect(onchange).toHaveBeenLastCalledWith(['a']);

		sel.handleItemSelect('a');
		expect(sel.value).toEqual([]);
		expect(onchange).toHaveBeenLastCalledWith([]);
	});

	it('ignores disabled items', () => {
		const onchange = vi.fn();
		const sel = makeMultiSelection({ onchange });
		sel.value = [];

		sel.handleItemSelect('c');
		expect(sel.value).toEqual([]);
		expect(onchange).not.toHaveBeenCalled();
	});

	it('clearAll preserves disabled items', () => {
		const sel = makeMultiSelection();
		sel.value = ['a', 'b', 'c'];

		sel.clearAll();
		expect(sel.value).toEqual(['c']);
	});

	it('selectAllFiltered skips disabled and already-selected items', () => {
		const onchange = vi.fn();
		const sel = makeMultiSelection({ onchange });
		sel.value = ['a'];

		sel.selectAllFiltered();
		expect(sel.value).toEqual(['a', 'b', 'd']);
	});

	it('handleBackspace removes last non-disabled item', () => {
		const sel = makeMultiSelection();
		sel.value = ['a', 'c', 'd'];

		const consumed = sel.handleBackspace();
		expect(consumed).toBe(true);
		expect(sel.value).toEqual(['a', 'c']);
	});

	it('handleBackspace returns false when nothing removable', () => {
		const sel = makeMultiSelection();
		sel.value = ['c'];

		expect(sel.handleBackspace()).toBe(false);
	});
});

describe('ComboBoxSelection - group selection', () => {
	it('selectGroup adds all enabled group items', () => {
		const onchange = vi.fn();
		const sel = makeMultiSelection({ items: GROUPED_ITEMS, onchange });
		sel.value = [];

		sel.selectGroup('West');
		expect(sel.value).toEqual(['3']);
		expect(onchange).toHaveBeenCalledWith(['3']);
	});

	it('clearGroup removes only that group', () => {
		const sel = makeMultiSelection({ items: GROUPED_ITEMS });
		sel.value = ['1', '2', '3'];

		sel.clearGroup('East');
		expect(sel.value).toEqual(['3']);
	});

	it('isGroupAllSelected returns true when all enabled are selected', () => {
		const sel = makeMultiSelection({ items: GROUPED_ITEMS });
		sel.value = ['3'];

		expect(sel.isGroupAllSelected('West')).toBe(true);
	});
});

describe('ComboBoxSelection - single select', () => {
	it('selects item and calls onclose', () => {
		const onchange = vi.fn();
		const onclose = vi.fn();
		const sel = new ComboBoxSelection(
			() => 'single',
			() => ITEMS,
			() => ITEMS,
			() => ({}),
			{ onchange, onclose }
		);

		sel.handleItemSelect('a');
		expect(sel.value).toBe('a');
		expect(onchange).toHaveBeenCalledWith('a');
		expect(onclose).toHaveBeenCalled();
	});
});
