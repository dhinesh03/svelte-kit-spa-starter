<script lang="ts">
	import type { ItemType } from '$lib/components/combobox/types';
	import type { ReorderEvent } from '$lib/components/sortable-list';

	import ComboBox from '$lib/components/combobox/ComboBox.svelte';
	import { SortableList } from '$lib/components/sortable-list';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	// ── ComboBox Data ────────────────────────────────────────────────────

	const fruits: ItemType[] = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'grape', label: 'Grape' },
		{ value: 'mango', label: 'Mango' },
		{ value: 'orange', label: 'Orange' },
		{ value: 'peach', label: 'Peach' },
		{ value: 'pear', label: 'Pear' },
		{ value: 'strawberry', label: 'Strawberry' },
		{ value: 'watermelon', label: 'Watermelon' }
	];

	const groupedItems: ItemType[] = [
		{ value: 'js', label: 'JavaScript', group: 'Frontend' },
		{ value: 'ts', label: 'TypeScript', group: 'Frontend' },
		{ value: 'svelte', label: 'Svelte', group: 'Frontend' },
		{ value: 'react', label: 'React', group: 'Frontend' },
		{ value: 'vue', label: 'Vue', group: 'Frontend' },
		{ value: 'node', label: 'Node.js', group: 'Backend' },
		{ value: 'python', label: 'Python', group: 'Backend' },
		{ value: 'go', label: 'Go', group: 'Backend' },
		{ value: 'rust', label: 'Rust', group: 'Backend' },
		{ value: 'postgres', label: 'PostgreSQL', group: 'Database' },
		{ value: 'mysql', label: 'MySQL', group: 'Database' },
		{ value: 'redis', label: 'Redis', group: 'Database' }
	];

	const statuses: ItemType[] = [
		{ value: 'backlog', label: 'Backlog' },
		{ value: 'todo', label: 'Todo' },
		{ value: 'in-progress', label: 'In Progress' },
		{ value: 'done', label: 'Done' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	let singleValue = $state<string | undefined>(undefined);
	let selectValue = $state<string | undefined>(undefined);
	let multiValue = $state<string[]>([]);
	let groupedValue = $state<string[]>([]);

	// ── SortableList Data ────────────────────────────────────────────────

	interface TaskItem {
		id: string;
		title: string;
		priority: 'low' | 'medium' | 'high';
	}

	let tasks = $state<TaskItem[]>([
		{ id: '1', title: 'Review pull request', priority: 'high' },
		{ id: '2', title: 'Update documentation', priority: 'medium' },
		{ id: '3', title: 'Fix login bug', priority: 'high' },
		{ id: '4', title: 'Write unit tests', priority: 'medium' },
		{ id: '5', title: 'Deploy to staging', priority: 'low' }
	]);

	interface PlaylistItem {
		id: string;
		title: string;
		artist: string;
		duration: string;
	}

	let playlist = $state<PlaylistItem[]>([
		{ id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
		{ id: '2', title: 'Hotel California', artist: 'Eagles', duration: '6:30' },
		{ id: '3', title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02' },
		{ id: '4', title: 'Imagine', artist: 'John Lennon', duration: '3:03' },
		{ id: '5', title: 'Smells Like Teen Spirit', artist: 'Nirvana', duration: '5:01' }
	]);

	const priorityColor = {
		low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	};

	function handleTaskReorder(event: ReorderEvent<TaskItem>) {
		tasks = event.items;
	}

	function handlePlaylistReorder(event: ReorderEvent<PlaylistItem>) {
		playlist = event.items;
	}
</script>

<div class="mx-auto max-w-4xl space-y-12 overflow-y-auto p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Component Showcase</h1>
		<p class="mt-2 text-muted-foreground">Interactive examples of custom components.</p>
	</div>

	<!-- ComboBox Section -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">ComboBox</h2>
		<p class="text-muted-foreground">A searchable dropdown with single and multiple selection, grouping, and virtual scrolling.</p>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Select (No Search) -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Select (No Search)</Card.Title>
					<Card.Description>Simple select-like dropdown for small lists.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					<ComboBox items={statuses} type="single" bind:value={selectValue} placeholder="Set status..." searchable={false} />
					{#if selectValue}
						<p class="text-sm text-muted-foreground">Status: <span class="font-medium text-foreground">{selectValue}</span></p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Single Selection -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Single Selection</Card.Title>
					<Card.Description>Pick one fruit from the list.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					<ComboBox
						items={fruits}
						type="single"
						bind:value={singleValue}
						placeholder="Select a fruit..."
						searchPlaceholder="Search fruits..."
					/>
					{#if singleValue}
						<p class="text-sm text-muted-foreground">Selected: <span class="font-medium text-foreground">{singleValue}</span></p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Multiple Selection -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Multiple Selection</Card.Title>
					<Card.Description>Select multiple fruits with tags.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					<ComboBox
						items={fruits}
						type="multiple"
						size="xs"
						bind:value={multiValue}
						placeholder="Select fruits..."
						searchPlaceholder="Search fruits..."
						maxLines={1}
					/>
					{#if multiValue.length > 0}
						<p class="text-sm text-muted-foreground">
							Selected: <span class="font-medium text-foreground">{multiValue.length} item{multiValue.length > 1 ? 's' : ''}</span>
						</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Grouped Items -->
			<Card.Root class="md:col-span-2">
				<Card.Header>
					<Card.Title>Grouped Items</Card.Title>
					<Card.Description>Items organized by category with group-level select/clear actions.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					<div class="max-w-sm">
						<ComboBox
							items={groupedItems}
							type="multiple"
							bind:value={groupedValue}
							placeholder="Select technologies..."
							searchPlaceholder="Search technologies..."
						/>
					</div>
					{#if groupedValue.length > 0}
						<div class="flex flex-wrap gap-1">
							{#each groupedValue as val (val)}
								<Badge variant="secondary">{groupedItems.find((i) => i.value === val)?.label}</Badge>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- SortableList Section -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">SortableList</h2>
		<p class="text-muted-foreground">Drag-and-drop reorderable lists with handle or full-item drag modes.</p>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Handle Mode -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Handle Mode</Card.Title>
					<Card.Description>Drag using the grip handle on the left.</Card.Description>
				</Card.Header>
				<Card.Content>
					<SortableList items={tasks} keyFn={(item) => item.id} onReorder={handleTaskReorder} dragMode="handle">
						{#snippet children(item: TaskItem)}
							<div class="flex flex-1 items-center justify-between">
								<span class="text-sm font-medium">{item.title}</span>
								<span class="rounded-full px-2 py-0.5 text-xs font-medium {priorityColor[item.priority]}">
									{item.priority}
								</span>
							</div>
						{/snippet}
					</SortableList>
				</Card.Content>
			</Card.Root>

			<!-- Item Mode -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Item Mode</Card.Title>
					<Card.Description>Drag the entire item to reorder.</Card.Description>
				</Card.Header>
				<Card.Content>
					<SortableList items={playlist} keyFn={(item) => item.id} onReorder={handlePlaylistReorder} dragMode="item">
						{#snippet children(item: PlaylistItem)}
							<div class="flex flex-1 items-center justify-between">
								<div>
									<p class="text-sm font-medium">{item.title}</p>
									<p class="text-xs text-muted-foreground">{item.artist}</p>
								</div>
								<span class="text-xs text-muted-foreground tabular-nums">{item.duration}</span>
							</div>
						{/snippet}
					</SortableList>
				</Card.Content>
			</Card.Root>
		</div>
	</section>
</div>
