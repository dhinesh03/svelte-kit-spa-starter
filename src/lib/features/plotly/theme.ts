import type { Layout } from 'plotly.js';

type PartialLayout = Partial<Layout>;

const sharedAxisLight = { gridcolor: '#e5e5e5', zerolinecolor: '#d4d4d4', linecolor: '#d4d4d4' };
const sharedAxisDark = { gridcolor: '#333333', zerolinecolor: '#444444', linecolor: '#444444' };

export const lightLayout: PartialLayout = {
	paper_bgcolor: 'transparent',
	plot_bgcolor: '#ffffff',
	font: { color: '#1a1a1a', family: 'Inter Variable, system-ui, sans-serif', size: 12 },
	title: { font: { color: '#1a1a1a' } },
	xaxis: {
		...sharedAxisLight,
		rangeselector: {
			bgcolor: '#f0f0f0',
			activecolor: '#d4d4d4',
			bordercolor: '#d4d4d4',
			borderwidth: 1,
			font: { color: '#1a1a1a' }
		},
		rangeslider: { visible: false, bgcolor: '#f5f5f5', bordercolor: '#d4d4d4' }
	},
	yaxis: { ...sharedAxisLight },
	legend: { bgcolor: 'rgba(255,255,255,0.8)', font: { color: '#1a1a1a' }, bordercolor: '#e5e5e5', borderwidth: 1 },
	hoverlabel: { bgcolor: '#ffffff', font: { color: '#1a1a1a', size: 12 }, bordercolor: '#d4d4d4' },
	modebar: { bgcolor: 'transparent', color: '#666666', activecolor: '#1a1a1a' },
	colorway: [
		'#1e3a5f', // 0  navy (primary)
		'#d96228', // 1  orange
		'#2d6b2d', // 2  green
		'#c41e3a', // 3  red
		'#5d4a7f', // 4  purple
		'#1298a8', // 5  teal
		'#b8336a', // 6  pink
		'#b07d10', // 7  gold
		'#4a7fb8', // 8  steel blue
		'#8b2252', // 9  burgundy
		'#2e8b6e', // 10 sea green
		'#d45500', // 11 burnt orange
		'#6a4c93', // 12 iris
		'#148f7c', // 13 turquoise
		'#a83244', // 14 crimson
		'#3d7ea6' // 15 ocean blue
	]
};

export const darkLayout: PartialLayout = {
	paper_bgcolor: 'transparent',
	plot_bgcolor: '#1a1a1a',
	font: { color: '#e5e5e5', family: 'Inter Variable, system-ui, sans-serif', size: 12 },
	title: { font: { color: '#e5e5e5' } },
	xaxis: {
		...sharedAxisDark,
		rangeselector: {
			bgcolor: '#333333',
			activecolor: '#555555',
			bordercolor: '#555555',
			borderwidth: 1,
			font: { color: '#e5e5e5' }
		},
		rangeslider: { visible: false, bgcolor: '#262626', bordercolor: '#444444' }
	},
	yaxis: { ...sharedAxisDark },
	legend: { bgcolor: 'rgba(26,26,26,0.8)', font: { color: '#e5e5e5' }, bordercolor: '#444444', borderwidth: 1 },
	hoverlabel: { bgcolor: '#262626', font: { color: '#e5e5e5', size: 12 }, bordercolor: '#555555' },
	modebar: { bgcolor: 'transparent', color: '#999999', activecolor: '#e5e5e5' },
	colorway: [
		'#2f4b7c', // 0  navy (primary)
		'#ff7c43', // 1  orange
		'#368036', // 2  green
		'#ef4444', // 3  red
		'#8b6eb8', // 4  purple
		'#17becf', // 5  teal
		'#e05590', // 6  pink
		'#d4a017', // 7  gold
		'#6da1d4', // 8  steel blue
		'#c24d78', // 9  burgundy
		'#45b89a', // 10 sea green
		'#ff8c33', // 11 burnt orange
		'#9173c2', // 12 iris
		'#1abc9c', // 13 turquoise
		'#d9586e', // 14 crimson
		'#5a9ec7' // 15 ocean blue
	]
};

export const themeAxisColors = {
	light: sharedAxisLight,
	dark: sharedAxisDark
};

export function getThemeLayout(currentMode: string | undefined): PartialLayout {
	return currentMode === 'dark' ? darkLayout : lightLayout;
}
