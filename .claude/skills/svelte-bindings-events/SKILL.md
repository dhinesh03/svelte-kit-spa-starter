---
name: svelte-bindings-events
description: 'Svelte 5 bindings (bind:value, bind:this, bind:group, function bindings), events (delegation, passive), use: actions, transitions (transition:, in:, out:), and animations (animate:flip). Use for event handlers, event delegation, or DOM bindings.'
---

# Svelte 5 Bindings, Events & Transitions

## bind: Directive

`bind:property={expression}` — shorthand: `bind:value` when variable is `value`

### Function Bindings (since 5.9)

```svelte
<input bind:value={get, set} />
<!-- get: () => value, set: (v) => value = v -->
<!-- Readonly: bind:clientWidth={null, redraw} -->
```

### Input Bindings

- `bind:value` — numeric inputs coerce to number, empty/invalid = `undefined`
- `defaultValue` (since 5.6) — reverts on form reset instead of empty string
- `bind:checked` / `defaultChecked` — checkboxes
- `bind:indeterminate` — checkbox indeterminate state
- `bind:group` — radio (mutual exclusive) and checkbox (array) groups
  - **GOTCHA**: Only works within same Svelte component
- `bind:files` — file inputs; use `DataTransfer` to set/clear programmatically; leave uninitialized for SSR

### Select Bindings

```svelte
<select bind:value={selected}>
	<option value={obj}>Label</option>
	<!-- can hold any value -->
</select>
```

- `<select multiple>` binds to array

### Media Bindings

- `<audio>`/`<video>`: currentTime, playbackRate, paused, volume, muted (two-way); duration, buffered, seekable, seeking, ended, readyState, played (readonly)
- `<video>` extra: videoWidth, videoHeight (readonly)
- `<img>`: naturalWidth, naturalHeight (readonly)

### Dimension Bindings (readonly, ResizeObserver)

clientWidth, clientHeight, offsetWidth, offsetHeight, contentRect, contentBoxSize, borderBoxSize, devicePixelContentBoxSize

- **GOTCHA**: `display: inline` can't be observed; CSS transforms don't trigger

### bind:this

```svelte
<canvas bind:this={canvas}></canvas>
```

- Value is `undefined` until mounted
- Components: access exported functions via `bind:this`

### Component Bindings

Same syntax — property must be declared with `$bindable()` in child.
**GOTCHA**: Bindable with fallback + bound parent MUST provide non-undefined value.

## Events

### Case Sensitivity

`onclick` listens to `click`, `onClick` listens to `Click` event.

### Passive Events

`ontouchstart`/`ontouchmove` are passive by default. Use `on` from `svelte/events`:

```ts
import { on } from 'svelte/events';
on(element, 'touchstart', handler, { passive: false });
```

### Event Delegation

Svelte delegates these to app root: click, change, input, keydown, keyup, mousedown/up/move/over/out, pointerdown/up/move/over/out, touchstart/end/move, focusin/out, dblclick, contextmenu, beforeinput.

- Manually dispatched events need `{ bubbles: true }`
- Avoid `stopPropagation` with `addEventListener` — use `on` from `svelte/events`

## use: Actions

**Prefer `{@attach}` in Svelte 5.29+.**

```svelte
<div use:myAction={params}>
```

- Called once on mount (not during SSR)
- NOT re-called when argument changes — use `$effect` inside for reactivity
- Return `{ destroy() {} }` for cleanup

## Transitions

### transition: (bidirectional)

```svelte
<div transition:fade={{ duration: 300 }}>
```

- Triggered by elements entering/leaving DOM via state changes
- All elements in transitioning-out block stay until transitions complete
- Can reverse mid-transition
- Local (default): only own block. `|global`: parent block changes too

### in: / out: (unidirectional)

```svelte
<div in:fly={{ y: 200 }} out:fade>
```

- NOT bidirectional — `in` continues alongside `out`, no reversal

### Custom Transitions

```ts
function myTransition(node, params) {
	return {
		delay: 0,
		duration: 300,
		easing: cubicOut,
		css: (t, u) => `opacity: ${t}; transform: scale(${t})`
		// OR tick: (t, u) => { node.style.opacity = t; }
	};
}
```

- `t`: 0→1 for in, 1→0 for out. `u = 1 - t`
- **Prefer `css` over `tick`** — CSS animations run off main thread
- Events: `introstart`, `introend`, `outrostart`, `outroend`

### Built-in Transitions (svelte/transition)

| Function    | Effect                                                         |
| ----------- | -------------------------------------------------------------- |
| `blur`      | Blur filter + opacity                                          |
| `crossfade` | Coordinated [send, receive] pair                               |
| `draw`      | SVG stroke (needs `getTotalLength()`)                          |
| `fade`      | Opacity                                                        |
| `fly`       | Position + opacity                                             |
| `scale`     | Scale + opacity                                                |
| `slide`     | Height/width (**GOTCHA**: no `display: inline/table/contents`) |

## animate: (Keyed Each Blocks Only)

```svelte
{#each items as item (item.id)}
	<li animate:flip={{ duration: 300 }}>{item.name}</li>
{/each}
```

- Only for reordering, NOT add/remove
- Must be on **immediate child** of keyed each block
- `animate:flip` built-in; custom: receives `{ from: DOMRect, to: DOMRect }`

@references references/bindings.md
@references references/events.md
@references references/transitions.md
