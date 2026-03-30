# $state Patterns Reference

## Deep State Proxy Behavior

### What Gets Proxied

- Plain objects (`{}`, `Object.create(null)`)
- Arrays (`[]`)
- Proxied recursively until hitting non-plain object

### What Does NOT Get Proxied

- Class instances (`new MyClass()`)
- Objects from `Object.create(proto)` with non-null proto
- DOM elements, Date, Map, Set (use `SvelteMap`/`SvelteSet` from `svelte/reactivity`)

### Destructuring Breaks Reactivity

```ts
let todos = $state([{ done: false, text: 'hi' }]);
let { done } = todos[0]; // `done` is now a static snapshot!
todos[0].done = true; // does NOT update `done`
```

## Class Patterns

### Public Fields

```ts
class Counter {
	count = $state(0);
	doubled = $derived(this.count * 2);
	increment = () => {
		this.count += 1;
	};
}
```

### Private Fields

```ts
class Counter {
	#count = $state(0);
	get count() {
		return this.#count;
	}
	increment = () => {
		this.#count += 1;
	};
}
```

### Constructor Assignment

```ts
class Todo {
	constructor(text: string) {
		this.text = $state(text); // first assignment only
	}
}
```

### Arrow Methods (preserve `this`)

```ts
class Todo {
	reset = () => {
		this.text = '';
	}; // arrow: `this` is always the instance
	// vs method(): `this` depends on call site
}
```

## $state.raw Use Cases

### Large API Responses

```ts
let response = $state.raw<ApiResponse | null>(null);
async function load() {
	response = await fetch('/api/data').then((r) => r.json());
}
```

### Immutable Data Patterns

```ts
let items = $state.raw<Item[]>([]);
function addItem(item: Item) {
	items = [...items, item]; // must create new array
}
function removeItem(id: string) {
	items = items.filter((i) => i.id !== id);
}
```

### Raw Array of Reactive Objects

```ts
let todos = $state.raw<Todo[]>([]);
// Each Todo uses $state internally, but the array itself is not proxied
```

## Cross-Module State Patterns

### Pattern 1: Export Object (Mutate Properties)

```ts
// state.svelte.ts
export const app = $state({ user: null, theme: 'light' });
export function setUser(u: User) {
	app.user = u;
}
```

### Pattern 2: Export Getter Functions

```ts
// state.svelte.ts
let count = $state(0);
export function getCount() {
	return count;
}
export function increment() {
	count += 1;
}
```

### WRONG: Export Reassigned State

```ts
// COMPILER ERROR
export let count = $state(0);
export function increment() {
	count += 1;
}
```

## Pass-by-Value Gotchas

### Problem: Functions Receive Snapshot

```ts
function double(n: number) {
	return n * 2;
}
let count = $state(1);
let result = double(count); // result = 2, NOT reactive
count = 5; // result is still 2
```

### Solution: Pass Getter or Object

```ts
// Getter
function double(getN: () => number) {
	return {
		get value() {
			return getN() * 2;
		}
	};
}
let count = $state(1);
let result = double(() => count);

// Or use object with $state proxy
let state = $state({ count: 1 });
function double(s: typeof state) {
	return {
		get value() {
			return s.count * 2;
		}
	};
}
```

## Common Mistakes

1. **Mutating non-proxied fallback values** — prop defaults are NOT reactive
2. **Using `===` on proxies** — `$state({}) !== {}` (proxy identity differs)
3. **console.log on proxies** — shows `Proxy { }`, use `$state.snapshot()` or `$inspect()`
4. **`(obj.array ??= []).push(x)`** — stale assignment warning; separate into two statements
