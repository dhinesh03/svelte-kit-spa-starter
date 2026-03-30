<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChartCandlestick from '@lucide/svelte/icons/chart-candlestick';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import Component from '@lucide/svelte/icons/component';
	import Globe from '@lucide/svelte/icons/globe';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Table from '@lucide/svelte/icons/table';
	import UploadIcon from '@lucide/svelte/icons/upload';

	let { children } = $props();

	const navItems = [
		{ title: 'Dashboard', href: '/showcase' as const, icon: LayoutDashboard },
		{ title: 'Components', href: '/showcase/components' as const, icon: Component },
		{ title: 'File Upload', href: '/showcase/file-upload' as const, icon: UploadIcon },
		{ title: 'AG Grid', href: '/showcase/ag-grid' as const, icon: Table },
		{ title: 'Charts', href: '/showcase/charts' as const, icon: ChartCandlestick },
		{ title: 'API + Resource', href: '/showcase/api' as const, icon: Globe }
	];

	const currentPath = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		if (href === '/showcase') return currentPath === '/showcase';
		return currentPath.startsWith(href);
	}

	const breadcrumbs = $derived.by(() => {
		const segments = currentPath.split('/').filter(Boolean);
		return segments.map((seg, i) => ({
			label: seg
				.split('-')
				.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(' '),
			href: '/' + segments.slice(0, i + 1).join('/'),
			isLast: i === segments.length - 1
		}));
	});
</script>

<Sidebar.Provider>
	<Sidebar.Root collapsible="icon">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg">
						<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<LayoutDashboard class="size-4" />
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">Showcase</span>
							<span class="truncate text-xs text-muted-foreground">SvelteKit SPA Starter</span>
						</div>
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Features</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each navItems as item (item.href)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.title}>
									{#snippet child({ props })}
										<a href={resolve(item.href)} {...props}>
											<item.icon class="size-4" />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Rail />
	</Sidebar.Root>
	<Sidebar.Inset>
		<header class="flex h-12 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 h-4!" />
			<nav class="flex items-center gap-1 text-sm">
				{#each breadcrumbs as crumb, i (crumb.href)}
					{#if i > 0}
						<ChevronRightIcon class="size-3 text-muted-foreground" />
					{/if}
					{#if crumb.isLast}
						<span class="font-medium">{crumb.label}</span>
					{:else}
						<a href={resolve(crumb.href as '/')} class="text-muted-foreground hover:text-foreground">
							{crumb.label}
						</a>
					{/if}
				{/each}
			</nav>
			<div class="ml-auto">
				<ThemeSwitcher />
			</div>
		</header>
		<main class="flex-1 overflow-auto">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
