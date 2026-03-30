# $effect Patterns Reference

## Effect Lifecycle

1. Component mounts → effect runs (after DOM update, in microtask)
2. Dependencies change → cleanup runs → effect re-runs (batched)
3. Component destroys → cleanup runs

## Cleanup/Teardown

```ts
$effect(() => {
	const interval = setInterval(() => (count += 1), 1000);
	return () => clearInterval(interval); // cleanup
});
```

## Dependency Tracking

### Object vs Property Tracking

```ts
$effect(() => {
	state;
}); // only reruns if `state` is reassigned
$effect(() => {
	state.value;
}); // reruns when `state.value` changes
$effect(() => {
	state.deep.val;
}); // reruns when deep.val changes (proxy)
```

### Conditional Dependencies

```ts
$effect(() => {
	if (showDetails) {
		console.log(details.name); // only tracked when showDetails is true
	}
});
```

## $effect.pre — Before DOM Update

```ts
$effect.pre(() => {
	// Runs BEFORE DOM updates — useful for measuring DOM before changes
	const scrollHeight = container.scrollHeight;
	// After this, DOM updates, then $effect runs
});
```

Use case: auto-scroll that measures scroll position before new items are added.

## $effect.tracking

```ts
function createSubscriber() {
	if ($effect.tracking()) {
		// We're in a reactive context — set up subscriptions
	} else {
		// Not reactive — just return current value
	}
}
```

## $effect.pending (experimental async)

```ts
let pending = $effect.pending();
// Returns count of pending promises in current boundary
// Use for showing loading indicators on subsequent updates
```

## $effect.root — Manual Lifecycle

```ts
// Create effects outside component init
const destroy = $effect.root(() => {
	$effect(() => {
		console.log(count);
	});
});

// Must manually clean up
onDestroy(destroy);
```

Use cases: testing, library code, effects outside component lifecycle.

## Anti-Patterns and Correct Alternatives

### 1. Synchronizing State

```ts
// WRONG — never derive state via effect
let count = $state(0);
let doubled = $state(0);
$effect(() => {
	doubled = count * 2;
});

// RIGHT
let doubled = $derived(count * 2);
```

### 2. Bidirectional Linking

```ts
// WRONG — infinite loop risk
$effect(() => {
	fahrenheit = (celsius * 9) / 5 + 32;
});
$effect(() => {
	celsius = ((fahrenheit - 32) * 5) / 9;
});

// RIGHT — use event handlers
function onCelsiusInput(e) {
	celsius = +e.target.value;
	fahrenheit = (celsius * 9) / 5 + 32;
}
```

### 3. DOM Manipulation

```ts
// WRONG — use {@attach} instead
$effect(() => {
  const el = document.querySelector('.tooltip');
  tippy(el, { content: tooltipText });
});

// RIGHT
{@attach (el) => {
  const instance = tippy(el, { content: tooltipText });
  return () => instance.destroy();
}}
```

### 4. Logging/Debugging

```ts
// WRONG
$effect(() => {
	console.log(count);
});

// RIGHT
$inspect(count);
```

### 5. External Subscriptions

```ts
// WRONG — overly complex
$effect(() => {
	const unsub = store.subscribe((val) => {
		value = val;
	});
	return unsub;
});

// RIGHT — use createSubscriber for library code
```

### 6. Wrapping in `if (browser)`

```ts
// WRONG — unnecessary, effects never run on server
$effect(() => {
	if (browser) {
		window.addEventListener('resize', handler);
	}
});

// RIGHT — just use it directly
$effect(() => {
	window.addEventListener('resize', handler);
	return () => window.removeEventListener('resize', handler);
});
```

## When to Use What

| Need                             | Use                               |
| -------------------------------- | --------------------------------- |
| Compute value from state         | `$derived`                        |
| React to user interaction        | Event handler                     |
| Sync DOM with state              | `{@attach}`                       |
| Log/debug state changes          | `$inspect`                        |
| External lib integration         | `$effect` with cleanup            |
| Canvas/WebGL rendering           | `$effect` with cleanup            |
| Network requests on state change | `$effect` with `getAbortSignal()` |
| Subscribe to external source     | `createSubscriber`                |
