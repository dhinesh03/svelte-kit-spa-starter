# Context Patterns Reference

## createContext (Preferred since 5.40)

```ts
// stores/user.svelte.ts
import { createContext } from 'svelte';

interface UserState {
	name: string;
	email: string;
}

export const [getUser, setUser] = createContext<UserState>();
```

```svelte
<!-- +layout.svelte (parent) -->
<script>
  import { setUser } from './stores/user.svelte';
  setUser({ name: 'Alice', email: 'alice@example.com' });
</script>

<!-- Any child component -->
<script>
  import { getUser } from './stores/user.svelte';
  const user = getUser(); // throws if not set by parent
</script>
```

## Class-Based State with Context

```ts
// stores/AppState.svelte.ts
import { createContext } from 'svelte';

export class AppState {
	count = $state(0);
	doubled = $derived(this.count * 2);
	increment = () => {
		this.count += 1;
	};
}

export const [getAppState, setAppState] = createContext<AppState>();
```

```svelte
<!-- +layout.svelte -->
<script>
	import { AppState, setAppState } from './stores/AppState.svelte';
	setAppState(new AppState());
</script>
```

## Legacy Pattern (setContext/getContext with Symbol)

```ts
const KEY = Symbol('my-state');

export function setMyContext() {
	const state = new MyState();
	setContext(KEY, state);
	return state;
}

export function getMyContext() {
	return getContext<MyState>(KEY);
}
```

## Reactive Context — GOTCHA

```ts
// WRONG: reassigning breaks the link
const state = $state({ count: 0 });
setContext(KEY, state);
// Later: state = { count: 1 }; // children still see old reference

// RIGHT: mutate properties
state.count = 1; // children see the update
```

## Testing with Context (since 5.49)

```ts
import { mount, setContext } from 'svelte';

function createWrapper() {
	setContext(KEY, mockState);
	return mount(MyComponent, { target: document.body });
}
```

## Global State Safety

### SSR Risk (with server rendering)

```ts
// DANGEROUS in SSR — shared across all users
let globalCount = $state(0); // module-level

// SAFE — context is per-component tree
setContext(KEY, $state({ count: 0 }));
```

### SPA Mode (no SSR) — Safe

```ts
// Module-level state is safe in SPA mode
// No server, no cross-user contamination
export const appState = $state({ theme: 'light' });
```
