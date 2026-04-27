<script lang="ts">
	import { getAuthService } from '$lib/services/auth-service';

	const auth = getAuthService();
	const authState = $derived(auth.current);
</script>

<div class="mx-auto max-w-3xl space-y-6 p-8">
	<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
	{#if authState.userProfile}
		<p class="text-sm text-muted-foreground">
			Signed in as {authState.userProfile.name ?? authState.userProfile.email}
		</p>
	{/if}
</div>
