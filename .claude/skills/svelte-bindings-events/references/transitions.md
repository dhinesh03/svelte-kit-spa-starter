# Transitions & Animations Reference

## Built-in Transitions (svelte/transition)

```ts
import { fade, fly, slide, scale, blur, draw, crossfade } from 'svelte/transition';
```

### fade

```svelte
<div transition:fade={{ duration: 300, delay: 0 }}>
```

### fly

```svelte
<div transition:fly={{ y: 200, x: 0, duration: 300, opacity: 0 }}>
```

### slide

```svelte
<div transition:slide={{ duration: 300, axis: 'y' }}>
```

**GOTCHA**: Doesn't work with `display: inline`, `table`, or `contents`.

### scale

```svelte
<div transition:scale={{ start: 0.5, opacity: 0, duration: 300 }}>
```

### blur

```svelte
<div transition:blur={{ amount: 10, opacity: 0, duration: 300 }}>
```

### draw (SVG only)

```svelte
<path transition:draw={{ duration: 1000, speed: 1 }} d="M0,0 L100,100" />
```

Only works on elements with `getTotalLength()` (SVG `<path>`, `<line>`, etc.).

### crossfade

```ts
const [send, receive] = crossfade({ duration: 300, fallback: fade });
```

```svelte
{#if here}
	<div in:receive={{ key }} out:send={{ key }}>Here</div>
{:else}
	<div in:receive={{ key }} out:send={{ key }}>There</div>
{/if}
```

## Local vs Global

```svelte
<div transition:fade>           <!-- local (default) -->
<div transition:fade|global>    <!-- global -->
```

- Local: only plays when its own block is created/destroyed
- Global: also plays when a parent block is created/destroyed

## Transition Events

```svelte
<div
  transition:fly={{ y: 200 }}
  onintrostart={() => console.log('intro starting')}
  onintroend={() => console.log('intro complete')}
  onoutrostart={() => console.log('outro starting')}
  onoutroend={() => console.log('outro complete')}
>
```

## Custom Transition

```ts
function typewriter(node: HTMLElement, { speed = 1 }) {
	const text = node.textContent!;
	const duration = text.length / (speed * 0.01);
	return {
		duration,
		tick: (t: number) => {
			node.textContent = text.slice(0, Math.round(text.length * t));
		}
	};
}
```

## svelte/motion Classes

### Spring

```ts
import { Spring } from 'svelte/motion';
const coords = new Spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.25 });
// coords.current — current interpolated value
// coords.target — target value
// coords.set(newVal, { instant: true })
// Spring.of(() => reactiveValue) — auto-track reactive deps
```

### Tween

```ts
import { Tween } from 'svelte/motion';
const value = new Tween(0, { duration: 400, easing: cubicOut });
// value.set(100) — animate to 100
// Tween.of(() => reactiveValue) — auto-track
```

## animate:flip

```svelte
import {flip} from 'svelte/animate';

{#each items as item (item.id)}
	<li animate:flip={{ duration: 300 }}>{item.name}</li>
{/each}
```

- Only on immediate children of keyed each blocks
- Only triggers on reorder, not add/remove
