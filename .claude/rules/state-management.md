# State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- `runed` library's `resource()` for reactive data fetching with dependency tracking
- For shared state across components, use **class-based approach with context API** in `.svelte.ts` files
- Do not use writable stores for shared state
- Prefer `createContext()` (Svelte 5.40+) for type-safe context; fall back to `setContext`/`getContext` with **Symbol keys**
- SPA mode: module-level `$state` is safe (no SSR cross-user risk), but prefer context for route-scoped state

## Class-Based State Pattern

### Preferred: createContext (Svelte 5.40+)

```ts
// <route>/stores/MyState.svelte.ts
import { createContext } from 'svelte';

export class MyState {
	value = $state(initialValue);
	computed = $derived(/* ... */);
	action = () => {
		/* mutate state */
	};
}

export const [getMyState, setMyState] = createContext<MyState>();
```

### Alternative: setContext/getContext with Symbol keys

```ts
// <route>/stores/MyState.svelte.ts
const KEY = Symbol('my-state');
export const setMyContext = () => {
	const s = new MyState();
	setContext(KEY, s);
	return s;
};
export const getMyContext = () => getContext<MyState>(KEY);
```

- Call `setMyState(new MyState())` or `setMyContext()` in the parent `+layout.svelte`
- Call `getMyState()` or `getMyContext()` in any child component
