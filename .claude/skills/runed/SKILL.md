---
name: runed
description: 'Svelte 5 reactive utility library (runed). Use when: (1) fetching async data reactively (resource), (2) managing state (persisted, debounced, throttled, undo/redo, FSM), (3) observing DOM (element size/rect, scroll, focus, viewport, resize, mutation, intersection), (4) handling events (listeners, click-outside, keyboard), (5) using browser APIs (geolocation, idle, visibility), or (6) working with boolean HTML attributes, previous values, or effect cleanup. Covers 30 utilities.'
---

# runed — Svelte 5 Reactive Utilities

```ts
import { resource, PersistedState, Debounced, ElementSize } from 'runed';
```

## Core Types

```ts
type Getter<T> = () => T;
type MaybeGetter<T> = T | Getter<T>;
type MaybeElementGetter<T extends Element = HTMLElement> = MaybeGetter<T | null | undefined>;
```

## Key Patterns

1. **Class utilities** — `new Foo(getter)`, read via `.current` (reactive)
2. **Function utilities** — call directly, return reactive objects with controls
3. **`MaybeGetter<T>`** — accept static values or `() => T` for reactive inputs
4. **Auto-cleanup** — all listeners/observers clean up via `$effect` lifecycle
5. **`.pre` variants** — `resource.pre()` runs before render

## All Utilities

| Category        | Utilities                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------- |
| **Async data**  | `resource`, `resource.pre`                                                                   |
| **State**       | `PersistedState`, `StateHistory`, `Previous`, `Debounced`, `Throttled`, `FiniteStateMachine` |
| **DOM sizing**  | `ElementSize`, `ElementRect`                                                                 |
| **DOM scroll**  | `ScrollState`                                                                                |
| **DOM focus**   | `ActiveElement`, `activeElement`, `IsFocusWithin`                                            |
| **Visibility**  | `IsInViewport`, `IsDocumentVisible`                                                          |
| **Events**      | `useEventListener`, `onClickOutside`                                                         |
| **Observers**   | `useResizeObserver`, `useIntersectionObserver`, `useMutationObserver`                        |
| **Input**       | `TextareaAutosize`, `PressedKeys`                                                            |
| **Timers**      | `useInterval`, `AnimationFrames`                                                             |
| **Browser**     | `useGeolocation`, `IsIdle`                                                                   |
| **Lifecycle**   | `IsMounted`, `onCleanup`                                                                     |
| **Fn wrappers** | `useDebounce`, `useThrottle`                                                                 |
| **Helpers**     | `extract`, `boolAttr`                                                                        |

---

## Top-Tier Utilities (inline API + example)

### 1. `resource()` — Reactive Async Data Fetching

```ts
const res = resource(source, fetcher, options?);
const res = resource([s1, s2], fetcher, options?);  // multiple deps
const res = resource.pre(source, fetcher, options?); // pre-render
```

**Fetcher signature:**

```ts
async (value, previousValue, { signal, data, refetching, onCleanup }) => Data;
```

- `signal` — AbortSignal, auto-cancelled when dependencies change
- `data` — previous fetcher result
- `refetching` — `boolean | RefetchInfo` (true on `.refetch()`, or custom value passed to it)
- `onCleanup(fn)` — register cleanup before next fetch run

**Options:**

| Option         | Type      | Default     | Purpose                                          |
| -------------- | --------- | ----------- | ------------------------------------------------ |
| `lazy`         | `boolean` | `false`     | Skip initial fetch, only on subsequent changes   |
| `once`         | `boolean` | `false`     | Fetch only once, ignore further changes          |
| `initialValue` | `Data`    | `undefined` | Pre-populate before first fetch (narrows type)   |
| `debounce`     | `number`  | —           | Debounce fetch in ms                             |
| `throttle`     | `number`  | —           | Throttle fetch in ms (debounce takes precedence) |

**Returns:**

| Property         | Type                 | Description                                   |
| ---------------- | -------------------- | --------------------------------------------- |
| `current`        | `Data \| undefined`  | Resolved value (`Data` if `initialValue` set) |
| `loading`        | `boolean`            | Fetch in-flight                               |
| `error`          | `Error \| undefined` | Last fetch error                              |
| `mutate(value)`  | `(Data) => void`     | Set value without fetching                    |
| `refetch(info?)` | `(info?) => Promise` | Manually re-run fetcher                       |

**Example — basic fetch with loading/error:**

```svelte
<script lang="ts">
	import { resource } from 'runed';
	let { userId }: { userId: string } = $props();

	const user = resource(
		() => userId,
		async (id, _prev, { signal }) => {
			const res = await fetch(`/api/users/${id}`, { signal });
			if (!res.ok) throw new Error('Failed to fetch');
			return res.json();
		}
	);
</script>

{#if user.loading}<p>Loading...</p>
{:else if user.error}<p>Error: {user.error.message}</p>
{:else}<p>{user.current?.name}</p>
{/if}
```

**Example — multiple deps with debounce:**

```ts
const results = resource(
	[() => query, () => page],
	async ([q, p], _prev, { signal }) => {
		const res = await fetch(`/api/search?q=${q}&page=${p}`, { signal });
		return res.json();
	},
	{ initialValue: [], debounce: 300 }
);
```

---

### 2. `PersistedState<T>` — Persistent Reactive State

```ts
const state = new PersistedState<T>(key, initialValue, options?);
```

**Options:**

```ts
{
  storage?: "local" | "session",   // default: "local"
  syncTabs?: boolean,              // default: true
  connected?: boolean,             // default: true
  serializer?: { serialize(v): string, deserialize(s): T }
}
```

**Properties/Methods:** `current` (get/set), `connected`, `connect()`, `disconnect()`

**Caveat:** Deep reactivity works for arrays/objects but NOT class instance property mutations.

**Example:**

```ts
import { PersistedState } from 'runed';

const theme = new PersistedState<'light' | 'dark'>('app-theme', 'light');
theme.current = 'dark'; // persisted to localStorage, synced across tabs

const cart = new PersistedState<CartItem[]>('cart', [], { storage: 'session' });
cart.current = [...cart.current, newItem]; // deep reactivity works
```

---

### 3. `Debounced<T>` — Debounced Reactive Value

```ts
const d = new Debounced(getter, wait?); // default 250ms
```

**Properties/Methods:** `current`, `pending`, `cancel()`, `updateImmediately()`, `setImmediately(v)`

**Example:**

```svelte
<script lang="ts">
	import { Debounced, resource } from 'runed';
	let search = $state('');
	const debounced = new Debounced(() => search, 300);

	const results = resource(
		() => debounced.current,
		async (q, _prev, { signal }) => {
			if (!q) return [];
			return fetch(`/api/search?q=${q}`, { signal }).then((r) => r.json());
		},
		{ initialValue: [] }
	);
</script>

<input bind:value={search} />
{#if debounced.pending}<span>Typing...</span>{/if}
```

---

### 4. `useEventListener()` — Declarative Event Listener

```ts
useEventListener(target, event, handler, options?);
useEventListener(() => el, ["click", "keydown"], handler); // multiple events
```

Supports Window, Document, HTMLElement, MediaQueryList. Auto-cleanup on destroy/target change.

**Example:**

```ts
import { useEventListener } from 'runed';

useEventListener(
	() => window,
	'keydown',
	(e) => {
		if (e.key === 'Escape') closeModal();
		if (e.ctrlKey && e.key === 'k') openCommandPalette();
	}
);
```

---

### 5. `ElementSize` — Reactive Element Dimensions

```ts
const size = new ElementSize(elementGetter, { box?: "content-box" | "border-box" }); // default: "border-box"
```

**Properties:** `width`, `height`, `current` ({ width, height })

**Example:**

```svelte
<script lang="ts">
	import { ElementSize } from 'runed';
	let el = $state<HTMLDivElement>();
	const size = new ElementSize(() => el);
	const cols = $derived(size.width > 768 ? 3 : size.width > 480 ? 2 : 1);
</script>

<div bind:this={el} style="grid-template-columns: repeat({cols}, 1fr);">...</div>
```

---

### 6. `onClickOutside()` — Click Outside Detection

```ts
const oc = onClickOutside(elementGetter, callback, { immediate?, detectIframe? });
```

**Returns:** `{ enabled, start(), stop() }`

**Example:**

```svelte
<script lang="ts">
	import { onClickOutside } from 'runed';
	let menu = $state<HTMLDivElement>();
	let open = $state(false);
	onClickOutside(
		() => menu,
		() => {
			open = false;
		}
	);
</script>

<div bind:this={menu}>
	<button onclick={() => (open = !open)}>Menu</button>
	{#if open}<ul>...</ul>{/if}
</div>
```

---

### 7. `ScrollState` — Scroll Tracking + Control

```ts
const scroll = new ScrollState({
  element: MaybeGetter<HTMLElement | Window | Document | null>,  // required
  idle?: number,        // default 200ms
  offset?: { left?, right?, top?, bottom? },
  behavior?: ScrollBehavior,
  onScroll?: () => void,
  onStop?: () => void,
});
```

**Properties:** `x`, `y` (get/set), `isScrolling`, `progress.x`, `progress.y`, `arrived.top`, `arrived.bottom`, `arrived.left`, `arrived.right`, `directions.left`, `directions.right`, `directions.top`, `directions.bottom`

**Methods:** `scrollTo(x, y)`, `scrollToTop()`, `scrollToBottom()`

**Example:**

```svelte
<script lang="ts">
	import { ScrollState } from 'runed';
	let el = $state<HTMLDivElement>();
	const scroll = new ScrollState({ element: () => el });
	$effect(() => {
		if (scroll.arrived.bottom && !loading) loadMore();
	});
</script>

<div bind:this={el} style="overflow-y: auto; height: 400px;">
	{#each items as item}<div>{item.name}</div>{/each}
</div>
```

---

### 8. `boolAttr()` — Boolean HTML Attribute

```ts
boolAttr(value); // "" (truthy) or undefined (falsy)
```

**Example:**

```svelte
<script lang="ts">
	import { boolAttr } from 'runed';
	let active = $state(false);
</script>

<div data-active={boolAttr(active)} class="data-[active]:bg-blue-500">...</div>
```

---

### 9. `Previous<T>` — Previous Value

```ts
const prev = new Previous(getter, initialValue?);
prev.current; // T | undefined
```

**Example:**

```ts
import { Previous } from 'runed';
let count = $state(0);
const prev = new Previous(() => count); // undefined initially, then prior value
```

---

## Full API Reference

See [REFERENCE.md](REFERENCE.md) for all remaining utilities with signatures and examples.
