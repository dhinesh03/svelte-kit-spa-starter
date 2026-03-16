export type ComboBoxSize = 'xs' | 'sm' | 'default' | 'lg';

export type ItemType = {
	value: string;
	label: string;
	disabled?: boolean;
	group?: string;
	keywords?: string[];
	[key: string]: unknown;
};

export type GroupHeaderItem = {
	_isGroupHeader: true;
	group: string;
};

export type FlatListItem<T extends ItemType> = T | GroupHeaderItem;

export function isGroupHeader<T extends ItemType>(item: FlatListItem<T>): item is GroupHeaderItem {
	return '_isGroupHeader' in item && item._isGroupHeader === true;
}
