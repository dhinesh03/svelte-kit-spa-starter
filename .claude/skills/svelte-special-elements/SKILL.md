---
name: svelte-special-elements
description: 'Svelte 5 special elements: <svelte:boundary> (error/pending), <svelte:window>, <svelte:document>, <svelte:body>, <svelte:head>, <svelte:element>, <svelte:options>. Use for error boundaries, window bindings, or dynamic elements.'
---

# Svelte 5 Special Elements

## `<svelte:boundary>` (since 5.3)

Error and async boundaries.

### pending snippet — async loading

```svelte
<svelte:boundary>
	{#snippet pending()}<p>Loading...</p>{/snippet}
	<AsyncContent />
</svelte:boundary>
```

- Shown on FIRST creation only, not subsequent updates
- Use `$effect.pending()` for subsequent update indicators

### failed snippet — error handling

```svelte
<svelte:boundary>
	{#snippet failed(error, reset)}
		<p>{error.message}</p>
		<button onclick={reset}>Retry</button>
	{/snippet}
	<RiskyComponent />
</svelte:boundary>
```

### onerror handler

```svelte
<svelte:boundary onerror={(error, reset) => reportError(error)}>
```

- Can rethrow to parent boundary

### transformError (since 5.51)

- SSR: transform errors before `failed` snippet. Must return JSON-stringifiable. Redact sensitive info.

### GOTCHAS

- Errors in event handlers NOT caught
- Errors after `setTimeout`/async NOT caught
- Only catches errors during rendering and in effects

## `<svelte:window>`

```svelte
<svelte:window onkeydown={handleKey} bind:scrollY={y} />
```

- Must be at TOP LEVEL of component
- Event listeners auto-removed on destroy, SSR-safe
- **Readonly bindings**: innerWidth, innerHeight, outerWidth, outerHeight, online, devicePixelRatio
- **Writable bindings**: scrollX, scrollY
- **GOTCHA**: Initial scrollX/scrollY do NOT scroll page (accessibility). Only subsequent changes scroll.

## `<svelte:document>`

```svelte
<svelte:document onvisibilitychange={handleVisibility} />
```

- For `document` events (e.g., `visibilitychange`)
- Supports attachments
- **Readonly bindings**: activeElement, fullscreenElement, pointerLockElement, visibilityState

## `<svelte:body>`

```svelte
<svelte:body onmouseenter={handleEnter} onmouseleave={handleLeave} />
```

- For `document.body` events
- Supports actions

## `<svelte:head>`

```svelte
<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
</svelte:head>
```

- Insert into `document.head`
- Content exposed separately during SSR

## `<svelte:element>`

```svelte
<svelte:element this={tag}>{children}</svelte:element>
```

- Dynamic element type
- Only supports `bind:this`
- Nullish `this` = not rendered
- Void element with children = runtime error (dev mode)
- Use `xmlns` for explicit namespace

## `<svelte:options>`

```svelte
<svelte:options runes={true} />
<svelte:options namespace="svg" />
<svelte:options customElement="my-element" />
<svelte:options css="injected" />
```

| Option          | Values                        | Purpose                   |
| --------------- | ----------------------------- | ------------------------- |
| `runes`         | `true`/`false`                | Force runes mode          |
| `namespace`     | `"html"`, `"svg"`, `"mathml"` | Element namespace         |
| `customElement` | string or config object       | Web component compilation |
| `css`           | `"injected"`                  | Inline styles             |

@references references/special-elements.md
