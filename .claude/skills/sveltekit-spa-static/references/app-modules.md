# $app/\* Modules Reference (SPA Context)

## $app/navigation — Full API

### goto(url, options?)

```ts
import { goto } from '$app/navigation';
await goto('/dashboard', {
	replaceState: true, // don't add to history
	noScroll: true, // don't scroll to top
	keepFocus: true, // don't reset focus
	invalidateAll: true, // rerun all load functions
	state: { tab: 2 } // shallow routing state
});
```

### invalidate(url | fn) / invalidateAll()

```ts
invalidate('app:posts'); // custom key from depends()
invalidate('/api/posts'); // URL match
invalidate((url) => url.pathname.startsWith('/api')); // function match
invalidateAll(); // everything
```

### beforeNavigate / afterNavigate / onNavigate

```ts
beforeNavigate(({ cancel, to, from, willUnload }) => {
	if (hasUnsavedChanges && !confirm('Leave?')) cancel();
});

afterNavigate(({ from, to, type }) => {
	// type: 'load' | 'link' | 'goto' | 'popstate'
	analytics.pageview(to.url.pathname);
});

onNavigate(({ from, to }) => {
	// For view transitions API
	return new Promise((resolve) => {
		document.startViewTransition(resolve);
	});
});
```

### Preloading

```ts
preloadCode('/about'); // just the JS
const result = await preloadData('/about'); // JS + data
```

## $app/state — Reactive Page State

```ts
import { page, navigating, updated } from '$app/state';

// In template or $derived:
const slug = $derived(page.params.slug);
const isNavigation = $derived(navigating !== null);

// Version checking:
if (updated.current) {
	// App has been updated — show refresh prompt
}
await updated.check(); // manually poll for updates
```

### page Properties

| Property | Type                     | Description                     |
| -------- | ------------------------ | ------------------------------- |
| `url`    | `URL`                    | Current URL                     |
| `params` | `Record<string, string>` | Route parameters                |
| `route`  | `{ id: string }`         | Route ID (e.g., `/blog/[slug]`) |
| `status` | `number`                 | HTTP status                     |
| `error`  | `App.Error \| null`      | Error if any                    |
| `data`   | `object`                 | Merged load function data       |
| `form`   | `object \| null`         | Form action return data         |
| `state`  | `object`                 | Shallow routing state           |

## $app/paths (since 2.26)

```ts
import { resolve, asset, match } from '$app/paths';

resolve('/about'); // → '/base/about'
resolve('/blog/[slug]', { slug: 'hello' }); // → '/base/blog/hello'
asset('/images/logo.png'); // → '/base/images/logo.png'
match('/blog/hello'); // → { id: '/blog/[slug]', params: { slug: 'hello' } }
```

## $app/environment

```ts
import { browser, building, dev, version } from '$app/environment';

if (browser) {
	// Always true in SPA
}
if (building) {
	// True during `npm run build`
}
if (dev) {
	// True during `npm run dev`
}
```
