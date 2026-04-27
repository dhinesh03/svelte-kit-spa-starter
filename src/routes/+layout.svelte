<script lang="ts">
	import { onMount } from 'svelte';

	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';
	import { initAuthService } from '$lib/services/auth-service';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();

	// Auth is optional — set VITE_AZURE_TENANT_ID, VITE_AZURE_CLIENT_ID, and
	// VITE_ACCESS_SCOPES (comma-separated) in .env to enable Azure AD auth.
	const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
	const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
	const scopes = (import.meta.env.VITE_ACCESS_SCOPES ?? '').split(',').filter(Boolean);

	if (tenantId && clientId && scopes.length) {
		const authService = initAuthService({
			tenantId,
			clientId,
			scopes,
			redirectUri: window.location.origin,
			navigateToLoginRequestUrl: true,
			enableSsoSilent: false,
			enableLogging: import.meta.env.DEV
		});

		onMount(() => {
			authService.initialize().catch((err) => {
				console.error('[Auth] Initialization failed:', err);
			});
		});
	}
</script>

<svelte:head>
	<title>HT SvelteKit SPA Starter</title>
	<meta name="description" content="SvelteKit SPA starter with Svelte 5, Tailwind CSS, and shadcn-svelte components" />
	<link rel="icon" href={favicon} />
</svelte:head>
<ModeWatcher />
<Toaster />

{@render children()}
