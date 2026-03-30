# Styling Patterns Reference

## Styling {@html} Content

```svelte
<div class="prose">{@html content}</div>

<style>
	.prose :global(h1) {
		font-size: 2rem;
	}
	.prose :global(a) {
		color: blue;
		text-decoration: underline;
	}
	.prose :global(code) {
		background: #f0f0f0;
		padding: 0.2em;
	}
</style>
```

## Styling Child Components

### Option 1: CSS Custom Properties (Preferred)

```svelte
<Button --bg="blue" --text="white" />

<!-- Button.svelte -->
<style>
	button {
		background: var(--bg, #333);
		color: var(--text, #fff);
	}
</style>
```

### Option 2: :global with Parent Class

```svelte
<div class="wrapper"><DataTable /></div>

<style>
	.wrapper :global(.dt-header) {
		font-weight: bold;
	}
	.wrapper :global(.dt-row:hover) {
		background: #f5f5f5;
	}
</style>
```

## Pass JS Values to CSS

```svelte
<script>
	let progress = $state(50);
</script>

<div style:--progress="{progress}%">
	<div class="bar"></div>
</div>

<style>
	.bar {
		width: var(--progress);
	}
</style>
```

## ClassValue Type for Component Props

```svelte
<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	let { class: className }: { class?: ClassValue } = $props();
</script>

<div class={['my-component', className]}>
	{@render children?.()}
</div>
```

## class Attribute Patterns

### Conditional Classes

```svelte
<div class={{ active: isActive, disabled: !enabled, 'text-lg': large }}>
```

### Dynamic Class Names

```svelte
<div class={['btn', `btn-${variant}`, `btn-${size}`]}>
```

### Combining Props and Local

```svelte
<div class={['card', { 'card-elevated': elevated }, props.class]}>
```

## Specificity Tips

- Scoped styles add 0-1-0 specificity (one class selector)
- Use `:global()` sparingly — it escapes scoping entirely
- `:where(.svelte-xyz)` used for subsequent occurrences (no extra specificity)
- If you need to override a child component's styles, use custom properties first

## Theming with Custom Properties

```svelte
<!-- App.svelte (root) -->
<div class="app" style:--primary="oklch(0.6 0.2 250)" style:--surface="oklch(0.98 0 0)">
	{@render children()}
</div>

<!-- Any child -->
<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--primary);
	}
</style>
```

## Dynamic Styles

```svelte
<div
  style:transform="rotate({rotation}deg)"
  style:opacity={visible ? 1 : 0}
  style:--custom-color={themeColor}
>
```
