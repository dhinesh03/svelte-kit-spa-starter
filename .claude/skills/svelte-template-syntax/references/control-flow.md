# Control Flow Reference

## {#each} Advanced Patterns

### Keyed Each — Always Use for Dynamic Lists

```svelte
{#each items as item (item.id)}
	<Item data={item} />
{/each}
```

- Key must uniquely identify the item — use strings/numbers, never index
- Without key: Svelte reuses DOM nodes by position (wrong behavior on reorder)

### Destructuring

```svelte
{#each items as { id, name, ...rest }, index (id)}
	<p>{index}: {name}</p>
{/each}
```

### Each Without Item (Repeat N Times)

```svelte
{#each { length: 8 }, i}
	<div>Row {i}</div>
{/each}
```

### Iterables (Map, Set)

```svelte
{#each myMap as [key, value] (key)}
	<p>{key}: {value}</p>
{/each}
```

### Empty State

```svelte
{#each items as item (item.id)}
	<Item {item} />
{:else}
	<p>No items found</p>
{/each}
```

### GOTCHA: Reassigning vs Mutating in Runes Mode

```ts
// In runes mode, cannot reassign each block variable
{#each items as item}
  <button onclick={() => item = newItem}>  <!-- COMPILER ERROR -->
  <button onclick={() => item.name = 'new'}>  <!-- OK (mutation) -->
  <button onclick={() => items[i] = newItem}>  <!-- OK (array access) -->
```

## {#await} Patterns

### Short Form (no pending)

```svelte
{#await promise then data}
	<p>{data}</p>
{/await}
```

### Short Form (no catch)

```svelte
{#await promise}
	<p>Loading...</p>
{:then data}
	<p>{data}</p>
{/await}
```

### Lazy Component Loading

```svelte
{#await import('./HeavyComponent.svelte') then { default: HeavyComponent }}
	<HeavyComponent />
{/await}
```

## {#key} Use Cases

### Force Component Reinstantiation

```svelte
{#key userId}
	<UserProfile id={userId} />
{/key}
```

### Trigger Transition on Value Change

```svelte
{#key value}
	<div transition:fade>{value}</div>
{/key}
```

## {#if} in Text

```svelte
<p>
	Logged in as {user.name}
	{#if user.admin}(admin){/if}
</p>
```
