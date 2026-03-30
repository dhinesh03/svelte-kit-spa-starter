---
name: svelte-state-context
description: 'Svelte 5 context API (createContext, setContext/getContext), stores bridge, lifecycle hooks (onMount, onDestroy, tick), svelte/reactivity utilities (SvelteMap, SvelteSet, SvelteDate, MediaQuery), svelte/motion (Spring, Tween), shared state, flushSync, and component testing patterns.'
---

# Svelte 5 State, Context & Utilities

## Context API

### createContext (since 5.40) — Preferred

```ts
import { createContext } from 'svelte';
const [getUser, setUser] = createContext<User>();
// Parent: setUser(userData);
// Child: const user = getUser(); // throws if not set
```

### setContext / getContext — Alternative

```ts
const KEY = Symbol('my-state');
setContext(KEY, value);
const value = getContext<MyType>(KEY);
```

- `hasContext(key)` and `getAllContexts()` also available

### Reactive Context

```ts
const state = $state({ count: 0 });
setContext(KEY, state);
// WRONG: state = newObj (breaks the link)
// RIGHT: state.count += 1 (mutate properties)
```

### Global State Risk

- Module-level `$state` leaks between users during SSR
- Use context instead for user-specific state
- **SPA mode (no SSR)**: module-level state IS safe

## Lifecycle Hooks

### onMount

```ts
import { onMount } from 'svelte';
onMount(() => {
	// runs after DOM mount, NOT during SSR
	return () => {
		/* cleanup on unmount */
	};
});
```

- **GOTCHA**: async `onMount` returns Promise — cleanup won't work. Use `$effect` for most cases.

### onDestroy

- Only lifecycle hook that runs during SSR
- Use for cleanup that must happen server-side too

### tick

```ts
import { tick } from 'svelte';
await tick(); // resolves when pending state changes applied to DOM
```

### beforeUpdate / afterUpdate — DEPRECATED

Use `$effect.pre` and `$effect` instead (more granular).

## Stores (Legacy Bridge)

- `writable`, `readable`, `derived`, `readonly`, `get` from `svelte/store`
- `$`-prefix auto-subscribes (must be top-level declaration)
- **Runes replace most store use cases** — use `.svelte.ts` with `$state`

### Bridge Utilities

```ts
import { fromStore, toStore } from 'svelte/store';
const reactive = fromStore(myStore); // { current } reactive object
const store = toStore(
	() => val,
	(v) => (val = v)
); // store interface
```

## svelte/reactivity Utilities

### Reactive Collections

```ts
import { SvelteMap, SvelteSet, SvelteDate, SvelteURL, SvelteURLSearchParams } from 'svelte/reactivity';
```

- **Values inside SvelteMap/SvelteSet are NOT deeply reactive**

### MediaQuery

```ts
import { MediaQuery } from 'svelte/reactivity';
const large = new MediaQuery('min-width: 800px', false); // fallback for SSR
// large.current → boolean
```

### createSubscriber (since 5.7)

Bridges external event systems with Svelte reactivity. Only runs when effects are active.

### svelte/reactivity/window (since 5.11)

```ts
import { innerWidth, innerHeight, scrollX, scrollY, online, devicePixelRatio } from 'svelte/reactivity/window';
// innerWidth.current, scrollY.current, etc.
```

- All `undefined` on server
- **GOTCHA**: `devicePixelRatio` behavior differs between browsers

## svelte/motion

### Spring (since 5.8)

```ts
import { Spring } from 'svelte/motion';
const coords = new Spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.5 });
// coords.current, coords.target
// Spring.of(() => value) for reactive binding
// coords.set(newVal, { instant: true, preserveMomentum: true })
```

### Tween (since 5.8)

```ts
import { Tween } from 'svelte/motion';
const progress = new Tween(0, { duration: 400, easing: cubicOut });
// Tween.of(() => value) for reactive binding
```

### prefersReducedMotion (since 5.7)

```ts
import { prefersReducedMotion } from 'svelte/motion';
// prefersReducedMotion.current → boolean
```

## Testing Patterns

### Setup

- vitest with `resolve: { conditions: ['browser'] }` in vite config
- Use `.svelte.test.ts` filename to enable runes in tests

### Effect Testing

```ts
import { flushSync } from 'svelte';
const cleanup = $effect.root(() => {
	/* set up effects */
});
flushSync(); // synchronously apply updates
// assert...
cleanup();
```

### Component Testing

```ts
import { mount, flushSync } from 'svelte';
const component = mount(MyComponent, { target: document.body, props: { ... } });
flushSync();
expect(document.body.innerHTML).toContain('expected');
```

## Key API Functions

| Function                   | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `flushSync(fn?)`           | Synchronously flush pending updates                  |
| `untrack(fn)`              | Read state without creating dependency               |
| `getAbortSignal()`         | AbortSignal that aborts when effect re-runs/destroys |
| `mount(Comp, opts)`        | Create and mount component                           |
| `unmount(comp, { outro })` | Remove with transitions                              |
| `hydrate(Comp, opts)`      | Reuse SSR HTML                                       |

@references references/context-patterns.md
@references references/reactivity-utilities.md
@references references/lifecycle-testing.md
