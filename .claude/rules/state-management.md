# State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- `runed` library's `resource()` for reactive data fetching with dependency tracking
- For shared state across components, use **class-based approach with context API** in `.svelte.ts` files
- Do not use writable stores for shared state
- Prefer `createContext()` (Svelte 5.40+) for type-safe context; fall back to `setContext`/`getContext` with **Symbol keys**
- SPA mode: module-level `$state` is safe (no SSR cross-user risk), but prefer context for route-scoped state

## File Extension Rules

| File type               | Extension    | When to use                                                                                                                      |
| ----------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Component state classes | `.svelte.ts` | Classes whose primary purpose is reactive state (`$state`, `$derived`) for components                                            |
| Reactive hooks          | `.svelte.ts` | Reusable reactive logic (e.g., `IsMobile`)                                                                                       |
| Services                | `.ts`        | Services that bridge external libraries (MSAL, etc.) — use `createSubscriber` from `svelte/reactivity` for reactivity, NOT runes |
| Pure logic              | `.ts`        | Config, types, utilities, API modules                                                                                            |

Do NOT convert a plain `.ts` service to `.svelte.ts` just to use runes.

## Service Layer — Keep Close to Plain JS/TS

Services (`src/lib/services/`) must stay as plain `.ts` files. They should be framework-agnostic where possible — standard classes, async/await, and vanilla JS patterns. This keeps them portable, testable without Svelte compilation, and easy to reason about.

- Use `createSubscriber` from `svelte/reactivity` when a service needs to expose reactive state to Svelte components (e.g., `AuthService.current`)
- Do NOT use `$state`, `$derived`, or `$effect` in services — these require `.svelte.ts` and couple the service to the Svelte compiler
- Services that bridge external libraries (MSAL, WebSocket, EventSource) should encapsulate the library and expose a clean TS interface
- Singleton pattern is acceptable for app-wide services; make the class directly constructable for testing

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
