---
name: sveltekit-data-loading
description: 'SvelteKit data loading: universal vs server load functions (+page.ts, +page.server.ts), dependency tracking, invalidation, invalidateAll, streaming, form actions, state management, hooks (handle, handleFetch, handleError, reroute, transport), getRequestEvent, and depends.'
---

# SvelteKit Data Loading

## Two Types of Load Functions

|         | Universal (+page.ts)                                                  | Server (+page.server.ts)                                                     |
| ------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Runs on | Server (SSR) + Client                                                 | Server only                                                                  |
| Access  | params, url, route, fetch, setHeaders, parent, depends, untrack, data | Same + cookies, locals, platform, request, clientAddress                     |
| Returns | Any value (classes, components)                                       | Serializable only (devalue: JSON + Date, Map, Set, BigInt, RegExp, promises) |

**SPA NOTE**: With `ssr = false`, universal load ONLY runs in browser. Server load is NOT available.

### When Universal Load Runs

- SSR first visit: on server
- Hydration: reuses fetch responses (no extra network calls)
- Subsequent navigations: browser only

### If Both Exist

Server load runs first → return becomes `data` prop of universal load:

```ts
// +page.server.ts
export async function load() {
	return { serverMsg: 'hi' };
}
// +page.ts
export async function load({ data }) {
	return { serverMsg: data.serverMsg, clientMsg: 'hello' };
}
```

## Fetch in Load — Special Behavior

- Credentialed server-side requests (inherits cookies/auth headers)
- Relative requests work on server
- Internal requests: direct handler call (no HTTP overhead)
- SSR: responses inlined into HTML; hydration reads from HTML
- Cookie forwarding: only to same domain or more specific subdomain

## Dependency Tracking & Invalidation

### Tracked Dependencies

- `params`, `url.pathname`, `url.search`
- `url.searchParams.get('x')` — tracks only `x`
- `await parent()` — reruns when parent reruns
- `fetch(url)` and `depends(url)` — tracked for invalidation
- **Dependencies after load returns are NOT tracked**
- `untrack()` to exclude from tracking

### Invalidation

```ts
import { invalidate, invalidateAll } from '$app/navigation';
invalidate('app:posts'); // custom identifier
invalidate('/api/posts'); // URL match
invalidateAll(); // ALL load functions
```

## Streaming (server load only)

```ts
export async function load() {
	return {
		post: await loadPost(), // blocks render
		comments: loadComments() // NOT awaited = streamed
	};
}
```

- GOTCHA: Must handle promise rejections or server crashes
- Does NOT work when JS disabled
- AWS Lambda/Firebase buffer (no streaming)

## Layout Data Cascading

- Data from layout load available to ALL child pages/layouts
- Same key: page overrides layout (last wins)
- Layout loads don't rerun on child navigation unless dependencies change

## State Management

- NEVER store user data in shared server-side variables (shared across requests)
- Component reuse: navigating between similar routes doesn't destroy/recreate
  - Use `$derived(data.content)` for data-dependent values
  - Use `{#key page.url.pathname}` to force recreate
- Context update gotcha: SSR updates in children don't affect already-rendered parents

## Form Actions (server only, NOT in SPA)

```ts
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		if (invalid) return fail(400, { email, missing: true });
		redirect(303, '/dashboard');
	}
};
```

### Key Rules

- Named: `action="?/login"`, Default: just `method="POST"`
- Cannot mix default and named actions on same page
- `use:enhance` for progressive enhancement (no full-page reload)
- GET forms treated like links (invoke load, not actions)
- **GOTCHA**: `redirect()` and `error()` throw — don't catch them

**SPA ALTERNATIVE**: Use direct fetch calls to external APIs or `+server.ts` endpoints.

## Hooks

### Server (hooks.server.ts) — NOT in SPA

```ts
export async function handle({ event, resolve }) {
	event.locals.user = await getUser(event.cookies.get('session'));
	return resolve(event);
}
```

- `sequence()` from `@sveltejs/kit/hooks` for chaining

### Client (hooks.client.ts) — Available in SPA

```ts
export function handleError({ error, event, status, message }) {
	reportError(error);
	return { message: 'Something went wrong' };
}
```

### Universal (hooks.ts)

#### reroute

```ts
export function reroute({ url }) {
	if (url.pathname === '/old') return '/new';
}
```

#### transport — Custom Type Serialization

```ts
export const transport = {
	Vector: {
		encode: (v) => v instanceof Vector && [v.x, v.y],
		decode: ([x, y]) => new Vector(x, y)
	}
};
```

@references references/load-functions.md
@references references/form-actions.md
@references references/hooks.md
