# Events Reference

## Event Handler Syntax

```svelte
<button onclick={handler}>                <!-- function reference -->
<button onclick={(e) => handle(e)}>       <!-- inline -->
<button onclick={() => count++}>          <!-- expression -->
```

## Case Sensitivity

- `onclick` → listens to `click` event
- `onClick` → listens to `Click` event (capital C)
- Always use lowercase for standard DOM events

## Passive Events

`ontouchstart` and `ontouchmove` are passive by default. To call `preventDefault()`:

```ts
import { on } from 'svelte/events';

$effect(() => {
	const off = on(
		element,
		'touchstart',
		(e) => {
			e.preventDefault(); // works because not passive
		},
		{ passive: false }
	);
	return off;
});
```

## Event Delegation

Svelte delegates these events to the application root for performance:

`click`, `dblclick`, `contextmenu`, `beforeinput`, `change`, `input`, `focusin`, `focusout`, `keydown`, `keyup`, `mousedown`, `mouseup`, `mousemove`, `mouseover`, `mouseout`, `pointerdown`, `pointerup`, `pointermove`, `pointerover`, `pointerout`, `touchstart`, `touchend`, `touchmove`

### Implications

1. Manually dispatched events must include `{ bubbles: true }`
2. Don't use `element.addEventListener` with `stopPropagation` for delegated events — use `on` from `svelte/events` instead
3. Event order may differ from manual `addEventListener`

## svelte/events `on()` Function

```ts
import { on } from 'svelte/events';

const off = on(element, 'click', handler, { capture: true });
// Returns unsubscribe function
```

- Preserves correct order relative to declarative handlers
- Use instead of raw `addEventListener`
