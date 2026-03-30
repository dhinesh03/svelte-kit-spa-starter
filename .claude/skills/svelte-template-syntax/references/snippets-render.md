# Snippets & {@render} Reference

## Passing Snippets to Components

### Method 1: Implicit Children

```svelte
<!-- Card.svelte -->
<script>
	let { children } = $props();
</script>

<!-- Parent -->
<Card>
	<p>This content becomes the `children` snippet</p>
</Card>
<div class="card">
	{@render children?.()}
</div>
```

### Method 2: Named Snippets (Implicit Props)

```svelte
<!-- Table.svelte -->
<script>
	let { data, header, row } = $props();
</script>

<!-- Parent -->
<Table data={items}>
	{#snippet header()}
		<th>Name</th><th>Age</th>
	{/snippet}
	{#snippet row(item)}
		<td>{item.name}</td><td>{item.age}</td>
	{/snippet}
</Table>
<table>
	<thead><tr>{@render header()}</tr></thead>
	<tbody>
		{#each data as item}
			<tr>{@render row(item)}</tr>
		{/each}
	</tbody>
</table>
```

### Method 3: Explicit Prop

```svelte
<!-- Parent -->
{#snippet myHeader()}<th>Custom</th>{/snippet}
<Table data={items} header={myHeader} />
```

## TypeScript Typing

```ts
import type { Snippet } from 'svelte';

interface Props {
	children: Snippet; // no params
	row: Snippet<[Item]>; // one param (tuple!)
	cell: Snippet<[Item, number]>; // two params
	header?: Snippet; // optional
}
```

### With Generics

```svelte
<script lang="ts" generics="T extends { id: string }">
	import type { Snippet } from 'svelte';
	interface Props {
		data: T[];
		row: Snippet<[T]>;
	}
	let { data, row }: Props = $props();
</script>
```

## Optional Snippets

```svelte
<!-- Optional chaining -->
{@render footer?.()}

<!-- With fallback -->
{#if footer}
	{@render footer()}
{:else}
	<p>Default footer</p>
{/if}
```

## Recursive Snippets

```svelte
{#snippet tree(nodes)}
	<ul>
		{#each nodes as node}
			<li>
				{node.name}
				{#if node.children}
					{@render tree(node.children)}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

{@render tree(rootNodes)}
```

## Exporting Snippets (since 5.5)

```svelte
<script module>
	export { mySnippet };
</script>

{#snippet mySnippet(name)}
	<p>Hello {name}</p>
{/snippet}
```

- Only top-level snippets that don't reference instance `<script>` vars

## createRawSnippet (Programmatic)

```ts
import { createRawSnippet } from 'svelte';

const greeting = createRawSnippet(() => ({
	render: () => '<p>Hello world</p>',
	setup: (element) => {
		$effect(() => {
			element.textContent = `Hello ${name}`;
		});
	}
}));
```

- `render` returns HTML string (called once)
- `setup` receives the root element (optional, for reactivity)

## GOTCHAS

1. **No rest parameters**: `{#snippet foo(...args)}` is invalid — use an array param
2. **Cannot name a prop `children` AND have content inside the component**
3. **Snippets are NOT components** — they don't have their own scope or lifecycle
4. **Dynamic render**: `{@render (condition ? snippetA : snippetB)()}` works
