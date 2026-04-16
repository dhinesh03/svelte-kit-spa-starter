import type { ItemType } from './types.js';

type SelectionType = 'single' | 'multiple';

export type SelectionCallbacks = {
	onchange?: (value: string | string[] | undefined) => void;
	onclose?: () => void;
};

export class ComboBoxSelection<T extends ItemType> {
	#type!: () => SelectionType;
	#items!: () => T[];
	#filteredItems!: () => T[];
	#groupItemsMap!: () => Record<string, T[]>;
	#callbacks!: SelectionCallbacks;

	value = $state<string | string[] | undefined>(undefined);

	selectedLookup = $derived.by(() => {
		const lookup = Object.create(null) as Record<string, true>;
		if (this.#type() === 'multiple' && Array.isArray(this.value)) {
			for (const v of this.value) lookup[v] = true;
		}
		return lookup;
	});

	disabledLookup = $derived.by(() => {
		const lookup = Object.create(null) as Record<string, true>;
		for (const item of this.#items()) {
			if (item.disabled) lookup[item.value] = true;
		}
		return lookup;
	});

	selectedItem = $derived(this.#type() === 'single' ? this.#items().find((f) => f.value === this.value) : undefined);

	selectedLabel = $derived(this.selectedItem?.label);

	selectedValues = $derived.by(() => {
		if (this.#type() === 'multiple' && Array.isArray(this.value) && this.value.length > 0) {
			const itemLookup = Object.create(null) as Record<string, T>;
			for (const item of this.#items()) itemLookup[item.value] = item;
			return this.value.map((v) => itemLookup[v]).filter((item): item is T => item != null);
		}
		return [] as T[];
	});

	hasClearableSelection = $derived.by(() => {
		if (this.#type() === 'single') return typeof this.value === 'string' && !this.disabledLookup[this.value];
		return Array.isArray(this.value) && this.value.some((v) => !this.disabledLookup[v]);
	});

	allFilteredSelected = $derived.by(() => {
		if (this.#type() !== 'multiple') return false;
		const enabled = this.#filteredItems().filter((item) => !this.disabledLookup[item.value]);
		return enabled.length > 0 && enabled.every((item) => this.selectedLookup[item.value] === true);
	});

	someFilteredSelected = $derived.by(() => {
		if (this.#type() !== 'multiple') return false;
		const enabled = this.#filteredItems().filter((item) => !this.disabledLookup[item.value]);
		return enabled.length > 0 && enabled.some((item) => this.selectedLookup[item.value] === true);
	});

	constructor(
		type: () => SelectionType,
		items: () => T[],
		filteredItems: () => T[],
		groupItemsMap: () => Record<string, T[]>,
		callbacks: SelectionCallbacks
	) {
		this.#type = type;
		this.#items = items;
		this.#filteredItems = filteredItems;
		this.#groupItemsMap = groupItemsMap;
		this.#callbacks = callbacks;
	}

	isSelected(itemValue: string): boolean {
		if (this.#type() === 'single') return this.value === itemValue;
		return this.selectedLookup[itemValue] === true;
	}

	handleItemSelect(itemValue: string) {
		if (this.disabledLookup[itemValue]) return;
		if (this.#type() === 'single') {
			this.value = itemValue;
			this.#callbacks.onchange?.(this.value);
			this.#callbacks.onclose?.();
		} else {
			const currentValues = Array.isArray(this.value) ? this.value : [];
			if (this.selectedLookup[itemValue]) {
				this.value = currentValues.filter((v) => v !== itemValue);
			} else {
				this.value = [...currentValues, itemValue];
			}
			this.#callbacks.onchange?.(this.value);
		}
	}

	removeItem(itemValue: string) {
		if (this.disabledLookup[itemValue]) return;
		if (Array.isArray(this.value)) {
			this.value = this.value.filter((v) => v !== itemValue);
			this.#callbacks.onchange?.(this.value);
		}
	}

	clearAll() {
		if (this.#type() === 'multiple') {
			this.value = Array.isArray(this.value) ? this.value.filter((v) => this.disabledLookup[v]) : [];
		} else {
			if (typeof this.value === 'string' && this.disabledLookup[this.value]) return;
			this.value = undefined;
		}
		this.#callbacks.onchange?.(this.value);
	}

	selectAllFiltered() {
		if (this.#type() !== 'multiple') return;
		const currentValues = Array.isArray(this.value) ? this.value : [];
		const toAdd = this.#filteredItems()
			.filter((item) => !this.disabledLookup[item.value] && !this.selectedLookup[item.value])
			.map((item) => item.value);
		this.value = [...currentValues, ...toAdd];
		this.#callbacks.onchange?.(this.value);
	}

	clearFiltered() {
		if (this.#type() !== 'multiple' || !Array.isArray(this.value)) return;
		const filteredLookup = Object.create(null) as Record<string, true>;
		for (const item of this.#filteredItems()) {
			if (!this.disabledLookup[item.value]) filteredLookup[item.value] = true;
		}
		this.value = this.value.filter((v) => !filteredLookup[v]);
		this.#callbacks.onchange?.(this.value);
	}

	isGroupAllSelected(groupName: string): boolean {
		if (this.#type() !== 'multiple') return false;
		const enabled = (this.#groupItemsMap()[groupName] ?? []).filter((item) => !this.disabledLookup[item.value]);
		return enabled.length > 0 && enabled.every((item) => this.selectedLookup[item.value] === true);
	}

	isGroupSomeSelected(groupName: string): boolean {
		if (this.#type() !== 'multiple') return false;
		return (this.#groupItemsMap()[groupName] ?? []).some(
			(item) => !this.disabledLookup[item.value] && this.selectedLookup[item.value] === true
		);
	}

	selectGroup(groupName: string) {
		if (this.#type() !== 'multiple') return;
		const currentValues = Array.isArray(this.value) ? this.value : [];
		const groupValues = (this.#groupItemsMap()[groupName] ?? [])
			.filter((item) => !this.disabledLookup[item.value])
			.map((item) => item.value);
		this.value = [...currentValues, ...groupValues.filter((v) => !this.selectedLookup[v])];
		this.#callbacks.onchange?.(this.value);
	}

	clearGroup(groupName: string) {
		if (this.#type() !== 'multiple' || !Array.isArray(this.value)) return;
		const removeLookup = Object.create(null) as Record<string, true>;
		for (const item of this.#groupItemsMap()[groupName] ?? []) {
			if (!this.disabledLookup[item.value]) removeLookup[item.value] = true;
		}
		this.value = this.value.filter((v) => !removeLookup[v]);
		this.#callbacks.onchange?.(this.value);
	}

	handleBackspace(): boolean {
		if (this.#type() !== 'multiple' || !Array.isArray(this.value) || this.value.length === 0) return false;
		const lastRemovable = this.value.findLastIndex((v) => !this.disabledLookup[v]);
		if (lastRemovable === -1) return false;
		this.value = this.value.filter((_, i) => i !== lastRemovable);
		this.#callbacks.onchange?.(this.value);
		return true;
	}
}
