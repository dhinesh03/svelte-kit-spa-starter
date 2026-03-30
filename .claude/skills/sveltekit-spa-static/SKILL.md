---
name: sveltekit-spa-static
description: "SvelteKit SPA mode with adapter-static: setup, configuration, what works/doesn't without SSR, $app/navigation, $app/state, $app/paths, $app/environment, $env modules, prerendering within SPA, fallback pages, SSG, csr, and deployment patterns. Use for single page app, static site, or ssr false."
---

# SvelteKit SPA Mode (adapter-static)

## SPA Setup

```ts
// src/routes/+layout.ts
export const ssr = false;
```

```ts
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
export default {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '200.html', // or 'index.html' depending on host
			precompress: false,
			strict: true
		})
	}
};
```

### Fallback Page

- HTML shell from `app.html` that loads JS and navigates to correct route
- Different hosts: `200.html` (Surge, Netlify), `404.html` (GitHub Pages), `index.html` (some hosts)
- **Avoid `index.html`** to not conflict with prerendered homepage
- Always uses absolute asset paths regardless of `paths.relative`

## What's UNAVAILABLE in SPA Mode

| Feature                                                 | Reason                    |
| ------------------------------------------------------- | ------------------------- |
| `+page.server.ts` / `+layout.server.ts`                 | No server                 |
| `+server.ts` endpoints                                  | No server                 |
| Form actions                                            | Require `+page.server.ts` |
| `$env/static/private`, `$env/dynamic/private`           | Server-only modules       |
| `$app/server`                                           | Server-only               |
| Server hooks (`hooks.server.ts`)                        | No server                 |
| `cookies` API in load                                   | Server-only               |
| `event.locals`, `event.platform`, `event.clientAddress` | Server-only               |
| `handleFetch`, `handle` hooks                           | Server-only               |
| Server-side streaming of promises                       | No server                 |

## What WORKS in SPA Mode

| Feature                                     | Notes                                  |
| ------------------------------------------- | -------------------------------------- |
| Universal load (`+page.ts`, `+layout.ts`)   | Always runs in browser                 |
| Client hooks (`hooks.client.ts`)            | Full support                           |
| `$app/environment`                          | `browser` always `true`                |
| `$app/navigation`                           | goto, invalidate, beforeNavigate, etc. |
| `$app/state`                                | page, navigating, updated              |
| `$app/paths`                                | resolve(), asset(), match()            |
| `$env/static/public`, `$env/dynamic/public` | Public env vars                        |
| Service workers                             | Full support                           |
| Client-side routing                         | Full support                           |
| Module-level `$state`                       | Safe (no SSR cross-user risk)          |
| Universal hooks (`hooks.ts`)                | reroute, transport                     |

## Prerendering Individual Pages Within SPA

```ts
// src/routes/about/+page.ts
export const prerender = true;
export const ssr = true; // MUST re-enable SSR for prerendering
```

## $app/navigation

```ts
import {
	goto,
	invalidate,
	invalidateAll,
	beforeNavigate,
	afterNavigate,
	onNavigate,
	preloadCode,
	preloadData,
	pushState,
	replaceState,
	refreshAll
} from '$app/navigation';
```

| Function                   | Purpose                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `goto(url, opts)`          | Programmatic nav. Options: replaceState, noScroll, keepFocus, invalidateAll, state |
| `invalidate(url \| fn)`    | Rerun matching load functions                                                      |
| `invalidateAll()`          | Rerun ALL load functions                                                           |
| `refreshAll()`             | Refresh remote functions + optionally load functions                               |
| `beforeNavigate(cb)`       | Intercept nav, can `cancel()`                                                      |
| `afterNavigate(cb)`        | After nav + on mount                                                               |
| `onNavigate(cb)`           | Immediately before nav (view transitions)                                          |
| `preloadCode(path)`        | Preload route JS                                                                   |
| `preloadData(href)`        | Preload code + data                                                                |
| `pushState(url, state)`    | Shallow routing                                                                    |
| `replaceState(url, state)` | Replace shallow state                                                              |

## $app/state

```ts
import { page, navigating, updated } from '$app/state';
```

- `page` — url, params, route, status, error, data, form, state
- `navigating` — from, to, type, delta, willUnload, complete (null when idle)
- `updated` — `current` boolean + `check()` for version polling

**GOTCHA**: Use `$derived(page.params.id)` — legacy `$:` won't update after initial load.

## $app/paths (since 2.26)

```ts
import { resolve, asset, match } from '$app/paths';
resolve('/dashboard'); // prefix with base path
resolve('/blog/[slug]', { slug: 'hello' }); // resolve route
asset('/favicon.ico'); // resolve static asset
match('/blog/hello'); // → { id: '/blog/[slug]', params: { slug: 'hello' } }
```

## $app/environment

```ts
import { browser, building, dev, version } from '$app/environment';
// browser: always true in SPA
// building: true during build/prerender
// dev: true in dev server
// version: from config.kit.version.name
```

## $env Modules

| Module                 | Available in SPA | Description                              |
| ---------------------- | :--------------: | ---------------------------------------- |
| `$env/static/public`   |       Yes        | Build-time public vars (PUBLIC\_ prefix) |
| `$env/dynamic/public`  |       Yes        | Runtime public vars                      |
| `$env/static/private`  |        No        | Server-only                              |
| `$env/dynamic/private` |        No        | Server-only                              |

Configure in `.env`:

```
PUBLIC_API_URL=https://api.example.com
```

## Static Site Generation (SSG) — Alternative to SPA

```ts
// src/routes/+layout.ts
export const prerender = true;
// Do NOT set ssr: false — SSG needs SSR to render HTML
```

- `trailingSlash: 'always'` creates `/about/index.html`
- GitHub Pages: set `config.kit.paths.base` to repo name, add `.nojekyll` to `static/`

## SPA Drawbacks

- Multiple network round trips (HTML → JS → data)
- Poor SEO (Core Web Vitals, search engines that don't render JS)
- Inaccessible when JS fails/disabled

## Data Fetching in SPA Mode

Since `+page.server.ts` is unavailable, fetch data via:

1. **Universal load functions** (`+page.ts`):

   ```ts
   export async function load({ fetch }) {
   	const res = await fetch('/api/data'); // external API
   	return { items: await res.json() };
   }
   ```

2. **Component-level fetching** with `runed` resource or `onMount`:

   ```ts
   import { resource } from 'runed';
   const posts = resource(() => fetch('/api/posts').then((r) => r.json()));
   ```

3. **External API calls** directly in effects or event handlers

@references references/spa-setup.md
@references references/app-modules.md
@references references/env-modules.md
