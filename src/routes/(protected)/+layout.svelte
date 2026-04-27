<script lang="ts">
	import { getAuthService } from '$lib/services/auth-service';

	let { children } = $props();

	const auth = getAuthService();

	$effect(() => {
		const authState = auth.current;
		if (authState.isInitialized && !authState.isLoading && !authState.isAuthenticated && !authState.error) {
			auth.login();
		}
	});

	const authState = $derived(auth.current);
</script>

{#if !authState.isInitialized || authState.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="flex flex-col items-center gap-3">
			<span class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent"></span>
			<p class="text-sm text-muted-foreground">Authenticating...</p>
		</div>
	</div>
{:else if authState.isAuthenticated}
	<header class="flex items-center justify-between border-b px-6 py-3">
		<span class="text-sm font-medium">{authState.userProfile?.name ?? authState.userProfile?.email}</span>
		<button class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent" onclick={() => auth.logout()}>
			Sign out
		</button>
	</header>
	{@render children()}
{:else if authState.error}
	<div class="flex min-h-screen items-center justify-center">
		<div class="flex flex-col items-center gap-3">
			<p class="text-sm text-destructive">Authentication failed: {authState.error}</p>
			<button class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent" onclick={() => auth.clearCacheAndReload()}>
				Clear cache and retry
			</button>
		</div>
	</div>
{/if}
