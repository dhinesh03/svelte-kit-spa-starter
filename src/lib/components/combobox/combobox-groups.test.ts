import { describe, expect, it } from 'vitest';

import { ComboBoxGroups } from './combobox-groups.svelte.js';
import { isGroupHeader, type ItemType } from './types.js';

const ITEMS: ItemType[] = [
	{ value: '1', label: 'NYC', group: 'East' },
	{ value: '2', label: 'Boston', group: 'East' },
	{ value: '3', label: 'LA', group: 'West' },
	{ value: '4', label: 'Misc' }
];

describe('ComboBoxGroups', () => {
	it('produces flat list with headers in stable group order', () => {
		const groups = new ComboBoxGroups(
			() => ITEMS,
			() => ITEMS,
			() => 'Other'
		);

		const flat = groups.flatList;
		const headers = flat.filter(isGroupHeader).map((h) => h.group);

		expect(headers).toEqual(['East', 'West', 'Other']);
		expect(flat).toHaveLength(7);
	});

	it('filters groups when search narrows results', () => {
		const filtered = ITEMS.filter((i) => i.group === 'West');
		const groups = new ComboBoxGroups(
			() => ITEMS,
			() => filtered,
			() => 'Other'
		);

		const flat = groups.flatList;
		const headers = flat.filter(isGroupHeader).map((h) => h.group);

		expect(headers).toEqual(['West']);
		expect(flat).toHaveLength(2);
	});

	it('returns items without headers when no groups exist', () => {
		const ungrouped: ItemType[] = [
			{ value: 'a', label: 'Alpha' },
			{ value: 'b', label: 'Beta' }
		];
		const groups = new ComboBoxGroups(
			() => ungrouped,
			() => ungrouped,
			() => 'Other'
		);

		expect(groups.hasGroups).toBe(false);
		expect(groups.flatList).toEqual(ungrouped);
	});

	it('places ungrouped items at the end', () => {
		const groups = new ComboBoxGroups(
			() => ITEMS,
			() => ITEMS,
			() => 'Other'
		);

		const flat = groups.flatList;
		const lastHeader = flat.filter(isGroupHeader).at(-1);
		expect(lastHeader).toBeTruthy();
		if (lastHeader && isGroupHeader(lastHeader)) {
			expect(lastHeader.group).toBe('Other');
		}
	});
});
