# Reactivity Utilities Reference

## svelte/reactivity — Reactive Collections

### SvelteMap

```ts
import { SvelteMap } from 'svelte/reactivity';
const map = new SvelteMap<string, number>();
map.set('a', 1); // triggers reactivity
map.delete('a'); // triggers reactivity
// map.get('a') tracked as dependency
```

### SvelteSet

```ts
import { SvelteSet } from 'svelte/reactivity';
const tags = new SvelteSet<string>();
tags.add('svelte');
tags.has('svelte'); // tracked as dependency
```

**Values inside SvelteMap/SvelteSet are NOT deeply reactive.**

### SvelteDate

```ts
import { SvelteDate } from 'svelte/reactivity';
const now = new SvelteDate();
// now.getTime(), now.toISOString() etc. are reactive
now.setFullYear(2025); // triggers updates
```

### SvelteURL / SvelteURLSearchParams

```ts
import { SvelteURL } from 'svelte/reactivity';
const url = new SvelteURL('https://example.com?q=test');
url.searchParams.set('page', '2'); // reactive
```

## MediaQuery

```ts
import { MediaQuery } from 'svelte/reactivity';

const dark = new MediaQuery('prefers-color-scheme: dark');
const large = new MediaQuery('min-width: 800px', false); // SSR fallback

// In template:
// {#if dark.current}Dark mode{/if}
// {#if large.current}Desktop layout{/if}
```

## createSubscriber (since 5.7)

```ts
import { createSubscriber } from 'svelte/reactivity';

const subscribe = createSubscriber((update) => {
	// Called when first subscriber appears
	const interval = setInterval(update, 1000);
	return () => clearInterval(interval); // cleanup when last subscriber gone
});

// In a .svelte.ts file:
export function useTimer() {
	return {
		get now() {
			subscribe(); // registers as subscriber
			return Date.now();
		}
	};
}
```

## svelte/reactivity/window (since 5.11)

```ts
import {
	innerWidth,
	innerHeight,
	outerWidth,
	outerHeight,
	scrollX,
	scrollY,
	online,
	devicePixelRatio,
	screenLeft,
	screenTop
} from 'svelte/reactivity/window';

// All have .current property
// All undefined on server
// devicePixelRatio: Chrome responds to zoom, Firefox/Safari don't
```

## svelte/store Bridge

### fromStore — Store to Reactive

```ts
import { fromStore } from 'svelte/store';
import { myWritableStore } from './stores';

const reactive = fromStore(myWritableStore);
// reactive.current — read value
// reactive.current = newValue — write (if writable)
```

### toStore — Reactive to Store

```ts
import { toStore } from 'svelte/store';

let value = $state(0);
const store = toStore(
	() => value, // getter
	(v) => {
		value = v;
	} // setter (optional)
);
```
