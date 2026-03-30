# runed — Full API Reference (Remaining Utilities)

All utilities not inlined in SKILL.md. Each section has API signature + example.

---

## `Throttled<T>` — Throttled Reactive Value

```ts
const t = new Throttled(getter, wait?); // default 250ms, wait can be MaybeGetter<number>
```

**Properties/Methods:** `current`, `cancel()`, `setImmediately(v)`

```ts
import { Throttled } from 'runed';
let scrollY = $state(0);
const throttled = new Throttled(() => scrollY, 100);
const showBackToTop = $derived(throttled.current > 500);
```

---

## `useDebounce()` — Debounce a Function

```ts
const fn = useDebounce(callback, wait?); // default 250ms, wait can be MaybeGetter
```

**Returns:** callable with `.cancel()`, `.runScheduledNow()`, `.pending`

```ts
import { useDebounce } from 'runed';
const save = useDebounce(async (data: Record<string, unknown>) => {
	await fetch('/api/save', { method: 'POST', body: JSON.stringify(data) });
}, 500);
await save(formData);
```

---

## `useThrottle()` — Throttle a Function

```ts
const fn = useThrottle(callback, interval?); // default 250ms, interval can be MaybeGetter
```

**Returns:** callable with `.cancel()`, `.pending`

```ts
import { useThrottle, useEventListener } from 'runed';
const handleResize = useThrottle(() => recalculateLayout(), 100);
useEventListener(() => window, 'resize', handleResize);
```

---

## `StateHistory<T>` — Undo/Redo

```ts
const history = new StateHistory(getter, setter, { capacity? });
```

**Properties/Methods:** `canUndo`, `canRedo`, `log` (LogEvent[]), `undo()`, `redo()`, `clear()`

**LogEvent:** `{ snapshot: T, timestamp: number }`

```svelte
<script lang="ts">
	import { StateHistory } from 'runed';
	let text = $state('');
	const history = new StateHistory(
		() => text,
		(v) => {
			text = v;
		},
		{ capacity: 50 }
	);
</script>

<textarea bind:value={text}></textarea>
<button onclick={() => history.undo()} disabled={!history.canUndo}>Undo</button>
<button onclick={() => history.redo()} disabled={!history.canRedo}>Redo</button>
```

---

## `FiniteStateMachine<States, Events>` — FSM

```ts
const fsm = new FiniteStateMachine<States, Events>(initialState, transitions);
```

**Transition config:**

```ts
{
  [state]: {
    [event]: nextState | ((...args) => nextState | void),
    _enter?: ({ from, to, event, args }) => void,
    _exit?: ({ from, to, event, args }) => void,
  },
  "*": { ... }  // wildcard fallback
}
```

**Properties/Methods:** `current`, `send(event, ...args)`, `debounce(ms, event, ...args)`

```ts
import { FiniteStateMachine } from 'runed';
type S = 'idle' | 'loading' | 'success' | 'error';
type E = 'FETCH' | 'RESOLVE' | 'REJECT' | 'RESET';

const fsm = new FiniteStateMachine<S, E>('idle', {
	idle: { FETCH: 'loading' },
	loading: { RESOLVE: 'success', REJECT: 'error' },
	success: { RESET: 'idle' },
	error: { RESET: 'idle', FETCH: 'loading' }
});
fsm.send('FETCH'); // → 'loading'
```

---

## `ElementRect` — Reactive Bounding Rect

```ts
const rect = new ElementRect(elementGetter, { initialRect? });
```

**Properties:** `x`, `y`, `width`, `height`, `top`, `right`, `bottom`, `left`, `current`

```ts
import { ElementRect } from 'runed';
let el = $state<HTMLDivElement>();
const rect = new ElementRect(() => el);
// rect.top, rect.left, rect.width, rect.height — all reactive
```

---

## `ActiveElement` / `activeElement` — Focus Tracking

```ts
import { activeElement } from "runed";     // pre-created singleton
activeElement.current; // Element | null

const ae = new ActiveElement({ document?, window? }); // custom scope (Shadow DOM)
```

```ts
import { activeElement } from 'runed';
const isFocusedHere = $derived(activeElement.current === myEl);
```

---

## `IsFocusWithin` — Focus Within Container

```ts
const fw = new IsFocusWithin(elementGetter);
fw.current; // boolean
```

```svelte
<script lang="ts">
	import { IsFocusWithin } from 'runed';
	let form = $state<HTMLFormElement>();
	const focusWithin = new IsFocusWithin(() => form);
</script>

<form bind:this={form} class={focusWithin.current ? 'ring-2' : ''}>...</form>
```

---

## `IsInViewport` — Viewport Intersection

```ts
const iv = new IsInViewport(elementGetter, options?);
```

**Options:** `{ threshold?, rootMargin?, once?, immediate?, root? }`

**Properties:** `current` (boolean), `observer` ({ isActive, stop(), pause(), resume() })

```svelte
<script lang="ts">
	import { IsInViewport } from 'runed';
	let target = $state<HTMLDivElement>();
	const visible = new IsInViewport(() => target, { once: true, threshold: 0.1 });
</script>

<div bind:this={target}>
	{#if visible.current}<img src={heavyImageUrl} alt="Lazy loaded" />{/if}
</div>
```

---

## `IsDocumentVisible` — Page Visibility

```ts
const visible = new IsDocumentVisible({ window?, document? });
visible.current; // boolean (false when tab is hidden)
```

```ts
import { IsDocumentVisible } from 'runed';
const docVisible = new IsDocumentVisible();
$effect(() => {
	if (!docVisible.current) pauseVideo();
});
```

---

## `IsIdle` — User Idle Detection

```ts
const idle = new IsIdle(options?);
```

**Options:**

```ts
{
  timeout?: number,         // default 60000ms
  events?: string[],        // default: ['mousemove','mousedown','resize','keydown','touchstart','wheel']
  detectVisibilityChanges?: boolean,
  initialState?: boolean,
  trackLastActive?: boolean,
}
```

**Properties:** `current` (boolean), `lastActive` (timestamp)

```ts
import { IsIdle } from 'runed';
const idle = new IsIdle({ timeout: 30000 });
$effect(() => {
	if (idle.current) showIdleWarning();
});
```

---

## `IsMounted` — Component Mount State

```ts
const mounted = new IsMounted();
mounted.current; // false before mount, true after
```

```ts
import { IsMounted } from 'runed';
const mounted = new IsMounted();
$effect(() => {
	if (mounted.current) initThirdPartyLib();
});
```

---

## `PressedKeys` — Keyboard State

```ts
const keys = new PressedKeys();
```

**Properties/Methods:** `all` (string[]), `has(...keys)` (boolean), `onKeys(keys, callback)`

```svelte
<script lang="ts">
	import { PressedKeys } from 'runed';
	const keys = new PressedKeys();
	const isShiftHeld = $derived(keys.has('Shift'));
	keys.onKeys(['Control', 'k'], () => openCommandPalette());
</script>

{#if isShiftHeld}<span>Multi-select mode</span>{/if}
```

---

## `TextareaAutosize` — Auto-Resize Textarea

```ts
const ta = new TextareaAutosize({
  element: () => el,
  input: () => value,
  styleProp?: "height" | "minHeight",  // default: "height"
  maxHeight?: number,
  onResize?: () => void,
});
ta.triggerResize(); // manual trigger
```

```svelte
<script lang="ts">
	import { TextareaAutosize } from 'runed';
	let el = $state<HTMLTextAreaElement>();
	let value = $state('');
	new TextareaAutosize({ element: () => el, input: () => value, maxHeight: 300 });
</script>

<textarea bind:this={el} bind:value></textarea>
```

---

## `AnimationFrames` — rAF Wrapper

```ts
const anim = new AnimationFrames(
  ({ delta, timestamp }) => { ... },
  { immediate?, fpsLimit?, window? }
);
```

**Properties/Methods:** `running` (boolean), `fps`, `start()`, `stop()`, `toggle()`

```ts
import { AnimationFrames } from 'runed';
const anim = new AnimationFrames(
	({ delta }) => {
		position += speed * delta;
	},
	{ fpsLimit: 60 }
);
anim.start();
```

---

## `useInterval()` — Pausable setInterval

```ts
const interval = useInterval(delay, { immediate?, immediateCallback?, callback? });
```

**Returns:** `{ counter, isActive, pause(), resume(), reset() }`

Delay is reactive (`MaybeGetter<number>`), timer restarts when value changes.

```ts
import { useInterval } from 'runed';
const poll = useInterval(() => 5000, {
	callback: async () => {
		status = await fetch('/api/status').then((r) => r.json());
	}
});
poll.pause();
poll.resume();
```

---

## `useGeolocation()` — Geolocation API

```ts
const geo = useGeolocation({ enableHighAccuracy?, timeout?, maximumAge?, immediate? });
```

**Returns:** `{ isSupported, position, error, isPaused, resume(), pause() }`

```ts
import { useGeolocation } from 'runed';
const geo = useGeolocation({ enableHighAccuracy: true });
// geo.position.coords.latitude, geo.position.coords.longitude
```

---

## `useResizeObserver()` — ResizeObserver

```ts
const { stop } = useResizeObserver(elementGetter, callback, { box? });
```

```ts
import { useResizeObserver } from 'runed';
useResizeObserver(
	() => el,
	(entries) => {
		const { width, height } = entries[0].contentRect;
	}
);
```

---

## `useIntersectionObserver()` — IntersectionObserver

```ts
const { isActive, stop, pause, resume } = useIntersectionObserver(
  target, callback, { threshold?, rootMargin?, root?, once?, immediate? }
);
```

**Note:** `isActive` is a getter — cannot be destructured into a variable.

```ts
import { useIntersectionObserver } from 'runed';
useIntersectionObserver(
	() => el,
	(entries) => {
		if (entries[0].isIntersecting) onVisible();
	},
	{ once: true }
);
```

---

## `useMutationObserver()` — MutationObserver

```ts
const { stop, takeRecords } = useMutationObserver(target, callback, mutationObserverInit);
```

```ts
import { useMutationObserver } from 'runed';
useMutationObserver(
	() => el,
	(mutations) => {
		for (const m of mutations) console.log(m.type, m.target);
	},
	{ childList: true, subtree: true }
);
```

---

## `extract()` — Resolve MaybeGetter

```ts
extract(valueOrGetter); // T | undefined
extract(valueOrGetter, fallback); // T (fallback if undefined)
```

```ts
import { extract } from 'runed';
function setup(interval?: MaybeGetter<number | undefined>) {
	const ms = $derived(extract(interval, 100));
}
```

---

## `onCleanup()` — Register Effect Cleanup

```ts
onCleanup(() => {
	/* runs on dispose */
});
```

Shorthand for returning a function from `$effect()`.

```ts
import { onCleanup } from 'runed';
$effect(() => {
	const timer = setInterval(tick, 1000);
	onCleanup(() => clearInterval(timer));
});
```
