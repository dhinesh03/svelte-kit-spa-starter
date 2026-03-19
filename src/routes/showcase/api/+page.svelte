<script lang="ts">
	import {
		getPosts,
		getUsers,
		getPostComments,
		getTodosByUser,
		type Post,
		type User,
		type Comment,
		type Todo
	} from '$lib/apis/json-placeholder';
	import * as Card from '$lib/components/ui/card/index.js';
	import { resource } from 'runed';

	// ── State ────────────────────────────────────────────────────────────

	let selectedUserId = $state<number | undefined>(undefined);
	let selectedPost = $state<Post | undefined>(undefined);

	// ── Resources ────────────────────────────────────────────────────────

	const users = resource(
		() => true,
		async (_v, _pv, { signal }) => {
			const { request, cancel } = getUsers();
			signal.addEventListener('abort', () => cancel('dependency changed'));
			const { data } = await request;
			return data;
		},
		{ initialValue: [] as User[] }
	);

	const posts = resource(
		() => selectedUserId,
		async (userId, _prev, { signal }) => {
			if (userId === undefined) return [];
			const { request, cancel } = getPosts({ userId });
			signal.addEventListener('abort', () => cancel('dependency changed'));
			const { data } = await request;
			return data;
		},
		{ initialValue: [] as Post[] }
	);

	const comments = resource(
		() => selectedPost?.id,
		async (postId, _prev, { signal }) => {
			if (postId === undefined) return [];
			const { request, cancel } = getPostComments(postId);
			signal.addEventListener('abort', () => cancel('dependency changed'));
			const { data } = await request;
			return data;
		},
		{ initialValue: [] as Comment[] }
	);

	const todos = resource(
		() => selectedUserId,
		async (userId, _prev, { signal }) => {
			if (userId === undefined) return [];
			const { request, cancel } = getTodosByUser(userId);
			signal.addEventListener('abort', () => cancel('dependency changed'));
			const { data } = await request;
			return data;
		},
		{ initialValue: [] as Todo[] }
	);

	// ── Derived ──────────────────────────────────────────────────────────

	const selectedUser = $derived(users.current.find((u) => u.id === selectedUserId));
	const completedCount = $derived(todos.current.filter((t) => t.completed).length);
	const totalTodos = $derived(todos.current.length);

	// ── Handlers ─────────────────────────────────────────────────────────

	function selectUser(userId: number) {
		selectedPost = undefined;
		selectedUserId = userId;
	}
</script>

<div class="mx-auto max-w-5xl space-y-8 overflow-y-auto p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">API + Resource Showcase</h1>
		<p class="mt-2 text-muted-foreground">
			Reactive data fetching with <code class="rounded bg-muted px-1.5 py-0.5 text-sm">runed resource</code>
			and <code class="rounded bg-muted px-1.5 py-0.5 text-sm">FetchService</code>. Select a user to load their posts and todos.
		</p>
	</div>

	<!-- Users -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold tracking-tight">Users</h2>

		{#if users.loading}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
				Loading users...
			</div>
		{:else if users.error}
			<p class="text-sm text-destructive">Failed to load users: {users.error.message}</p>
		{:else}
			<div class="flex flex-wrap gap-2">
				{#each users.current as user (user.id)}
					<button
						class="rounded-lg border px-3 py-2 text-sm transition-colors {selectedUserId === user.id
							? 'border-primary bg-primary text-primary-foreground'
							: 'border-border bg-card hover:bg-accent'}"
						onclick={() => selectUser(user.id)}
					>
						{user.name}
					</button>
				{/each}
			</div>
		{/if}
	</section>

	{#if selectedUser}
		<!-- User Detail -->
		<Card.Root>
			<Card.Header>
				<Card.Title>{selectedUser.name}</Card.Title>
				<Card.Description>@{selectedUser.username} &middot; {selectedUser.email}</Card.Description>
			</Card.Header>
			<Card.Content>
				<dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
					<div>
						<dt class="text-muted-foreground">Phone</dt>
						<dd class="font-medium">{selectedUser.phone}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Website</dt>
						<dd class="font-medium">{selectedUser.website}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Company</dt>
						<dd class="font-medium">{selectedUser.company.name}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">City</dt>
						<dd class="font-medium">{selectedUser.address.city}</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>

		<div class="grid gap-8 lg:grid-cols-3">
			<!-- Posts (2/3 width) -->
			<section class="space-y-4 lg:col-span-2">
				<h2 class="text-xl font-semibold tracking-tight">
					Posts
					{#if !posts.loading}
						<span class="text-sm font-normal text-muted-foreground">({posts.current.length})</span>
					{/if}
				</h2>

				{#if posts.loading}
					<div class="space-y-3">
						{#each { length: 3 } as _, i (i)}
							<div class="h-20 animate-pulse rounded-lg bg-muted"></div>
						{/each}
					</div>
				{:else if posts.error}
					<p class="text-sm text-destructive">Failed to load posts: {posts.error.message}</p>
				{:else}
					<div class="space-y-3">
						{#each posts.current as post (post.id)}
							<button
								class="w-full rounded-lg border p-4 text-left transition-colors {selectedPost?.id === post.id
									? 'border-primary bg-primary/5'
									: 'border-border hover:bg-accent'}"
								onclick={() => (selectedPost = post)}
							>
								<h3 class="text-sm leading-snug font-medium capitalize">{post.title}</h3>
								<p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{post.body}</p>
							</button>
						{/each}
					</div>
				{/if}

				<!-- Comments for selected post -->
				{#if selectedPost}
					<div class="mt-6 space-y-3">
						<h3 class="text-lg font-semibold">
							Comments on: <span class="font-normal capitalize italic">{selectedPost.title}</span>
							{#if !comments.loading}
								<span class="text-sm font-normal text-muted-foreground">({comments.current.length})</span>
							{/if}
						</h3>

						{#if comments.loading}
							<div class="space-y-2">
								{#each { length: 2 } as _, i (i)}
									<div class="h-16 animate-pulse rounded-lg bg-muted"></div>
								{/each}
							</div>
						{:else if comments.error}
							<p class="text-sm text-destructive">{comments.error.message}</p>
						{:else}
							{#each comments.current as comment (comment.id)}
								<Card.Root>
									<Card.Content class="py-3">
										<p class="text-xs font-medium text-foreground">{comment.name}</p>
										<p class="text-xs text-muted-foreground">{comment.email}</p>
										<p class="mt-1.5 text-sm">{comment.body}</p>
									</Card.Content>
								</Card.Root>
							{/each}
						{/if}
					</div>
				{/if}
			</section>

			<!-- Todos (1/3 width) -->
			<section class="space-y-4">
				<h2 class="text-xl font-semibold tracking-tight">
					Todos
					{#if !todos.loading && totalTodos > 0}
						<span class="text-sm font-normal text-muted-foreground">{completedCount}/{totalTodos} done</span>
					{/if}
				</h2>

				{#if todos.loading}
					<div class="space-y-2">
						{#each { length: 5 } as _, i (i)}
							<div class="h-8 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else if todos.error}
					<p class="text-sm text-destructive">{todos.error.message}</p>
				{:else}
					<ul class="space-y-1.5">
						{#each todos.current as todo (todo.id)}
							<li class="flex items-start gap-2 text-sm">
								<span class="mt-0.5 {todo.completed ? 'text-green-500' : 'text-muted-foreground'}">
									{todo.completed ? '✓' : '○'}
								</span>
								<span class={todo.completed ? 'text-muted-foreground line-through' : ''}>
									{todo.title}
								</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		</div>
	{/if}
</div>
