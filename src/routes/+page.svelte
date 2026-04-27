<script lang="ts">
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// This page only renders when returning from Azure AD (auth hash in URL).
	// Root layout's handleRedirectPromise() processes the auth code, then
	// navigateToLoginRequestUrl navigates back to the original URL.
	// Fallback: redirect to /showcase after 10s if MSAL doesn't navigate.
	onMount(() => {
		const timer = setTimeout(() => goto(resolve('/showcase'), { replaceState: true }), 10_000);
		return () => clearTimeout(timer);
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="flex flex-col items-center gap-3">
		<span class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent"></span>
		<p class="text-sm text-muted-foreground">Completing sign-in...</p>
	</div>
</div>
