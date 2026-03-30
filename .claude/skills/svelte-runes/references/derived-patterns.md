# $derived Patterns Reference

## $derived vs $derived.by

```ts
// Simple expression
let doubled = $derived(count * 2);

// Complex logic
let total = $derived.by(() => {
	let sum = 0;
	for (const n of numbers) sum += n;
	return sum;
});
```

`$derived(expr)` is equivalent to `$derived.by(() => expr)`.

## Dependency Tracking Rules

### Tracked (Synchronous)

```ts
let a = $state(1),
	b = $state(2);
let sum = $derived(a + b); // tracks both a and b
```

### Tracked (via function calls)

```ts
function getTotal() {
	return a + b;
}
let total = $derived(getTotal()); // tracks a and b
```

### Tracked (await in expression — since 5.36)

```ts
let total = $derived((await fetchA()) + b); // tracks BOTH fetchA result AND b
```

### NOT Tracked

```ts
$derived.by(() => {
  setTimeout(() => state.value, 100);  // NOT tracked
  await fetch(...);  // code after await in functions is NOT tracked
});
```

### Excluding with untrack

```ts
import { untrack } from 'svelte';
let filtered = $derived(items.filter((i) => i.type === untrack(() => filterType)));
```

## Overriding Derived (Optimistic UI)

```ts
let likes = $derived(post.likes);

async function handleLike() {
	likes += 1; // temporary override
	try {
		await api.like(post.id);
	} catch {
		likes -= 1; // rollback on failure
	}
	// When post.likes updates from server, $derived recalculates
}
```

## Destructuring Derived

```ts
let { width, height } = $derived(getRect());
// Each is individually reactive — recalculates independently
```

## Push-Pull Reactivity

```ts
let count = $state(0);
let large = $derived(count > 10);

// Incrementing count from 1→2: large stays false, UI for large does NOT update
// Incrementing count from 10→11: large becomes true, UI updates
```

- Push: dependents notified immediately
- Pull: derived recalculated only when read
- Skip: if new value === old value (referential equality)

## Deriveds and Deep Reactivity

```ts
let items = $state([{ name: 'A' }, { name: 'B' }]);
let first = $derived(items[0]); // first is NOT proxied by $derived

first.name = 'C'; // BUT this works because items[0] is a proxy from $state
// items[0].name is now 'C' too — same reference
```

## Common Mistakes

### Using $effect When $derived Suffices

```ts
// WRONG
let doubled = $state(0);
$effect(() => {
	doubled = count * 2;
});

// RIGHT
let doubled = $derived(count * 2);
```

### Side Effects in $derived

```ts
// WRONG — $derived must be pure
let total = $derived.by(() => {
	console.log('calculating'); // side effect!
	return items.reduce((s, i) => s + i.price, 0);
});

// RIGHT — use $inspect for logging
$inspect(total);
```

### Class Fields

```ts
class ViewModel {
	count = $state(0);
	doubled = $derived(this.count * 2); // works in class fields
}
```
