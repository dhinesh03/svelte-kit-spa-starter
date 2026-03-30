# Special Elements Reference

## svelte:boundary — Complete API

### All Props

| Prop             | Type                      | Description                                            |
| ---------------- | ------------------------- | ------------------------------------------------------ |
| `pending`        | `Snippet`                 | Shown while async awaits resolve (first creation only) |
| `failed`         | `Snippet<[error, reset]>` | Shown on error                                         |
| `onerror`        | `(error, reset) => void`  | Error handler callback                                 |
| `transformError` | `(error) => serializable` | SSR error transformation (since 5.51)                  |

### Nested Boundaries

```svelte
<svelte:boundary>
	{#snippet failed(error, reset)}
		<p>Outer error: {error.message}</p>
	{/snippet}
	<svelte:boundary>
		{#snippet failed(error, reset)}
			<p>Inner error: {error.message}</p>
		{/snippet}
		<Component />
	</svelte:boundary>
</svelte:boundary>
```

### What's Caught vs Not Caught

| Caught                | Not Caught                       |
| --------------------- | -------------------------------- |
| Render errors         | Event handler errors             |
| Effect errors         | setTimeout/async callback errors |
| Synchronous lifecycle | Errors in child boundaries       |

## svelte:window — All Bindings

| Property           | Writable | Type      |
| ------------------ | -------- | --------- |
| `innerWidth`       | No       | `number`  |
| `innerHeight`      | No       | `number`  |
| `outerWidth`       | No       | `number`  |
| `outerHeight`      | No       | `number`  |
| `scrollX`          | Yes      | `number`  |
| `scrollY`          | Yes      | `number`  |
| `online`           | No       | `boolean` |
| `devicePixelRatio` | No       | `number`  |

```svelte
<svelte:window bind:innerWidth={w} bind:scrollY={y} onkeydown={handleKey} onscroll={handleScroll} />
```

## svelte:document — All Bindings

| Property             | Writable | Type                      |
| -------------------- | -------- | ------------------------- |
| `activeElement`      | No       | `Element \| null`         |
| `fullscreenElement`  | No       | `Element \| null`         |
| `pointerLockElement` | No       | `Element \| null`         |
| `visibilityState`    | No       | `DocumentVisibilityState` |

```svelte
<svelte:document onvisibilitychange={handleVisibility} bind:activeElement={active} />
```

## svelte:element — Dynamic Tags

```svelte
<script>
	let tag = $state('h1');
</script>

<svelte:element this={tag}>Dynamic heading</svelte:element>

<!-- Render nothing when null -->
<svelte:element this={condition ? 'div' : null}>Maybe</svelte:element>
```

## svelte:options — Custom Elements Config

```svelte
<svelte:options
	customElement={{
		tag: 'my-widget',
		shadow: 'open',
		props: {
			name: { reflect: true, type: 'String', attribute: 'name' }
		},
		extend: (customElementConstructor) => {
			return class extends customElementConstructor {
				static formAssociated = true;
			};
		}
	}}
/>
```
