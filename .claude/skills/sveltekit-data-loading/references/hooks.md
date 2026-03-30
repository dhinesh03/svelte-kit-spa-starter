# Hooks Reference

## Available in SPA Mode

### hooks.client.ts

```ts
export function handleError({ error, event, status, message }) {
	console.error(error);
	return { message: 'Something went wrong' };
}

export async function init() {
	// Runs once before hydration — delays until resolved
	await initAnalytics();
}
```

### hooks.ts (Universal)

```ts
// Reroute: translate URLs before routing
export function reroute({ url }) {
	if (url.pathname.startsWith('/old-path')) {
		return url.pathname.replace('/old-path', '/new-path');
	}
}

// Transport: custom type serialization
export const transport = {
	BigDecimal: {
		encode: (v) => v instanceof BigDecimal && v.toString(),
		decode: (s) => new BigDecimal(s)
	}
};
```

## NOT Available in SPA Mode

### hooks.server.ts

```ts
// handle — modifies every server request
export async function handle({ event, resolve }) {
	const session = event.cookies.get('session');
	event.locals.user = session ? await getUser(session) : null;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', 'en'),
		filterSerializedResponseHeaders: (name) => name === 'content-type',
		preload: ({ type }) => type === 'js' || type === 'css'
	});

	return response;
}

// handleFetch — modify server-side fetch calls
export async function handleFetch({ event, request, fetch }) {
	if (request.url.startsWith('https://api.example.com')) {
		request = new Request(request.url.replace('https://api.example.com', 'http://internal-api'), request);
	}
	return fetch(request);
}

// Sequence multiple handlers
import { sequence } from '@sveltejs/kit/hooks';
export const handle = sequence(auth, logger, cors);
```
