import { untrack } from 'svelte';

import { makeDebounce } from '$lib/helpers';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { createGrid, type GridApi, type GridOptions } from 'ag-grid-community';
import { colorSchemeDark, colorSchemeLight, themeQuartz } from 'ag-grid-community';
import { mode } from 'mode-watcher';

ModuleRegistry.registerModules([AllCommunityModule]);

export const agGridTheme = themeQuartz.withParams({
	fontSize: '12px',
	columnBorder: {
		style: 'solid'
	}
});

const lightParams = {
	headerBackgroundColor: '#F4F4F4'
};

const darkParams = {
	headerBackgroundColor: '#1f1f1f'
};

function applyTheme(gridApi: GridApi, currentMode: string | undefined) {
	const isDark = currentMode === 'dark';
	const colorScheme = isDark ? colorSchemeDark : colorSchemeLight;
	const params = isDark ? darkParams : lightParams;
	const theme = agGridTheme.withPart(colorScheme).withParams(params);
	gridApi.setGridOption('theme', theme);
}

// Attachment function to initialize the grid
export function initAGgrid<T>(gridOptions: GridOptions<T>, onResize?: (api: GridApi) => void) {
	return (node: HTMLElement) => {
		const gridApi = untrack(() => createGrid(node, gridOptions));

		const debouncedResize = makeDebounce(() => {
			if (onResize) {
				onResize(gridApi);
			} else {
				gridApi?.autoSizeAllColumns();
			}
		}, 250);

		window.addEventListener('resize', debouncedResize);

		// Reactively apply theme based on mode-watcher state
		$effect(() => {
			applyTheme(gridApi, mode.current);
		});

		// Return cleanup function for @attach
		return () => {
			window.removeEventListener('resize', debouncedResize);
			gridApi?.destroy();
		};
	};
}
