<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card/index.js';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ChartCandlestick from '@lucide/svelte/icons/chart-candlestick';
	import Component from '@lucide/svelte/icons/component';
	import Globe from '@lucide/svelte/icons/globe';
	import TableIcon from '@lucide/svelte/icons/table';
	import Upload from '@lucide/svelte/icons/upload';

	const features = [
		{
			title: 'Components',
			description:
				'Interactive custom components including ComboBox with search, multi-select, and grouping, plus drag-and-drop SortableList.',
			href: '/showcase/components' as const,
			icon: Component,
			tags: ['ComboBox', 'SortableList', 'Drag & Drop']
		},
		{
			title: 'File Upload',
			description: 'Drag-and-drop file uploads with validation, preview, and real-time upload progress tracking via a public API.',
			href: '/showcase/file-upload' as const,
			icon: Upload,
			tags: ['File Upload', 'Progress', 'Validation']
		},
		{
			title: 'Charts',
			description:
				'Commodity trading charts powered by Plotly.js with candlestick, forward curves, calendar spreads, and seasonal heatmaps.',
			href: '/showcase/charts' as const,
			icon: ChartCandlestick,
			tags: ['Plotly', 'Candlestick', 'Forward Curve', 'Heatmap']
		},
		{
			title: 'Live Table',
			description:
				'High-frequency data updates with AG Grid showcasing simulated real-time market data, configurable update speeds, and efficient cell-level refreshes.',
			href: '/showcase/live-table' as const,
			icon: TableIcon,
			tags: ['AG Grid', 'Real-time', 'Market Data']
		},
		{
			title: 'API + Resource',
			description:
				'Reactive data fetching with runed resource and FetchService. Demonstrates dependency tracking, cancellation, and loading states.',
			href: '/showcase/api' as const,
			icon: Globe,
			tags: ['Fetch', 'Resource', 'Reactive']
		}
	];
</script>

<div class="mx-auto max-w-5xl space-y-8 p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Showcase Dashboard</h1>
		<p class="mt-2 text-muted-foreground">Explore the features and patterns available in this SvelteKit SPA starter.</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each features as feature (feature.href)}
			<a href={resolve(feature.href)} class="group block">
				<Card.Root class="h-full transition-colors group-hover:border-primary/50">
					<Card.Header>
						<div class="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<feature.icon class="size-5" />
						</div>
						<Card.Title class="flex items-center gap-2">
							{feature.title}
							<ArrowRight class="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
						</Card.Title>
						<Card.Description>{feature.description}</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-wrap gap-1.5">
							{#each feature.tags as tag (tag)}
								<span class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>
</div>
