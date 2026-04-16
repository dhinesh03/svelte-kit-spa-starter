import type { Config, Data, Layout } from 'plotly.js';

import { makeDebounce } from '$lib/helpers';
import { mode } from 'mode-watcher';

import { getThemeLayout, themeAxisColors } from './theme';

let Plotly: typeof import('plotly.js-finance-dist') | null = null;

async function loadPlotly() {
	if (!Plotly) {
		Plotly = await import('plotly.js-finance-dist');
	}
	return Plotly;
}

export interface PlotlyChartOptions {
	data: Data[];
	layout?: Partial<Layout>;
	config?: Partial<Config>;
}

const defaultConfig: Partial<Config> = {
	responsive: false,
	displaylogo: false,
	modeBarButtonsToRemove: ['lasso2d', 'select2d']
};

const AXIS_PATTERN = /^[xy]axis\d*$/;

type AnyRecord = Record<string, unknown>;

function isPlainObject(val: unknown): val is AnyRecord {
	return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function deepMerge(...sources: (AnyRecord | undefined)[]): AnyRecord {
	const result: AnyRecord = {};
	for (const source of sources) {
		if (!source) continue;
		for (const [key, val] of Object.entries(source)) {
			if (isPlainObject(val) && isPlainObject(result[key])) {
				result[key] = deepMerge(result[key] as AnyRecord, val);
			} else {
				result[key] = val;
			}
		}
	}
	return result;
}

function getCssFontFamily(): string {
	return getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim();
}

function mergeLayoutWithTheme(currentMode: string | undefined, userLayout?: Partial<Layout>): Partial<Layout> {
	const theme = getThemeLayout(currentMode);
	const axisColors = currentMode === 'dark' ? themeAxisColors.dark : themeAxisColors.light;
	const fontFamily = getCssFontFamily();

	const merged: AnyRecord = deepMerge(theme as AnyRecord, { font: { family: fontFamily } }, userLayout as AnyRecord);

	const axisKeys = new Set<string>();
	for (const key of Object.keys(theme)) {
		if (AXIS_PATTERN.test(key)) axisKeys.add(key);
	}
	if (userLayout) {
		for (const key of Object.keys(userLayout)) {
			if (AXIS_PATTERN.test(key)) axisKeys.add(key);
		}
	}

	for (const key of axisKeys) {
		const themeAxis = (theme as AnyRecord)[key] as AnyRecord | undefined;
		const userAxis = userLayout ? ((userLayout as AnyRecord)[key] as AnyRecord | undefined) : undefined;
		merged[key] = deepMerge(axisColors as AnyRecord, themeAxis, userAxis);
	}

	return merged as Partial<Layout>;
}

export function initPlotlyChart(options: PlotlyChartOptions) {
	return (node: HTMLElement) => {
		let plotReady = $state(false);
		let destroyed = false;
		let lib: typeof import('plotly.js-finance-dist') | null = null;

		node.style.width = '100%';
		node.style.minWidth = '0';
		node.style.overflow = 'hidden';

		const parent = node.parentElement!;

		const debouncedResize = makeDebounce(() => {
			if (lib && !destroyed) {
				const cs = getComputedStyle(parent);
				const available = parent.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
				if (available > 0) {
					lib.relayout(node, { width: available });
				}
			}
		}, 150);

		const resizeObserver = new ResizeObserver(debouncedResize);
		resizeObserver.observe(parent);

		loadPlotly()
			.then((resolved) => {
				if (destroyed) return;
				lib = resolved;
				const mergedLayout = mergeLayoutWithTheme(mode.current, options.layout);
				const mergedConfig = { ...defaultConfig, ...options.config };

				lib.newPlot(node, options.data, mergedLayout as Layout, mergedConfig as Config);
				plotReady = true;
			})
			.catch((err) => {
				console.error('[Plotly] Failed to initialize chart:', err);
			});

		$effect(() => {
			if (plotReady && lib && !destroyed) {
				const mergedLayout = mergeLayoutWithTheme(mode.current, options.layout);
				lib.relayout(node, mergedLayout as Layout);
			}
		});

		return () => {
			destroyed = true;
			resizeObserver.disconnect();
			if (lib) {
				lib.purge(node);
			}
		};
	};
}
