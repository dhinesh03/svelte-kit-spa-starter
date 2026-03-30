<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	import './layout.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head>
	<title>SvelteKit SPA Starter</title>
	<meta name="description" content="SvelteKit SPA starter with Svelte 5, Tailwind CSS, and shadcn-svelte components" />
	<link rel="icon" href={favicon} />
</svelte:head>
<ModeWatcher />
<Toaster />

{@render children()}
