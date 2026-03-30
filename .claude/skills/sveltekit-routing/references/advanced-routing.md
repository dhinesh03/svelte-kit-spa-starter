# Advanced Routing Reference

## Rest Parameters

```
src/routes/docs/[...path]/+page.svelte
```

- Matches `/docs`, `/docs/a`, `/docs/a/b/c`
- `params.path` = `""`, `"a"`, `"a/b/c"`

## Optional Parameters

```
src/routes/[[lang]]/about/+page.svelte
```

- Matches `/about` AND `/en/about`
- Cannot follow rest params

## Param Matchers

```ts
// src/params/integer.ts
export function match(param) {
	return /^\d+$/.test(param);
}
```

```
src/routes/items/[id=integer]/+page.svelte
```

- Matchers run on both server and browser — no side effects

## Layout Groups

```
src/routes/
  (auth)/
    login/+page.svelte     → /login (uses auth layout)
    register/+page.svelte  → /register
    +layout.svelte          → shared auth layout
  (app)/
    dashboard/+page.svelte → /dashboard (uses app layout)
    settings/+page.svelte  → /settings
    +layout.svelte          → shared app layout
```

## Breaking Out of Layouts

```
src/routes/(app)/
  +layout.svelte           ← app layout
  dashboard/+page.svelte   ← uses app layout
  settings/
    +page.svelte           ← uses app layout
    +page@.svelte          ← uses ROOT layout (breaks out)
```

## Route Sorting (disambiguation)

1. More specific segments win
2. With matchers > without matchers
3. Static segments > dynamic `[param]`
4. `[param]` > `[[optional]]` > `[...rest]`
5. Ties: alphabetical
