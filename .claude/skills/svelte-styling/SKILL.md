---
name: svelte-styling
description: 'Svelte 5 styling: scoped CSS, :global, custom properties, CSS variables, style: directive, class attribute with objects/arrays, class: directive, and nested style elements. Use for scoped styles, global styles, svelte css, or theming.'
---

# Svelte 5 Styling

## Scoped Styles

CSS in `<style>` is scoped via hash-based class (e.g., `svelte-123xyz`).

- Specificity increase: 0-1-0 per scoped selector
- Subsequent occurrences use `:where(.svelte-xyz)` to avoid further specificity increase
- `@keyframes` names are scoped to the component

## Global Styles

```svelte
<!-- Single selector -->
<style>
  :global(body) { margin: 0; }
</style>

<!-- Block -->
<style>
  :global {
    body { margin: 0; }
    h1 { font-size: 2rem; }
  }
</style>
```

- Global keyframes: prefix with `-global-` (prefix removed in output)

## Custom Properties on Components

```svelte
<Slider --track-color="black" --thumb-color="red" />
```

Inside the component:

```css
.track {
	background: var(--track-color, #ccc);
}
```

- Desugars to wrapper element: `<svelte-css-wrapper style="display: contents; --track-color: black">`
- SVG uses `<g>` wrapper instead
- **GOTCHA**: Wrapper element affects CSS `>` combinator selectors

## style: Directive

```svelte
<div style:color="red">             <!-- static -->
<div style:color={myColor}>          <!-- dynamic -->
<div style:color>                    <!-- shorthand: style:color={color} -->
<div style:color|important="red">    <!-- !important -->
```

- **style: directives TAKE PRECEDENCE over style attributes**, even over `!important` in the attribute

### Pass JS Values to CSS

```svelte
<div style:--progress="{percent}%">
<style>
  div { width: var(--progress); }
</style>
```

## class Attribute (Svelte 5)

### Objects (since 5.16) — uses clsx internally

```svelte
<div class={{ active, disabled: !enabled }}>
```

### Arrays (since 5.16)

```svelte
<div class={['btn', size, variant && `btn-${variant}`]}>
```

### Mixed

```svelte
<div class={['cool-button', { active }, props.class]}>
```

- Falsy values filtered out (false, null, undefined, 0, '')

### ClassValue Type (since 5.19)

```ts
import type { ClassValue } from 'svelte/elements';
interface Props {
	class?: ClassValue;
}
```

## class: Directive

```svelte
<div class:active={isActive}>   <!-- conditional -->
<div class:active>               <!-- shorthand: class:active={active} -->
```

**Prefer class attribute with objects/arrays over class: directive in new code.**

## Nested `<style>` Elements

- Only ONE top-level `<style>` per component for scoping
- Nested `<style>` inside elements/blocks: inserted as-is, no scoping or processing

## Common Patterns

### Styling {@html} Content

```svelte
<div class="prose">{@html content}</div>

<style>
	.prose :global(h1) {
		font-size: 2rem;
	}
	.prose :global(a) {
		color: blue;
	}
</style>
```

### Styling Child Components

1. **CSS custom properties** (preferred): `<Child --color="red" />`
2. **:global with parent class**:

   ```svelte
   <div class="wrapper"><Child /></div>

   <style>
   	.wrapper :global(.child-class) {
   		color: red;
   	}
   </style>
   ```

@references references/styling-patterns.md
