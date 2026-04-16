import { describe, expect, it } from 'vitest';

import type { ItemType } from './types.js';

import { ComboBoxSearch } from './combobox-search.svelte.js';

const ITEMS: ItemType[] = [
	{ value: 'a', label: 'Apple', keywords: ['fruit', 'red'] },
	{ value: 'b', label: 'Banana' },
	{ value: 'c', label: 'Avocado' }
];

describe('ComboBoxSearch', () => {
	it('returns all items when search is empty', () => {
		const search = new ComboBoxSearch(() => ITEMS);
		expect(search.filteredItems).toEqual(ITEMS);
		expect(search.isSearching).toBe(false);
	});

	it('filters items by label with fuzzy matching', () => {
		const search = new ComboBoxSearch(() => ITEMS);
		search.searchValue = 'ban';

		expect(search.filteredItems).toHaveLength(1);
		expect(search.filteredItems[0].label).toBe('Banana');
		expect(search.isSearching).toBe(true);
	});

	it('matches on keywords', () => {
		const search = new ComboBoxSearch(() => ITEMS);
		search.searchValue = 'red';

		expect(search.filteredItems).toHaveLength(1);
		expect(search.filteredItems[0].value).toBe('a');
	});

	it('reset clears the search', () => {
		const search = new ComboBoxSearch(() => ITEMS);
		search.searchValue = 'apple';

		search.reset();
		expect(search.searchValue).toBe('');
	});

	it('ignores whitespace-only search', () => {
		const search = new ComboBoxSearch(() => ITEMS);
		search.searchValue = '   ';

		expect(search.filteredItems).toEqual(ITEMS);
		expect(search.isSearching).toBe(false);
	});
});
