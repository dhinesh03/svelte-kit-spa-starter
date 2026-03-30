# Bindings Reference

## Function Bindings (since 5.9)

```svelte
<!-- Transform on get/set -->
<input bind:value={() => value.toUpperCase(), (v) => (value = v.toLowerCase())} />

<!-- Readonly binding with callback -->
<div bind:clientWidth={null, (w) => (width = w)} />
```

## Input Type Coercion

| Input Type | bind:value type              | Empty/Invalid |
| ---------- | ---------------------------- | ------------- |
| `text`     | `string`                     | `""`          |
| `number`   | `number`                     | `undefined`   |
| `range`    | `number`                     | N/A           |
| `checkbox` | via `bind:checked` (boolean) | `false`       |
| `file`     | via `bind:files` (FileList)  | `null`        |

## defaultValue / defaultChecked (since 5.6)

```svelte
<input bind:value={name} defaultValue="Anonymous" />
<!-- On form reset, reverts to "Anonymous" instead of "" -->
```

## Group Bindings

```svelte
<!-- Radio: mutually exclusive -->
<input type="radio" bind:group={selected} value="a" />
<input type="radio" bind:group={selected} value="b" />

<!-- Checkbox: array -->
<input type="checkbox" bind:group={flavors} value="chocolate" />
<input type="checkbox" bind:group={flavors} value="vanilla" />
```

**Only works within the same Svelte component.**

## File Inputs

```svelte
<input type="file" bind:files={images} accept="image/*" multiple />
```

- Programmatic clear: `images = new DataTransfer().files`
- Leave uninitialized for SSR safety (FileList doesn't exist on server)

## Dimension Bindings

```svelte
<div bind:clientWidth={w} bind:clientHeight={h}>
<div bind:contentRect={rect}>  <!-- DOMRectReadOnly -->
<div bind:contentBoxSize={size}>  <!-- ResizeObserverSize[] -->
```

- All readonly, via ResizeObserver
- `display: inline` elements cannot be observed
- CSS transforms don't trigger ResizeObserver

## bind:this with Function (since 5.9)

```svelte
<canvas bind:this={
  (el) => { canvas = el; initGL(el); },    <!-- set -->
  () => { cleanupGL(); canvas = null; }     <!-- unset on destroy -->
} />
```
