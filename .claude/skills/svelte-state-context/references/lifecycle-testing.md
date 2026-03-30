# Lifecycle & Testing Reference

## Lifecycle Summary

| Hook          | Runs on Server |  Runs on Client  | Notes               |
| ------------- | :------------: | :--------------: | ------------------- |
| `onMount`     |       No       | Yes (after DOM)  | Return fn = cleanup |
| `onDestroy`   |      Yes       |       Yes        | Only hook on server |
| `$effect`     |       No       | Yes (after DOM)  | Auto-tracks deps    |
| `$effect.pre` |       No       | Yes (before DOM) | Rare use case       |
| `tick`        |      Yes       |       Yes        | Promise-based       |

## onMount Cleanup Gotcha

```ts
// WRONG — async returns Promise, not cleanup function
onMount(async () => {
	const data = await fetch('...');
	return () => {
		/* THIS NEVER RUNS */
	};
});

// RIGHT — separate async call
onMount(() => {
	fetchData();
	return () => {
		/* cleanup works */
	};
});
```

## Testing Setup

### vitest.config.ts

```ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte()],
	test: {
		environment: 'jsdom',
		resolve: {
			conditions: ['browser'] // required for Svelte 5
		}
	}
});
```

### File Naming

Use `.svelte.test.ts` to enable runes in test files.

## Testing State with $effect.root

```ts
// counter.svelte.test.ts
import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';

describe('counter', () => {
	it('increments', () => {
		const cleanup = $effect.root(() => {
			let count = $state(0);
			count += 1;
			flushSync();
			expect(count).toBe(1);
		});
		cleanup();
	});
});
```

## Testing Components

```ts
import { mount, unmount, flushSync } from 'svelte';
import Counter from './Counter.svelte';

it('renders and updates', () => {
	const component = mount(Counter, {
		target: document.body,
		props: { initial: 0 }
	});

	flushSync();
	expect(document.body.innerHTML).toContain('0');

	// Simulate click
	document.querySelector('button')!.click();
	flushSync();
	expect(document.body.innerHTML).toContain('1');

	unmount(component);
});
```

## Testing with @testing-library/svelte

```ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';

it('increments on click', async () => {
	render(Counter);
	await fireEvent.click(screen.getByRole('button'));
	expect(screen.getByText('1')).toBeInTheDocument();
});
```

## flushSync for Synchronous Updates

```ts
import { flushSync } from 'svelte';

let count = $state(0);
count = 5;
// DOM not yet updated
flushSync();
// DOM is now updated
```

## getAbortSignal for Cleanup

```ts
import { getAbortSignal } from 'svelte';

$effect(() => {
	const signal = getAbortSignal();
	fetch('/api/data', { signal })
		.then((r) => r.json())
		.then((data) => {
			items = data;
		});
	// Automatically aborted when effect re-runs or component destroys
});
```
