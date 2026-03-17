<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import ConstructionIcon from '@lucide/svelte/icons/construction';

	interface Props {
		title?: string;
		message?: string;
	}

	let { title = 'Under Construction', message = 'This page is currently being built. Check back soon!' }: Props = $props();
</script>

<div class="flex min-h-100 items-center justify-center p-8">
	<Card.Root class="max-w-md">
		<Card.Content class="flex flex-col items-center gap-4 py-12 text-center">
			<div class="rounded-full bg-primary/10 p-6">
				<ConstructionIcon class="size-12 text-primary" />
			</div>
			<div>
				<h2 class="mb-2 text-xl font-semibold">{title}</h2>
				<p class="text-sm text-muted-foreground">{message}</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
