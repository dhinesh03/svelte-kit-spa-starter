# State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- `runed` library's `resource()` for reactive data fetching with dependency tracking
- For shared state across components, use **class-based approach with context API** in `.svelte.ts` files
- Do not use writable stores for shared state
- Always use `setContext`/`getContext` with **Symbol keys** for shared state within route boundaries

## Class-Based State Pattern

```ts
// <route>/stores/MyState.svelte.ts
export class MyState {
	value = $state(initialValue);
	computed = $derived(/* ... */);
	action = () => {
		/* mutate state */
	};
}

const KEY = Symbol('my-state');
export const setMyContext = () => {
	const s = new MyState();
	setContext(KEY, s);
	return s;
};
export const getMyContext = () => getContext<MyState>(KEY);
```

- Call `setMyContext()` in the parent `+layout.svelte`
- Call `getMyContext()` in any child component
