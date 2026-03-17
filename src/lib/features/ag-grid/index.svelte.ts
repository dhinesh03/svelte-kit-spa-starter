import { makeDebounce } from '$lib/helpers';
import { createGrid, type GridApi, type GridOptions } from 'ag-grid-community';
import { colorSchemeLight, themeQuartz } from 'ag-grid-community';

export const agGridTheme = themeQuartz.withParams({
	fontSize: '12px',
	columnBorder: {
		style: 'solid'
	}
});

const lightParams = {
	headerBackgroundColor: '#F4F4F4'
};

// Attachment function to initialize the grid
export function initAGgrid<T>(gridOptions: GridOptions<T>, onResize?: (api: GridApi) => void) {
	return (node: HTMLElement) => {
		const gridApi = createGrid(node, gridOptions);

		const debouncedResize = makeDebounce(() => {
			if (onResize) {
				onResize(gridApi);
			} else {
				gridApi?.autoSizeAllColumns();
			}
		}, 250);

		window.addEventListener('resize', debouncedResize);

		// Set light theme
		const theme = agGridTheme.withPart(colorSchemeLight).withParams(lightParams);
		gridApi.setGridOption('theme', theme);

		// Return cleanup function for @attach
		return () => {
			window.removeEventListener('resize', debouncedResize);
			gridApi?.destroy();
		};
	};
}
