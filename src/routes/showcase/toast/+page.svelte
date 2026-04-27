<script lang="ts">
	import { tick } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	// ── Promise Demo ────────────────────────────────────────────────────

	function simulatePromise(shouldSucceed: boolean): Promise<{ name: string }> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (shouldSucceed) {
					resolve({ name: 'svelte-sonner' });
				} else {
					reject(new Error('Request failed'));
				}
			}, 2000);
		});
	}

	// ── Action/Cancel Demo ──────────────────────────────────────────────

	let eventLog = $state<string[]>([]);

	function logEvent(msg: string) {
		eventLog = [...eventLog.slice(-4), msg];
	}

	// ── Dismiss All — workaround for svelte-sonner heights race condition
	async function dismissAll() {
		const active = toast.getActiveToasts();
		for (const t of active) {
			toast.dismiss(t.id);
			await tick();
		}
	}
</script>

<div class="mx-auto max-w-4xl space-y-12 overflow-y-auto p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Toast Showcase</h1>
		<p class="mt-2 text-muted-foreground">
			All capabilities of the <code class="rounded bg-muted px-1.5 py-0.5 text-sm">sonner</code> toast library.
		</p>
	</div>

	<!-- Toast Types -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">Toast Types</h2>
		<p class="text-muted-foreground">Each type has distinct styling and an icon.</p>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Card.Root>
				<Card.Header>
					<Card.Title>Default</Card.Title>
					<Card.Description>A simple notification.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button variant="outline" onclick={() => toast('Event has been created')}>Show Default</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Success</Card.Title>
					<Card.Description>Indicates a successful action.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button variant="outline" onclick={() => toast.success('Changes saved successfully')}>Show Success</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Error</Card.Title>
					<Card.Description>Indicates a failed action.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button variant="outline" onclick={() => toast.error('Failed to delete item')}>Show Error</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Info</Card.Title>
					<Card.Description>Informational notification.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button variant="outline" onclick={() => toast.info('New version available')}>Show Info</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Warning</Card.Title>
					<Card.Description>Warns about a potential issue.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button variant="outline" onclick={() => toast.warning('Disk space running low')}>Show Warning</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Loading</Card.Title>
					<Card.Description>Shows a spinner while processing.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button variant="outline" onclick={() => toast.loading('Uploading files...')}>Show Loading</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- Rich Content -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">Rich Content</h2>
		<p class="text-muted-foreground">Toasts with descriptions, actions, and cancel buttons.</p>

		<div class="grid gap-4 sm:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>With Description</Card.Title>
					<Card.Description>Additional context below the title.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast.success('File uploaded', {
								description: 'report-q4.pdf has been uploaded to the shared folder.'
							})}
					>
						Show Description
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Action Button</Card.Title>
					<Card.Description>Toast with an actionable button.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast('Message archived', {
								action: {
									label: 'Undo',
									onClick: () => logEvent('Undo clicked')
								}
							})}
					>
						Show Action
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Cancel Button</Card.Title>
					<Card.Description>Toast with both action and cancel.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast('Confirm deletion?', {
								action: {
									label: 'Delete',
									onClick: () => logEvent('Delete confirmed')
								},
								cancel: {
									label: 'Cancel',
									onClick: () => logEvent('Deletion cancelled')
								}
							})}
					>
						Show Action + Cancel
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Close Button</Card.Title>
					<Card.Description>Toast with an explicit close button.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast.info('Notification with close button', {
								closeButton: true
							})}
					>
						Show Close Button
					</Button>
				</Card.Content>
			</Card.Root>
		</div>

		{#if eventLog.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>Event Log</Card.Title>
				</Card.Header>
				<Card.Content>
					<ul class="space-y-1 text-sm text-muted-foreground">
						{#each eventLog as entry (entry)}
							<li class="font-mono">{entry}</li>
						{/each}
					</ul>
				</Card.Content>
			</Card.Root>
		{/if}
	</section>

	<!-- Promise Toast -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">Promise</h2>
		<p class="text-muted-foreground">Automatically tracks loading, success, and error states of a promise.</p>

		<div class="grid gap-4 sm:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Successful Promise</Card.Title>
					<Card.Description>Resolves after 2 seconds.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast.promise(simulatePromise(true), {
								loading: 'Processing...',
								success: (data) => `Done! Loaded ${data.name}`,
								error: 'Something went wrong'
							})}
					>
						Start Promise (Success)
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Failing Promise</Card.Title>
					<Card.Description>Rejects after 2 seconds.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast.promise(simulatePromise(false), {
								loading: 'Processing...',
								success: 'Done!',
								error: 'Request failed — please try again'
							})}
					>
						Start Promise (Error)
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- Configuration -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">Configuration</h2>
		<p class="text-muted-foreground">Per-toast customizations like duration, position, and dismissibility.</p>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Card.Root>
				<Card.Header>
					<Card.Title>Custom Duration</Card.Title>
					<Card.Description>Stays visible for 10 seconds.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast.info('This stays for 10 seconds', {
								duration: 10000
							})}
					>
						Long Duration
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Infinite Duration</Card.Title>
					<Card.Description>Never auto-dismisses.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast.warning('This will not auto-close', {
								duration: Infinity,
								closeButton: true
							})}
					>
						Infinite Toast
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Non-Dismissible</Card.Title>
					<Card.Description>Cannot be swiped away.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						variant="outline"
						onclick={() =>
							toast.error('Critical error — action required', {
								dismissible: false,
								action: {
									label: 'Acknowledge',
									onClick: () => logEvent('Error acknowledged')
								}
							})}
					>
						Non-Dismissible
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Rich Colors</Card.Title>
					<Card.Description>Uses more vivid status colors.</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-wrap gap-2">
					<Button variant="outline" onclick={() => toast.success('Vivid success', { richColors: true })}>Success</Button>
					<Button variant="outline" onclick={() => toast.error('Vivid error', { richColors: true })}>Error</Button>
					<Button variant="outline" onclick={() => toast.warning('Vivid warning', { richColors: true })}>Warning</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Custom Position</Card.Title>
					<Card.Description>Toast at different positions.</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-wrap gap-2">
					<Button variant="outline" onclick={() => toast('Top-left toast', { position: 'top-left' })}>Top Left</Button>
					<Button variant="outline" onclick={() => toast('Top-center toast', { position: 'top-center' })}>Top Center</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Dismiss All</Card.Title>
					<Card.Description>Programmatically dismiss all toasts.</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-wrap gap-2">
					<Button
						variant="outline"
						onclick={() => {
							toast('Toast 1');
							toast('Toast 2');
							toast('Toast 3');
						}}
					>
						Show 3 Toasts
					</Button>
					<Button variant="destructive" onclick={dismissAll}>Dismiss All</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- Update Toast -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">Update Existing Toast</h2>
		<p class="text-muted-foreground">Update the content and type of a toast after creation.</p>

		<Card.Root>
			<Card.Header>
				<Card.Title>Update Toast</Card.Title>
				<Card.Description>Creates a loading toast, then updates it to success after 2 seconds.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Button
					variant="outline"
					onclick={() => {
						const id = toast.loading('Saving changes...');
						setTimeout(() => {
							toast.success('Changes saved!', { id });
						}, 2000);
					}}
				>
					Show Updating Toast
				</Button>
			</Card.Content>
		</Card.Root>
	</section>
</div>
