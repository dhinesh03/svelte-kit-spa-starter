# Svelte 5 Project Guidelines

## Project Configuration (SvelteKit + Svelte 5)

- **Framework**: SvelteKit with adapter-static configured for SPA mode (`ssr: false`, `csr: true`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with OKLCH color space, tw-animate-css
- **UI Components**: [shadcn-svelte](https://shadcn-svelte.com/) components in `src/lib/components/ui/` built on Bits UI
- **Package Manager**: npm
- **Dev Server**: localhost:3000
- **Add-ons**: prettier, eslint, vitest, tailwindcss, sveltekit-adapter, devtools-json, mcp

## Project Structure

```text
src/
├── lib/
│   ├── apis/json-placeholder/   # Typed CRUD: posts, users, todos (CancellableRequest pattern)
│   ├── components/
│   │   ├── ui/                  # 42 shadcn-svelte components (do not manually edit)
│   │   ├── combobox/            # Custom searchable dropdown (Fuse.js + Virtua)
│   │   ├── sortable-list/       # Drag-and-drop reorderable list
│   │   ├── ThemeSwitcher.svelte # Dark/light toggle via mode-watcher
│   │   └── UnderConstruction.svelte
│   ├── features/
│   │   ├── ag-grid/             # AG Grid init with reactive dark/light theming
│   │   └── transition.ts        # Crossfade animation utilities
│   ├── hooks/
│   │   └── is-mobile.svelte.ts  # Responsive breakpoint detection (MediaQuery)
│   ├── services/
│   │   ├── auth-service.ts      # Azure AD/MSAL singleton authentication
│   │   ├── fetch-service.ts     # Type-safe HTTP client (GET/POST/PUT/PATCH/DELETE/SSE/upload)
│   │   ├── api-service.ts       # Pre-configured FetchService instances
│   │   └── navigation-client.ts # MSAL + SvelteKit router integration
│   ├── helpers.ts               # Debounce utility
│   └── utils.ts                 # cn() (clsx + tw-merge), type utilities
├── routes/
│   ├── +layout.svelte           # Root layout (ModeWatcher, ThemeSwitcher, Sidebar, Sonner)
│   ├── +layout.ts               # SPA config + AG Grid module registration
│   ├── +error.svelte            # Global error page
│   ├── layout.css               # Tailwind v4 theme tokens (OKLCH, light/dark)
│   └── showcase/
│       ├── +page.svelte         # Component demos (ComboBox, SortableList)
│       ├── api/+page.svelte     # API demo with reactive resources
│       └── ag-grid/+page.svelte # AG Grid showcase (basic + filterable/paginated)
```

## State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- `runed` library's `resource()` for reactive data fetching with dependency tracking
- For shared state across components, use **class-based approach with context API** in `.svelte.ts` files
- Avoid using writable stores for shared state
- Always use `setContext`/`getContext` with **Symbol keys** for shared state within route boundaries

### Class-Based State with Context

Define the state class in a `.svelte.ts` file:

```ts
// routes/dashboard/stores/CounterState.svelte.ts
import { getContext, setContext } from 'svelte';

export class CounterState {
  count = $state(0);
  doubled = $derived(this.count * 2);

  increment = () => {
    this.count++;
  };

  decrement = () => {
    this.count--;
  };

  reset = () => {
    this.count = 0;
  };
}

// Use Symbol for type-safe context keys
const COUNTER_KEY = Symbol('counter');

// Context helpers
export function setCounterContext(): CounterState {
  const state = new CounterState();
  setContext(COUNTER_KEY, state);
  return state;
}

export function getCounterContext(): CounterState {
  const context = getContext<CounterState>(COUNTER_KEY);
  if (!context) {
    throw new Error('CounterContext not found. Did you forget to call setCounterContext in a parent component?');
  }
  return context;
}
```

### Setting Context in Layout

```svelte
<!-- routes/dashboard/+layout.svelte -->
<script lang="ts">
	import { setCounterContext } from './stores/CounterState.svelte';

	// Initialize context for all child routes
	setCounterContext();
</script>

<slot />
```

### Consuming Context in Components

```svelte
<!-- routes/dashboard/components/CounterDisplay.svelte -->
<script lang="ts">
	import { getCounterContext } from '../stores/CounterState.svelte';

	const counter = getCounterContext();
</script>

<div>
	<p>Count: {counter.count}</p>
	<p>Doubled: {counter.doubled}</p>
	<button onclick={counter.increment}>Increment</button>
	<button onclick={counter.decrement}>Decrement</button>
	<button onclick={counter.reset}>Reset</button>
</div>
```

## Key Patterns

### API Integration

- All API functions return `CancellableRequest<T>` with `{ request: Promise, cancel: () => void }`
- `FetchService` handles auth token injection, cancellation, timeouts, SSE, uploads
- Add new API modules under `src/lib/apis/` following the json-placeholder pattern

### Theming

- `mode-watcher` manages dark/light mode globally
- Access current mode reactively via `import { mode } from 'mode-watcher'` → `mode.current`
- AG Grid theme reacts to mode changes via `$effect` in `src/lib/features/ag-grid/`
- CSS tokens defined in `layout.css` with `:root` (light) and `.dark` overrides

### Component Conventions

- Use `{@attach}` directive for DOM initialization (e.g., AG Grid)
- shadcn-svelte components are in `src/lib/components/ui/` — regenerate via CLI, don't manually edit
- Custom components go directly under `src/lib/components/`

## Quick Reference: Runes Cheat Sheet

| Rune          | Purpose           | Example                                          |
| ------------- | ----------------- | ------------------------------------------------ |
| `$state`      | Reactive variable | `let count = $state(0)`                          |
| `$derived`    | Computed value    | `let double = $derived(count * 2)`               |
| `$derived.by` | Complex computed  | `let sum = $derived.by(() => items.reduce(...))` |
| `$effect`     | Side effects      | `$effect(() => { console.log(count) })`          |
| `$props`      | Component props   | `let { name } = $props()`                        |
| `$bindable`   | Two-way binding   | `let { value = $bindable() } = $props()`         |

## Available MCP Tools

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
