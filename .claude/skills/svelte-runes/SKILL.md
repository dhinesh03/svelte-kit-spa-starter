---
name: svelte-runes
description: 'Svelte 5 runes for reactive state, derived values, effects, props, and inspection. Use when working with $state, $derived, $effect, $props, $bindable, $inspect, $host, runes, reactive state, or svelte reactivity.'
---

# Svelte 5 Runes

Runes are compiler-level symbols (`$` prefix) that control reactivity in `.svelte` and `.svelte.ts`/`.svelte.js` files. They are language keywords, not importable functions.

## $state — Reactive State

```ts
let count = $state(0);
let todos = $state([{ done: false, text: 'hi' }]); // deep reactive proxy
```

### Deep State (Proxies)

- Arrays and plain objects become deeply reactive proxies
- Proxy mutations (`array.push()`, `obj.prop = x`) trigger granular updates
- Class instances are NOT proxied — use `$state` in class fields instead
- Destructuring breaks reactivity: `let { done } = todos[0]` — `done` is a snapshot

### Classes with $state

```ts
class Todo {
	done = $state(false);
	text = $state('');
	reset = () => {
		this.text = '';
		this.done = false;
	}; // arrow to preserve `this`
}
```

- Compiler transforms fields to get/set on prototype (not enumerable)
- GOTCHA: `onclick={todo.reset}` breaks `this` — use `onclick={() => todo.reset()}` or arrow methods

### Built-in Reactive Classes

Import from `svelte/reactivity`: `SvelteMap`, `SvelteSet`, `SvelteDate`, `SvelteURL`, `SvelteURLSearchParams`

### $state.raw — Non-Proxied State

```ts
let data = $state.raw({ name: 'Heraclitus', age: 49 });
data.age += 1; // NO EFFECT — mutations ignored
data = { ...data, age: 50 }; // Works — must reassign entirely
```

- Better performance for large objects/arrays you only reassign
- Raw state CAN contain reactive state (e.g., raw array of reactive objects)
- Can be used in class fields

### $state.snapshot — Static Copy

```ts
console.log($state.snapshot(counter)); // plain object, not Proxy
```

- Use when passing to external libraries that don't expect proxies (e.g., `structuredClone`)

### $state.eager — Immediate UI Updates

```svelte
<a aria-current={$state.eager(pathname) === '/' ? 'page' : null}>
```

- Bypasses synchronized update batching for immediate feedback
- Use sparingly — only for user interaction feedback

### Passing State Across Modules

```ts
// WRONG — cannot export reassigned $state
export let count = $state(0); // compiler error

// RIGHT — export object, mutate properties
export const counter = $state({ count: 0 });
export function increment() {
	counter.count += 1;
}

// RIGHT — export getter function
let count = $state(0);
export function getCount() {
	return count;
}
```

## $derived — Computed Values

```ts
let doubled = $derived(count * 2);
let total = $derived.by(() => {
	/* complex logic */ return sum;
});
```

- Expression must be side-effect free
- Can mark class fields as `$derived`
- `$derived(expr)` === `$derived.by(() => expr)`

### Dependencies

- Tracks state read synchronously inside the expression
- State after `await` in the expression itself IS tracked
- State in called functions IS tracked (if synchronous)
- Use `untrack(fn)` to exempt state from dependency tracking

### Overriding Derived Values (since 5.25)

```ts
let likes = $derived(post.likes);
async function onclick() {
	likes += 1; // optimistic UI — temporarily override
	try {
		await like();
	} catch {
		likes -= 1;
	}
}
```

### Destructuring

```ts
let { a, b, c } = $derived(stuff()); // all individually reactive
```

### Push-Pull Reactivity

- State changes immediately notify dependents (push)
- Derived values only recalculate when read (pull)
- If new value === old value (referential equality), downstream updates skip

## $effect — Side Effects

```ts
$effect(() => {
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, size, size);
	return () => {
		/* cleanup */
	};
});
```

### Lifecycle

- Runs AFTER mount, in a microtask after state changes
- Re-runs are batched (multiple state changes = one run)
- Cleanup runs before re-run AND on component destroy
- Can use `$effect` anywhere while a parent effect is running

### Dependencies

- Tracks state read synchronously (same as $derived)
- Values after `await` or `setTimeout` are NOT tracked
- Object vs property: `$effect(() => { state; })` only tracks reassignment; `$effect(() => { state.value; })` tracks property
- Conditional: only values read in LAST execution are dependencies

### $effect.pre — Before DOM Update

```ts
$effect.pre(() => {
	/* runs before DOM updates — rare use case */
});
```

### $effect.tracking — Check Tracking Context

```ts
$effect.tracking(); // true inside effect/template, false elsewhere
```

### $effect.pending — Pending Async Count

```ts
let pending = $effect.pending(); // count of pending promises in current boundary
```

### $effect.root — Manual Lifecycle

```ts
const destroy = $effect.root(() => {
	$effect(() => {
		/* ... */
	});
});
// Must call destroy() manually — no auto-cleanup
```

### ANTI-PATTERNS — When NOT to use $effect

1. **Never synchronize state** — use `$derived`:
   ```ts
   // WRONG
   $effect(() => {
   	doubled = count * 2;
   });
   // RIGHT
   let doubled = $derived(count * 2);
   ```
2. **Never link values bidirectionally** — use event handlers or function bindings
3. If updating state in effect causes infinite loop, use `untrack()`
4. Don't wrap in `if (browser)` — effects never run on server

## $props — Component Input

```ts
let { adjective, count = 0, ...rest } = $props();
```

### TypeScript

```ts
interface Props {
	adjective: string;
	count?: number;
}
let { adjective, count = 0 }: Props = $props();
```

### $props.id() — Unique Component ID (since 5.20)

```ts
const id = $props.id();
// <label for={id}>Name</label><input {id} />
```

### Ownership Rules

- Child can temporarily reassign a prop (parent's next update overwrites)
- NEVER mutate props unless `$bindable` — triggers `ownership_invalid_mutation` warning
- Fallback values are NOT proxied — mutations have no effect

## $bindable — Two-Way Binding

```ts
let { value = $bindable('fallback') } = $props();
```

- Parent uses `bind:value={x}` — optional, not required
- GOTCHA: Bindable with fallback + bound parent MUST provide non-undefined value

## $inspect — Dev-Only Logging

```ts
$inspect(count, message); // logs on every change (deep tracking)
$inspect(count).with((type, val) => {
	/* custom */
});
```

- `type` is `"init"` or `"update"`. Noop in production.

### $inspect.trace() (since 5.14)

```ts
$effect(() => {
	$inspect.trace('my effect'); // MUST be first statement
	// traces which state caused this effect to fire
});
```

## $host — Custom Elements Only

```ts
const host = $host();
host.dispatchEvent(new CustomEvent('my-event'));
```

@references references/state-patterns.md
@references references/derived-patterns.md
@references references/effect-patterns.md
