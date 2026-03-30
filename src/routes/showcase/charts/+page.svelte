<script lang="ts">
	import type { Data } from 'plotly.js';

	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { initPlotlyChart } from '$lib/features/plotly/index.svelte';

	let showRangesliderCandlestick = $state(false);
	let showRangesliderForwardCurve = $state(false);
	let showRangesliderSpread = $state(false);
	let showRangesliderStackedBar = $state(false);
	let showRangesliderHeatmap = $state(false);

	const ohlcDates: string[] = [];
	const ohlcOpen: number[] = [];
	const ohlcHigh: number[] = [];
	const ohlcLow: number[] = [];
	const ohlcClose: number[] = [];
	const ohlcVolume: number[] = [];

	for (let i = 0; i < 60; i++) {
		const date = new Date(2025, 0, 2 + i);
		const base = 72 + Math.sin(i / 10) * 5 + (Math.random() - 0.5) * 3;
		const open = base + (Math.random() - 0.5) * 2;
		const close = open + (Math.random() - 0.5) * 3;
		ohlcDates.push(date.toISOString().split('T')[0]);
		ohlcOpen.push(open);
		ohlcClose.push(close);
		ohlcHigh.push(Math.max(open, close) + Math.random() * 1.5);
		ohlcLow.push(Math.min(open, close) - Math.random() * 1.5);
		ohlcVolume.push(Math.floor(200000 + Math.random() * 300000));
	}

	const candlestickData: Data[] = [
		{
			x: ohlcDates,
			open: ohlcOpen,
			high: ohlcHigh,
			low: ohlcLow,
			close: ohlcClose,
			type: 'candlestick',
			name: 'WTI Crude Oil',
			xaxis: 'x',
			yaxis: 'y2',
			increasing: { line: { color: '#16a34a' } },
			decreasing: { line: { color: '#dc2626' } }
		} as Data,
		{
			x: ohlcDates,
			y: ohlcVolume,
			type: 'bar',
			name: 'Volume',
			marker: {
				color: ohlcClose.map((c, j) => (c >= ohlcOpen[j] ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'))
			},
			yaxis: 'y'
		} as Data
	];

	const tenors = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];

	const forwardCurveData: Data[] = [
		{
			x: tenors,
			y: tenors.map((_, i) => 74.5 - i * 0.3 + Math.sin(i / 3) * 0.5),
			type: 'scatter',
			mode: 'lines+markers',
			name: 'Today',
			line: { width: 3 },
			marker: { size: 6 }
		},
		{
			x: tenors,
			y: tenors.map((_, i) => 73.8 - i * 0.35 + Math.sin(i / 3) * 0.4),
			type: 'scatter',
			mode: 'lines+markers',
			name: 'Last Week',
			line: { width: 2, dash: 'dash' },
			marker: { size: 4 }
		},
		{
			x: tenors,
			y: tenors.map((_, i) => 72.0 - i * 0.25 + Math.sin(i / 3) * 0.6),
			type: 'scatter',
			mode: 'lines+markers',
			name: 'Last Month',
			line: { width: 2, dash: 'dash' },
			marker: { size: 4 }
		}
	];

	const spreadDates: string[] = [];
	const spreads: number[] = [];

	for (let i = 0; i < 90; i++) {
		const date = new Date(2025, 0, 2 + i);
		const leg1 = 74 + Math.sin(i / 15) * 4 + (Math.random() - 0.5) * 1.5;
		const leg2 = leg1 - 1.2 + Math.sin(i / 20) * 1.5 + (Math.random() - 0.5) * 0.8;
		spreadDates.push(date.toISOString().split('T')[0]);
		spreads.push(+(leg1 - leg2).toFixed(2));
	}

	const spreadChartData: Data[] = [
		{
			x: spreadDates,
			y: spreads,
			type: 'bar',
			name: 'Spread',
			marker: { color: spreads.map((s) => (s >= 0 ? 'rgba(22,163,74,0.4)' : 'rgba(220,38,38,0.4)')) }
		} as Data,
		{
			x: spreadDates,
			y: spreads,
			type: 'scatter',
			mode: 'lines',
			name: 'Spread (line)',
			line: { width: 2 }
		}
	];

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const years = ['2020', '2021', '2022', '2023', '2024'];

	const zValues = years.map((_, yi) =>
		months.map((_, mi) => {
			const seasonal = Math.sin(((mi - 2) / 12) * Math.PI * 2) * 5;
			const trend = (yi - 2) * 2;
			return +(seasonal + trend + (Math.random() - 0.5) * 3).toFixed(1);
		})
	);

	const heatmapData: Data[] = [
		{
			z: zValues,
			x: months,
			y: years,
			type: 'heatmap',
			colorscale: 'RdYlGn',
			hoverongaps: false
		} as Data
	];

	// --- Stacked Bar Chart: US Electricity Generation by Source (monthly, public data) ---
	const stackedMonths: string[] = [];
	for (let y = 2023; y <= 2025; y++) {
		for (let m = 0; m < 12; m++) {
			if (y === 2025 && m > 2) break;
			const d = new Date(y, m, 1);
			stackedMonths.push(d.toISOString().split('T')[0]);
		}
	}

	function seasonalPattern(month: number, base: number, amplitude: number, peakMonth: number): number {
		const phase = ((month - peakMonth + 12) % 12) / 12;
		return base + amplitude * Math.cos(phase * Math.PI * 2) + (Math.random() - 0.5) * base * 0.05;
	}

	const sources = [
		{ name: 'Natural Gas', base: 150, amplitude: 40, peak: 7, color: '#e45756' },
		{ name: 'Coal', base: 55, amplitude: 15, peak: 7, color: '#72513e' },
		{ name: 'Nuclear', base: 65, amplitude: 5, peak: 1, color: '#8b5cf6' },
		{ name: 'Wind', base: 40, amplitude: 12, peak: 3, color: '#22c55e' },
		{ name: 'Hydro', base: 22, amplitude: 8, peak: 4, color: '#3b82f6' },
		{ name: 'Solar', base: 20, amplitude: 15, peak: 6, color: '#f59e0b' },
		{ name: 'Other Renewables', base: 10, amplitude: 2, peak: 6, color: '#06b6d4' }
	];

	const stackedBarData: Data[] = sources.map((src) => ({
		x: stackedMonths,
		y: stackedMonths.map((d) => {
			const m = new Date(d).getMonth();
			return Math.round(seasonalPattern(m, src.base, src.amplitude, src.peak));
		}),
		type: 'bar' as const,
		name: src.name,
		marker: { color: src.color }
	}));
</script>

<div class="mx-auto max-w-6xl space-y-8 overflow-y-auto p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Charts Showcase</h1>
		<p class="mt-2 text-muted-foreground">
			Commodity trading charts powered by
			<code class="rounded bg-muted px-1.5 py-0.5 text-sm">Plotly.js</code>
			with candlestick, forward curves, spreads, stacked bars, and heatmaps.
		</p>
	</div>

	<section class="space-y-4">
		<Card.Root>
			<Card.Header>
				<div class="flex items-start justify-between">
					<div>
						<Card.Title>Candlestick Chart</Card.Title>
						<Card.Description>Crude oil daily OHLC with volume subplot, range selector, and interactive zoom.</Card.Description>
					</div>
					<div class="flex items-center gap-2">
						<Label for="rs-candlestick" class="text-xs text-muted-foreground">Range Slider</Label>
						<Switch id="rs-candlestick" bind:checked={showRangesliderCandlestick} />
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div
					{@attach initPlotlyChart({
						data: candlestickData,
						layout: {
							title: { text: 'WTI Crude Oil' },
							height: 500,
							showlegend: false,
							yaxis: { domain: [0, 0.2], title: { text: 'Volume' } },
							yaxis2: { domain: [0.25, 1], title: { text: 'Price' } },
							xaxis: {
								rangeslider: { visible: showRangesliderCandlestick },
								rangeselector: {
									buttons: [
										{ count: 1, label: '1M', step: 'month', stepmode: 'backward' },
										{ count: 3, label: '3M', step: 'month', stepmode: 'backward' },
										{ step: 'all', label: 'All' }
									]
								}
							}
						}
					})}
				></div>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="space-y-4">
		<Card.Root>
			<Card.Header>
				<div class="flex items-start justify-between">
					<div>
						<Card.Title>Forward Curve</Card.Title>
						<Card.Description>
							WTI futures term structure comparing today vs. last week vs. last month. Hover to compare prices at each tenor.
						</Card.Description>
					</div>
					<div class="flex items-center gap-2">
						<Label for="rs-forward-curve" class="text-xs text-muted-foreground">Range Slider</Label>
						<Switch id="rs-forward-curve" bind:checked={showRangesliderForwardCurve} />
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div
					{@attach initPlotlyChart({
						data: forwardCurveData,
						layout: {
							title: { text: 'WTI Futures Forward Curve' },
							height: 400,
							xaxis: { title: { text: 'Tenor' }, tickangle: -45, rangeslider: { visible: showRangesliderForwardCurve } },
							yaxis: { title: { text: 'Price ($/bbl)' } },
							hovermode: 'x unified',
							legend: { orientation: 'h', y: -0.25 }
						}
					})}
				></div>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="space-y-4">
		<Card.Root>
			<Card.Header>
				<div class="flex items-start justify-between">
					<div>
						<Card.Title>Calendar Spread</Card.Title>
						<Card.Description>
							Front month minus second month spread over time. Green bars indicate contango, red bars indicate backwardation.
						</Card.Description>
					</div>
					<div class="flex items-center gap-2">
						<Label for="rs-spread" class="text-xs text-muted-foreground">Range Slider</Label>
						<Switch id="rs-spread" bind:checked={showRangesliderSpread} />
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div
					{@attach initPlotlyChart({
						data: spreadChartData,
						layout: {
							title: { text: 'M1-M2 Calendar Spread' },
							height: 400,
							xaxis: { title: { text: 'Date' }, rangeslider: { visible: showRangesliderSpread } },
							yaxis: { title: { text: 'Spread ($/bbl)' } },
							hovermode: 'x unified',
							legend: { orientation: 'h', y: -0.2 },
							shapes: [
								{
									type: 'line',
									x0: spreadDates[0],
									x1: spreadDates[spreadDates.length - 1],
									y0: 0,
									y1: 0,
									line: { color: '#888888', width: 1, dash: 'dash' }
								}
							]
						}
					})}
				></div>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="space-y-4">
		<Card.Root>
			<Card.Header>
				<div class="flex items-start justify-between">
					<div>
						<Card.Title>Stacked Bar Chart</Card.Title>
						<Card.Description>
							US electricity generation by source (TWh). Monthly data showing the contribution of each energy source stacked to reveal total
							generation and seasonal mix shifts.
						</Card.Description>
					</div>
					<div class="flex items-center gap-2">
						<Label for="rs-stacked" class="text-xs text-muted-foreground">Range Slider</Label>
						<Switch id="rs-stacked" bind:checked={showRangesliderStackedBar} />
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div
					{@attach initPlotlyChart({
						data: stackedBarData,
						layout: {
							title: { text: 'US Electricity Generation by Source' },
							height: 500,
							barmode: 'stack',
							xaxis: { title: { text: 'Month' }, tickangle: -45, rangeslider: { visible: showRangesliderStackedBar } },
							yaxis: { title: { text: 'Generation (TWh)' } },
							hovermode: 'x unified',
							legend: { orientation: 'h', y: -0.25 }
						}
					})}
				></div>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="space-y-4">
		<Card.Root>
			<Card.Header>
				<div class="flex items-start justify-between">
					<div>
						<Card.Title>Seasonal Heatmap</Card.Title>
						<Card.Description>Monthly price change patterns across years. Identifies seasonal trends in commodity pricing.</Card.Description>
					</div>
					<div class="flex items-center gap-2">
						<Label for="rs-heatmap" class="text-xs text-muted-foreground">Range Slider</Label>
						<Switch id="rs-heatmap" bind:checked={showRangesliderHeatmap} />
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div
					{@attach initPlotlyChart({
						data: heatmapData,
						layout: {
							title: { text: 'Monthly Price Change ($/bbl)' },
							height: 350,
							xaxis: { tickangle: -45, rangeslider: { visible: showRangesliderHeatmap } }
						}
					})}
				></div>
			</Card.Content>
		</Card.Root>
	</section>
</div>
