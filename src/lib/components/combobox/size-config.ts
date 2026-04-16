import type { ComboBoxSize } from './types.js';

export type SizeClasses = {
	trigger: string;
	triggerMulti: string;
	text: string;
	tag: string;
	tagSpacer: string;
	tagRemoveBtn: string;
	tagRemoveIcon: string;
	more: string;
	clearBtn: string;
	clearIcon: string;
	chevron: string;
	statusBar: string;
	statusText: string;
	actionBtn: string;
	groupHeader: string;
	groupText: string;
	measureContainer: string;
	tagContainer: string;
};

export const SIZE_CONFIG: Record<ComboBoxSize, SizeClasses> = {
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
} as const;

export const TRIGGER_PADDING: Record<ComboBoxSize, number> = {
	xs: 52,
	sm: 60,
	default: 68,
	lg: 68
};
