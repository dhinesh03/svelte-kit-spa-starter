---
name: sveltekit-remote-functions
description: 'SvelteKit remote functions (experimental): query, form(), command, prerender in .remote.ts/.remote.js files. Server-client data bridge with $app/server, validation, batching, and single-flight mutations. Use for remote function patterns.'
---

# SvelteKit Remote Functions (Experimental, since 2.27)

## Setup

```ts
// svelte.config.js
kit: {
  experimental: { remoteFunctions: true }
},
compilerOptions: {
  experimental: { async: true }
}
```

## File Convention

- `.remote.js` or `.remote.ts` files anywhere in `src/` (except `src/lib/server`)
- Third-party libraries can provide them too

## query — Read Dynamic Data

```ts
// src/lib/api/posts.remote.ts
import { query } from '$app/server';

export const getPosts = query(async () => {
	const posts = await db.posts.findMany();
	return posts;
});

// With validation (Standard Schema — Zod/Valibot)
export const getPost = query(
	async (id: string) => {
		return await db.posts.findUnique({ where: { id } });
	},
	{ schema: z.string().uuid() }
);
```

### Usage in Components

```svelte
<script>
	import { getPosts } from '$lib/api/posts.remote';
	const posts = getPosts();
</script>

{#await posts}
	<p>Loading...</p>
{:then data}
	{#each data as post}
		<p>{post.title}</p>
	{/each}
{/await}
```

### Key Behaviors

- Returns Promise-like with `loading`, `error`, `current` properties
- Serialized with devalue (handles Date, Map, custom types via transport hook)
- **Cached while on page**: `getPosts() === getPosts()` (same reference)
- `refresh()` to re-fetch: `await getPosts().refresh()`

## query.batch — Solve N+1 (since 2.35)

```ts
export const getPost = query.batch(async (ids: string[]) => {
	const posts = await db.posts.findMany({ where: { id: { in: ids } } });
	return (id: string) => posts.find((p) => p.id === id);
});
```

- Server receives array of all simultaneous arguments
- Returns resolver function

## form — Write Data with Forms

```ts
import { form } from '$app/server';

export const createPost = form(
	async ({ title, body }) => {
		await db.posts.create({ data: { title, body } });
	},
	{ schema: postSchema }
);
```

### Usage

```svelte
<form {...createPost}>
	<input {...createPost.fields.title.as('text')} />
	<textarea {...createPost.fields.body.as('textarea')} />
	<button>Create</button>
</form>
```

### Fields API

- `createPost.fields.title.as('text')` → input attributes
- Nested: objects, arrays, files supported
- Sensitive: prefix with `_` (e.g., `_password`) to prevent repopulation on validation fail

### Validation

- Schema validation via Standard Schema (Zod/Valibot)
- Programmatic: `invalid()` helper
- Client-side preflight: `createPost.preflight(schema)`
- On-input: `validate()`

### Multi-Instance

```svelte
{#each posts as post}
	<form {...editPost.for(post.id)}>...</form>
{/each}
```

### Single-Flight Mutations

```ts
// Server-driven refresh
await getPosts().refresh();
// Client-driven
submit().updates(getPosts());
```

## command — Non-Form Operations

```ts
import { command } from '$app/server';

export const deletePost = command(async (id: string) => {
	await db.posts.delete({ where: { id } });
});
```

- NOT tied to form elements — callable from anywhere
- **Cannot redirect** (unlike form/query)
- **Cannot be called during render**
- Must explicitly specify which queries to refresh

## prerender — Build-Time Data

```ts
import { prerender } from '$app/server';

export const getConfig = prerender(async () => {
	return await fetchConfig();
});
```

- Invoked at build time, cached on CDN
- Browser caches via Cache API (survives reload, cleared on new deploy)
- `inputs` option for argument values
- `dynamic: true` to keep in server bundle
- **GOTCHA**: Cannot use `query` on pages with `export const prerender = true`

## getRequestEvent() in Remote Functions

- `route`, `params`, `url` relate to **calling page**, not endpoint URL
- Cannot set response headers (except cookies in form/command)
- Cannot use `redirect()` inside `command`

## When to Use Which

| Pattern       | Use Case                                                   |
| ------------- | ---------------------------------------------------------- |
| `query`       | Reading dynamic data, caching, reactive updates            |
| `query.batch` | N+1 problems, multiple simultaneous queries                |
| `form`        | User input, progressive enhancement, no-JS fallback        |
| `command`     | Imperative operations (delete, trigger), non-form contexts |
| `prerender`   | Static/config data, CDN-cached, build-time generation      |

@references references/remote-functions.md
