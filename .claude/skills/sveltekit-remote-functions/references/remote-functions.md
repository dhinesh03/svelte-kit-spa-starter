# Remote Functions Detailed Reference

## query — Complete Patterns

### Basic Query

```ts
// posts.remote.ts
import { query } from '$app/server';

export const getPosts = query(async () => {
	return await db.posts.findMany({ orderBy: { createdAt: 'desc' } });
});
```

### Query with Validation

```ts
import { z } from 'zod';

export const getPost = query(
	async (slug: string) => {
		const post = await db.posts.findUnique({ where: { slug } });
		if (!post) throw error(404, 'Not found');
		return post;
	},
	{
		schema: z.string().min(1)
	}
);
```

### Caching Behavior

```ts
// Same reference while on page
const posts1 = getPosts();
const posts2 = getPosts();
posts1 === posts2; // true — cached

// Force refresh
await getPosts().refresh();
```

### Error Handling

```svelte
{#await getPosts()}
	<p>Loading...</p>
{:then posts}
	{#each posts as post}
		<p>{post.title}</p>
	{/each}
{:catch error}
	<p>Error: {error.message}</p>
{/await}
```

## form — Complete Patterns

### Full Form with Validation

```ts
import { form, invalid } from '$app/server';
import { z } from 'zod';

const postSchema = z.object({
	title: z.string().min(1).max(200),
	body: z.string().min(10),
	_password: z.string().optional() // underscore = sensitive
});

export const createPost = form(
	async (data) => {
		const post = await db.posts.create({ data });

		// Programmatic validation
		if ((await db.posts.count({ where: { title: data.title } })) > 0) {
			return invalid({ title: 'already exists' });
		}

		return post;
	},
	{ schema: postSchema }
);
```

### Fields API

```svelte
<form {...createPost}>
	<!-- Text input -->
	<input {...createPost.fields.title.as('text')} />

	<!-- Textarea -->
	<textarea {...createPost.fields.body.as('textarea')} />

	<!-- File upload -->
	<input {...createPost.fields.avatar.as('file')} />

	<!-- Nested object -->
	<input {...createPost.fields.address.street.as('text')} />

	<!-- Array -->
	{#each tags as _, i}
		<input {...createPost.fields.tags[i].as('text')} />
	{/each}

	<button>Create</button>
</form>
```

### Client-Side Preflight

```ts
createPost.preflight(clientSchema); // validates before server round-trip
createPost.validate(); // on-input validation
```

## command — Patterns

### Basic Command

```ts
export const deletePost = command(async (id: string) => {
	await db.posts.delete({ where: { id } });
});
```

### With Query Refresh

```svelte
<button
	onclick={async () => {
		await deletePost(post.id);
		await getPosts().refresh(); // explicit refresh
	}}
>
	Delete
</button>
```

## prerender — Patterns

### Static Config

```ts
export const getConfig = prerender(async () => {
	return await fetchSiteConfig();
});
// Cached on CDN, updated on deploy
```

### With Dynamic Fallback

```ts
export const getConfig = prerender(
	async () => {
		return await fetchConfig();
	},
	{
		dynamic: true // also available at runtime
	}
);
```

## Transport Hook for Custom Types

```ts
// hooks.ts
export const transport = {
	Decimal: {
		encode: (v) => v instanceof Decimal && v.toString(),
		decode: (s) => new Decimal(s)
	}
};
```

Works with query, form, and command serialization.
