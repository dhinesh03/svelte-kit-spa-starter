<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	import './layout.css';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />

<Toaster />
<div class="flex h-svh flex-col">
	<header class="flex items-center justify-end border-b px-4 py-2">
		<ThemeSwitcher />
	</header>
	<main id="main" class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
		{@render children()}
	</main>
</div>
