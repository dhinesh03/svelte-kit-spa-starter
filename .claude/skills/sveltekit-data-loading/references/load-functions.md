# Load Functions Reference

## Universal Load (+page.ts) in SPA Mode

```ts
// src/routes/posts/+page.ts
export async function load({ fetch, params, url, depends }) {
	depends('app:posts'); // register custom invalidation key

	const page = url.searchParams.get('page') ?? '1';
	const res = await fetch(`https://api.example.com/posts?page=${page}`);

	if (!res.ok) throw error(res.status, 'Failed to load posts');

	return { posts: await res.json() };
}
```

## Dependency Tracking

```ts
export async function load({ url, params, fetch, depends, untrack }) {
	// Tracked automatically:
	params.slug; // reruns on slug change
	url.pathname; // reruns on path change
	url.searchParams.get('sort'); // reruns on ?sort= change
	fetch('/api/data'); // tracked for invalidation

	// Manual tracking:
	depends('app:posts'); // custom invalidation key

	// Exclude from tracking:
	untrack(() => url.searchParams.get('debug')); // won't trigger rerun
}
```

## Parent Data Access

```ts
export async function load({ parent }) {
	// GOTCHA: Creates dependency on parent — rerun when parent reruns
	const parentData = await parent();

	// ANTI-PATTERN: waterfall
	const data = await parent();
	const posts = await fetchPosts(data.user.id);

	// BETTER: fetch independently, then await parent
	const postsPromise = fetchPosts(); // start immediately
	const data = await parent();
	const posts = await postsPromise;
}
```

## Error Handling

```ts
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const post = await getPost(params.slug);
	if (!post) throw error(404, 'Post not found');
	if (post.draft) throw redirect(303, '/posts');
	return { post };
}
```

**GOTCHA**: `error()` and `redirect()` throw — don't catch them in try/catch.
