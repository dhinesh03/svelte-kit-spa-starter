<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
	import HomeIcon from '@lucide/svelte/icons/home';
	import RefreshCcwIcon from '@lucide/svelte/icons/refresh-ccw';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'An unexpected error occurred');

	const errorTitle = $derived.by(() => {
		switch (status) {
			case 404:
				return 'Page Not Found';
			case 403:
				return 'Access Denied';
			case 500:
				return 'Server Error';
			default:
				return 'Something Went Wrong';
		}
	});

	const errorDescription = $derived.by(() => {
		switch (status) {
			case 404:
				return "The page you're looking for doesn't exist or has been moved.";
			case 403:
				return "You don't have permission to access this resource.";
			case 500:
				return 'An internal server error occurred. Please try again later.';
			default:
				return message;
		}
	});

	function handleGoHome() {
		goto(resolve('/'));
	}

	function handleRefresh() {
		window.location.reload();
	}
</script>

<div class="flex min-h-full items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
				<AlertTriangleIcon class="size-8 text-destructive" />
			</div>
			<Card.Title class="text-2xl font-semibold">
				{errorTitle}
			</Card.Title>
			<Card.Description class="text-base">
				{errorDescription}
			</Card.Description>
		</Card.Header>
		<Card.Content class="text-center">
			{#if status}
				<p class="mb-4 text-sm text-muted-foreground">Error code: {status}</p>
			{/if}
		</Card.Content>
		<Card.Footer class="flex justify-center gap-3">
			<Button variant="outline" onclick={handleRefresh}>
				<RefreshCcwIcon class="mr-2 size-4" />
				Refresh
			</Button>
			<Button onclick={handleGoHome}>
				<HomeIcon class="mr-2 size-4" />
				Go Home
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
