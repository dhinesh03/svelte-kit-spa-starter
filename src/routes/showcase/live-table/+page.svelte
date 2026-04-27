<script lang="ts">
	import type { ColDef, CellClassParams } from 'ag-grid-community';

	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { initAGgrid } from '$lib/features/ag-grid/index.svelte';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	import type { MarketTick } from './stores/LiveMarketData.svelte';

	import { LiveMarketData } from './stores/LiveMarketData.svelte';

	const market = new LiveMarketData();

	const speeds = [1, 5, 10, 25, 50] as const;

	function formatNumber(value: number): string {
		return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function formatVolume(value: number): string {
		if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
		if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
		return value.toString();
	}

	function changeCellClass(params: CellClassParams<MarketTick>): string {
		const val = params.value as number;
		if (val > 0) return 'text-green-600 dark:text-green-400';
		if (val < 0) return 'text-red-600 dark:text-red-400';
		return '';
	}

	const columnDefs: ColDef<MarketTick>[] = [
		{ field: 'symbol', headerName: 'Symbol', pinned: 'left', width: 100, sort: 'asc' },
		{ field: 'name', headerName: 'Name', width: 180 },
		{ field: 'sector', headerName: 'Sector', width: 180 },
		{
			field: 'price',
			headerName: 'Price',
			width: 110,
			type: 'rightAligned',
			valueFormatter: (p) => (p.value != null ? formatNumber(p.value) : '')
		},
		{
			field: 'change',
			headerName: 'Chg',
			width: 100,
			type: 'rightAligned',
			cellClass: changeCellClass,
			valueFormatter: (p) => {
				if (p.value == null) return '';
				const v = p.value as number;
				return (v >= 0 ? '+' : '') + formatNumber(v);
			}
		},
		{
			field: 'changePercent',
			headerName: 'Chg %',
			width: 100,
			type: 'rightAligned',
			cellClass: changeCellClass,
			valueFormatter: (p) => {
				if (p.value == null) return '';
				const v = p.value as number;
				return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
			}
		},
		{
			field: 'bid',
			headerName: 'Bid',
			width: 110,
			type: 'rightAligned',
			valueFormatter: (p) => (p.value != null ? formatNumber(p.value) : '')
		},
		{
			field: 'ask',
			headerName: 'Ask',
			width: 110,
			type: 'rightAligned',
			valueFormatter: (p) => (p.value != null ? formatNumber(p.value) : '')
		},
		{
			field: 'volume',
			headerName: 'Volume',
			width: 110,
			type: 'rightAligned',
			valueFormatter: (p) => (p.value != null ? formatVolume(p.value as number) : '')
		},
		{
			field: 'high',
			headerName: 'High',
			width: 110,
			type: 'rightAligned',
			valueFormatter: (p) => (p.value != null ? formatNumber(p.value) : '')
		},
		{
			field: 'low',
			headerName: 'Low',
			width: 110,
			type: 'rightAligned',
			valueFormatter: (p) => (p.value != null ? formatNumber(p.value) : '')
		},
		{ field: 'lastUpdated', headerName: 'Last Update', width: 120 }
	];

	function handleToggle() {
		if (market.isRunning) {
			market.stop();
		} else {
			market.start();
		}
	}

	function handleReset() {
		market.reset();
	}

	$effect(() => {
		return () => market.destroy();
	});
</script>

<div class="mx-auto max-w-[1400px] space-y-6 p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Live Table</h1>
		<p class="mt-2 text-muted-foreground">
			High-frequency data updates powered by
			<code class="rounded bg-muted px-1.5 py-0.5 text-sm">AG Grid</code>
			with simulated market data. Prices update in real-time via efficient cell-level refreshes.
		</p>
	</div>

	<Card.Root>
		<Card.Header>
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<Card.Title>Market Data Feed</Card.Title>
					<Card.Description>Simulated equities market with configurable update frequency</Card.Description>
				</div>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<Label class="text-xs text-muted-foreground">Updates/sec:</Label>
						<div class="flex gap-1">
							{#each speeds as speed (speed)}
								<Button
									variant={market.updatesPerSecond === speed ? 'default' : 'outline'}
									size="sm"
									class="h-7 px-2 text-xs"
									onclick={() => market.setSpeed(speed)}
								>
									{speed}
								</Button>
							{/each}
						</div>
					</div>
					<Separator orientation="vertical" class="h-6!" />
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm" onclick={handleToggle}>
							{#if market.isRunning}
								<Pause class="mr-1 size-3.5" />
								Pause
							{:else}
								<Play class="mr-1 size-3.5" />
								Start
							{/if}
						</Button>
						<Button variant="outline" size="sm" onclick={handleReset}>
							<RotateCcw class="mr-1 size-3.5" />
							Reset
						</Button>
					</div>
					<Separator orientation="vertical" class="h-6!" />
					<div class="flex items-center gap-2">
						<Badge variant={market.isRunning ? 'default' : 'secondary'}>
							{market.isRunning ? 'Live' : 'Paused'}
						</Badge>
						<span class="text-xs text-muted-foreground">{market.totalUpdates.toLocaleString()} updates</span>
					</div>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<div
				class="h-[600px] w-full"
				{@attach initAGgrid<MarketTick>(
					{
						columnDefs,
						getRowId: (params) => params.data.symbol,
						animateRows: false,
						onGridReady: (event) => {
							market.setGridApi(event.api);
							event.api.setGridOption('rowData', market.initialRows);
							market.start();
						}
					},
					(api) => api.sizeColumnsToFit()
				)}
			></div>
		</Card.Content>
	</Card.Root>
</div>
