import Fuse from 'fuse.js';

import type { ItemType } from './types.js';

export class ComboBoxSearch<T extends ItemType> {
	#items!: () => T[];

	searchValue = $state('');

	#fuse = $derived(
		new Fuse(this.#items(), {
			keys: ['label', 'keywords'],
			threshold: 0.3,
			ignoreLocation: true
		})
	);

	filteredItems = $derived.by(() => {
		const query = this.searchValue.trim();
		if (!query) return this.#items();
		return this.#fuse.search(query).map((r) => r.item);
	});

	isSearching = $derived(this.searchValue.trim().length > 0);

	constructor(items: () => T[]) {
		this.#items = items;
	}

	reset() {
		this.searchValue = '';
	}
}
