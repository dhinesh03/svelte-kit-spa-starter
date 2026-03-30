---
name: svelte-template-syntax
description: 'Svelte 5 template syntax: control flow ({#if}, {#each}, {#key}, {#await}), snippets ({#snippet}, {@render}), special tags ({@html}, {@attach}, {@const}, {@debug}), and markup rules. Use for conditional rendering, each blocks, snippets, template directives, or control flow.'
---

# Svelte 5 Template Syntax

## Basic Markup Rules

- Lowercase = HTML element, Capitalized/dot notation = component
- Boolean attributes: included if truthy, excluded if falsy
- Other attributes: excluded if nullish (`null`/`undefined`)
- Shorthand: `{name}` === `name={name}`
- Spread: `{...props}` — multiple spreads allowed, order = precedence
- Text expressions: null/undefined omitted, all others stringified
- RegExp must be in parens: `{(/regex/).test(v) ? x : y}`
- GOTCHA: Quoting `disabled="{expr}"` will coerce to string in Svelte 6

## Events

- Case sensitive: `onclick` → `click`, `onClick` → `Click` event
- `ontouchstart`/`ontouchmove` passive by default — use `on` from `svelte/events` to `preventDefault`
- Event delegation: Svelte delegates certain events to app root for performance
  - Manually dispatched events need `{ bubbles: true }`
  - Avoid `stopPropagation` with `addEventListener` — use `on` from `svelte/events`

## {#if ...} / {:else if} / {:else}

```svelte
{#if loggedIn}
	<button onclick={logout}>Log out</button>
{:else if registered}
	<button onclick={login}>Log in</button>
{:else}
	<button onclick={register}>Register</button>
{/if}
```

- Can wrap text within elements (don't need to wrap elements)

## {#each items as item, index (key)}

```svelte
{#each items as item, i (item.id)}
	<li>{i}: {item.name}</li>
{:else}
	<p>No items</p>
{/each}
```

- Works with arrays, array-likes (`length`), iterables (Map, Set)
- null/undefined = empty array
- Keyed blocks: `(item.id)` — key must uniquely identify, use strings/numbers
- Destructuring: `{#each items as { name, id }, i (id)}`
- Rest: `{#each items as { id, ...rest }}`
- Without item: `{#each { length: 8 }, rank}` — renders N times
- `{:else}` renders when list is empty

## {#key expression}

```svelte
{#key value}
	<Component /> <!-- destroyed and recreated when value changes -->
{/key}
```

- Forces component reinstantiation and reinitialisation

## {#await promise}

```svelte
{#await promise}
	<p>Loading...</p>
{:then data}
	<p>{data}</p>
{:catch error}
	<p>{error.message}</p>
{/await}
```

- SSR: only pending branch renders
- Non-promise: only `:then` renders
- Can omit any branch
- Lazy loading: `{#await import('./Comp.svelte') then { default: Comp }}`

## {#snippet name(params)} / {@render}

```svelte
{#snippet greeting(name, bold = false)}
	{#if bold}<strong>Hello {name}!</strong>{:else}Hello {name}!{/if}
{/snippet}

{@render greeting('world', true)}
```

### Rules

- Lexical scoping — visible to siblings and children
- Can self-reference (recursion)
- Parameters: defaults yes, **rest params NO**
- Expression can be dynamic: `{@render (cool ? snippetA : snippetB)()}`

### Passing Snippets to Components

**Implicit children** — non-snippet content inside component tags:

```svelte
<Card>
	<p>This becomes the `children` snippet</p>
</Card>
<!-- Inside Card: {@render children?.()} -->
```

**Implicit named** — snippet declared inside component tags becomes prop:

```svelte
<Table data={items}>
	{#snippet header()}<th>Name</th>{/snippet}
	{#snippet row(item)}<td>{item.name}</td>{/snippet}
</Table>
```

**GOTCHA**: Cannot have prop named `children` AND content inside component.

### Optional Snippets

```svelte
{@render children?.()}
<!-- or -->
{#if children}{@render children()}{:else}Fallback{/if}
```

### TypeScript

```ts
import type { Snippet } from 'svelte';
interface Props {
	children: Snippet;
	row: Snippet<[Item]>; // tuple type
}
```

### Exporting (since 5.5)

Top-level snippets can export from `<script module>` if they don't reference instance-level declarations.

## {@html expression}

```svelte
{@html '<p>Raw HTML</p>'}
```

- **NO XSS protection** — you must sanitize
- Does NOT compile Svelte code
- GOTCHA: Invisible to scoped styles — use `:global` to target

## {@attach fn} (since 5.29)

```svelte
{@attach (element) => {
  // runs in effect when mounted or state updates
  return () => { /* cleanup */ };
}}
```

### Factories

```svelte
{@attach tooltip(content)}  <!-- tooltip returns an attachment -->
```

### Conditional

```svelte
{@attach condition && myAttachment}  <!-- falsy = no attachment -->
```

### On Components

Creates a Symbol-keyed prop — works if component spreads `{...restProps}` onto an element.

### Performance

Pass data as getter + child `$effect` to avoid expensive re-runs:

```ts
function expensive(getFn: () => Data) {
	return (element: HTMLElement) => {
		$effect(() => {
			/* use getFn() here */
		});
	};
}
```

### Converting Actions

```ts
import { fromAction } from 'svelte/attachments';
{@attach fromAction(myAction, () => arg)}  // second arg MUST be function
```

## {@const declaration}

```svelte
{#each boxes as box}
	{@const area = box.width * box.height}
	<p>{area}</p>
{/each}
```

- Only as immediate child of blocks, components, or `<svelte:boundary>`

## {@debug vars}

```svelte
{@debug user}
<!-- logs + pauses with devtools open -->
{@debug}
<!-- debugger on any state change -->
```

- Only accepts variable names, NOT expressions (`{@debug user.name}` is invalid)

@references references/control-flow.md
@references references/snippets-render.md
@references references/attach-patterns.md
