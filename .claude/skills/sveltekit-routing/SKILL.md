---
name: sveltekit-routing
description: 'SvelteKit routing: file-based routing (+page, +layout, +error, +server), layouts, layout groups, rest/optional params, param matchers, error pages, page options (prerender, ssr, csr, trailingSlash), data-sveltekit link options, snapshots, and shallow routing. Use for route configuration or prerender settings.'
---

# SvelteKit Routing

## File Conventions

| File                               | Purpose                              | Runs on         |
| ---------------------------------- | ------------------------------------ | --------------- |
| `+page.svelte`                     | Page component                       | Client          |
| `+page.ts`                         | Universal load                       | Server + Client |
| `+page.server.ts`                  | Server-only load + form actions      | Server only     |
| `+layout.svelte`                   | Layout (must `{@render children()}`) | Client          |
| `+layout.ts` / `+layout.server.ts` | Layout load                          | Server/Both     |
| `+error.svelte`                    | Error boundary                       | Client          |
| `+server.ts`                       | API route/endpoint                   | Server only     |

- Layout and error apply to subdirectories AND own directory
- Layouts have NO effect on `+server.ts` files
- Colocated files without `+` prefix are ignored by SvelteKit

**SPA NOTE**: `+page.server.ts` and `+layout.server.ts` CANNOT exist in SPA mode. Use only `+page.ts`/`+layout.ts`.

### Page Props (since 2.24)

```svelte
<script>
	let { data, params } = $props();
</script>
```

### Content Negotiation (+server.ts + +page coexist)

- PUT/PATCH/DELETE/OPTIONS → `+server.ts`
- GET/POST → page if Accept prefers `text/html`; otherwise `+server.ts`
- Fallback method handler: export `fallback` from `+server.ts`

## Advanced Routing

### Rest Parameters

```
src/routes/a/[...rest]/z  → matches /a/z, /a/b/z, /a/b/c/z
```

### Optional Parameters

```
src/routes/[[lang]]/home  → matches /home and /en/home
```

Cannot follow rest params.

### Param Matchers

```ts
// src/params/fruit.ts
export function match(param: string): boolean {
	return param === 'apple' || param === 'orange';
}
```

Usage: `src/routes/fruits/[page=fruit]/+page.svelte`

### Sort Order

More specific > with matchers > without > optional/rest. Ties: alphabetical.

### Encoding

`[x+nn]` for hex, `[u+nnnn]` for unicode.

## Layout Groups

```
src/routes/(app)/dashboard/   → /dashboard
src/routes/(marketing)/about/ → /about
```

`(group)` doesn't affect URL — used for different layouts.

### Breaking Out of Layouts

```
+page@segment.svelte   → reset to named layout
+page@.svelte           → reset to root layout
```

## Page Options

Exported from `+page.ts`, `+page.server.ts`, `+layout.ts`, or `+layout.server.ts`:

### ssr

- `false` = empty shell, all JS runs in browser only
- In root `+layout.ts`: turns entire app into SPA
- **GOTCHA**: Browser-only code must not run at module level

### csr

- `false` = no client JS, full-page navigation only
- `csr = false` + `ssr = false` = nothing renders

### prerender

- `true` / `false` / `'auto'`
- Cannot prerender pages with form actions
- `entries()` for dynamic route params:
  ```ts
  export function entries() {
  	return [{ slug: 'hello' }, { slug: 'world' }];
  }
  ```

### trailingSlash

- `'never'` (default), `'always'`, `'ignore'`
- `'always'` creates `/about/index.html` (needed for some hosts)
- **GOTCHA**: Ignoring harms SEO (duplicate URLs)

### config

- Adapter-specific, merged at top level only (not deep merge)

## Link Options

`data-sveltekit-*` attributes on `<a>` and `<form method="GET">`:

| Attribute                     | Values                                      | Effect              |
| ----------------------------- | ------------------------------------------- | ------------------- |
| `data-sveltekit-preload-data` | `"hover"`, `"tap"`                          | Preload code + data |
| `data-sveltekit-preload-code` | `"eager"`, `"viewport"`, `"hover"`, `"tap"` | Code only           |
| `data-sveltekit-reload`       | presence                                    | Full page nav       |
| `data-sveltekit-replacestate` | presence                                    | Replace history     |
| `data-sveltekit-keepfocus`    | presence                                    | Keep focus          |
| `data-sveltekit-noscroll`     | presence                                    | No scroll to top    |

Disable with `="false"`.

## Snapshots

```svelte
<script>
	let comment = $state('');
	export const snapshot = {
		capture: () => comment,
		restore: (v) => (comment = v)
	};
</script>
```

- Persisted to `sessionStorage` (must be JSON-serializable)

## Shallow Routing

```ts
import { pushState, replaceState } from '$app/navigation';
pushState('', { showModal: true });
// Access: page.state.showModal
```

- `page.state` always empty on SSR and first load
- Requires JavaScript
- Use `preloadData(href)` to load data for another route

@references references/file-conventions.md
@references references/advanced-routing.md
@references references/page-options.md
