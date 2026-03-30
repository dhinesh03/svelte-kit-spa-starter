# {@attach} Patterns Reference (since 5.29)

## Basic Usage

```svelte
{@attach (element) => {
  console.log('mounted', element);
  return () => console.log('cleanup');
}}
<div>Content</div>
```

## Attachment Factories

```svelte
<script>
	function tooltip(content: string) {
		return (element: HTMLElement) => {
			const instance = tippy(element, { content });
			return () => instance.destroy();
		};
	}
</script>

<button {@attach tooltip('Click me!')}>Hover</button>
```

## Reactive Attachments

```svelte
<script>
	let content = $state('initial');
</script>

<!-- Re-runs when `content` changes -->
<button {@attach tooltip(content)}>Hover</button>
```

### Performance: Getter Pattern

```ts
function expensive(getContent: () => string) {
	return (element: HTMLElement) => {
		// Only called once on mount
		$effect(() => {
			// Re-runs when getContent() changes
			element.setAttribute('data-tooltip', getContent());
		});
	};
}
```

```svelte
<button {@attach expensive(() => content)}>Hover</button>
```

## Conditional Attachments

```svelte
{@attach enabled && tooltip('text')}  <!-- falsy = no attachment -->
{@attach condition ? attachA : attachB}
```

## On Components

```svelte
<!-- Works if MyComponent spreads restProps onto an element -->
<script>
	// MyComponent.svelte
	let { ...restProps } = $props();
</script>

<!-- Creates a Symbol-keyed prop -->
<MyComponent {@attach tooltip('hint')} />
<div {...restProps}>Content</div>
```

## Converting use: Actions

```ts
import { fromAction } from 'svelte/attachments';

// Second argument MUST be a function returning the arg, not the arg itself
{@attach fromAction(myAction, () => actionParams)}
```

## createAttachmentKey (Programmatic)

```ts
import { createAttachmentKey } from 'svelte/attachments';

const key = createAttachmentKey();
const props = {
	[key]: (element: HTMLElement) => {
		// attachment logic
	}
};
// Spread onto element: <div {...props}>
```

## Multiple Attachments

```svelte
<div
  {@attach tooltip('hint')}
  {@attach draggable()}
  {@attach resizable()}
>
```

## vs use: Actions

| Feature       | {@attach}               | use:                        |
| ------------- | ----------------------- | --------------------------- |
| Reactivity    | Fully reactive          | Must use $effect internally |
| Re-invocation | Re-runs on state change | Never re-called             |
| Conditional   | Supports falsy values   | No built-in conditional     |
| On components | Works via Symbol prop   | Not supported               |
| Cleanup       | Return function         | Return { destroy() }        |
| Preferred     | Yes (Svelte 5.29+)      | Legacy                      |
