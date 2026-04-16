import type { FlatListItem, GroupHeaderItem, ItemType } from './types.js';

export class ComboBoxGroups<T extends ItemType> {
	#allItems!: () => T[];
	#filteredItems!: () => T[];
	#ungroupedLabel!: () => string;

	hasGroups = $derived(this.#allItems().some((item) => item.group));

	groupItemsMap = $derived.by(() => {
		const map = Object.create(null) as Record<string, T[]>;
		for (const item of this.#filteredItems()) {
			const key = item.group || this.#ungroupedLabel();
			if (!map[key]) map[key] = [];
			map[key].push(item);
		}
		return map;
	});

	#stableGroupOrder = $derived.by(() => {
		const order: string[] = [];
		const seen = Object.create(null) as Record<string, true>;
		for (const item of this.#allItems()) {
			if (item.group && !seen[item.group]) {
				seen[item.group] = true;
				order.push(item.group);
			}
		}
		return order;
	});

	flatList = $derived.by<FlatListItem<T>[]>(() => {
		if (!this.hasGroups) return this.#filteredItems();

		const ungrouped = this.#ungroupedLabel();
		const result: FlatListItem<T>[] = [];

		for (const groupName of this.#stableGroupOrder) {
			const groupItems = this.groupItemsMap[groupName];
			if (groupItems && groupItems.length > 0) {
				result.push({ _isGroupHeader: true, group: groupName } as GroupHeaderItem);
				result.push(...groupItems);
			}
		}

		const ungroupedItems = this.groupItemsMap[ungrouped];
		if (ungroupedItems && ungroupedItems.length > 0) {
			if (result.length > 0) {
				result.push({ _isGroupHeader: true, group: ungrouped } as GroupHeaderItem);
			}
			result.push(...ungroupedItems);
		}

		return result;
	});

	constructor(allItems: () => T[], filteredItems: () => T[], ungroupedLabel: () => string) {
		this.#allItems = allItems;
		this.#filteredItems = filteredItems;
		this.#ungroupedLabel = ungroupedLabel;
	}
}
