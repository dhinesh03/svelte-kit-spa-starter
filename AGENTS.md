# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other AI agents when working with code in this repository.

## Project Configuration (SvelteKit + Svelte 5)

- **Framework**: SvelteKit with adapter-static configured for SPA mode (`ssr: false`, `csr: true`, fallback to `index.html`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with OKLCH color space, tw-animate-css
- **UI Components**: [shadcn-svelte](https://shadcn-svelte.com/) components in `src/lib/components/ui/` built on Bits UI
- **Package Manager**: npm
- **Dev Server**: localhost:3000
- **Routing**: All client-side. Root `/` redirects to `/showcase`

## Quick Reference

| Command             | Purpose                             |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server on localhost:3000        |
| `npm run build`     | Production build (static SPA)       |
| `npm run check`     | TypeScript + Svelte type checking   |
| `npm run lint`      | Check formatting + lint             |
| `npm run lint:fix`  | Auto-fix formatting + lint          |
| `npm run test`      | Run unit tests (vitest, single run) |
| `npm run test:unit` | Run unit tests (vitest, watch mode) |

## Project Structure

```text
src/
├── lib/
│   ├── apis/              # API modules — typed CRUD with CancellableRequest pattern
│   ├── components/
│   │   ├── ui/            # shadcn-svelte components (do NOT manually edit — use CLI)
│   │   └── <custom>/      # Custom reusable components (combobox, sortable-list, file-upload, etc.)
│   ├── features/          # Feature-specific logic and initialization especially *.svelte.ts files (e.g., ag-grid, transitions)
│   ├── hooks/             # Reactive hooks as .svelte.ts files
│   ├── services/          # FetchService (HTTP client), AuthService (Azure AD/MSAL), NavigationClient
│   └── utils.ts           # Shared utilities (cn, helpers)
├── routes/
│   ├── +layout.svelte     # Root layout
│   ├── +layout.ts         # SPA config
│   ├── layout.css         # Tailwind v4 theme tokens (OKLCH, light/dark)
│   └── <feature>/         # Feature routes (file-based routing)
```

## State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- `runed` library's `resource()` for reactive data fetching with dependency tracking
- For shared state across components, use **class-based approach with context API** in `.svelte.ts` files
- Do not use writable stores for shared state
- Always use `setContext`/`getContext` with **Symbol keys** for shared state within route boundaries

### Class-Based State Pattern

```ts
// <route>/stores/MyState.svelte.ts
export class MyState {
	value = $state(initialValue);
	computed = $derived(/* ... */);
	action = () => {
		/* mutate state */
	};
}

const KEY = Symbol('my-state');
export const setMyContext = () => {
	const s = new MyState();
	setContext(KEY, s);
	return s;
};
export const getMyContext = () => getContext<MyState>(KEY);
```

- Call `setMyContext()` in the parent `+layout.svelte`
- Call `getMyContext()` in any child component

## Key Patterns

### API Integration

- All API functions return `CancellableRequest<T>` with `{ request: Promise<T>, cancel: () => void }`
- `FetchService` handles auth token injection, cancellation, timeouts, SSE, uploads
- Add new API modules under `src/lib/apis/<name>/` following the existing pattern (types.ts, CRUD functions, barrel index.ts)

### Theming

- `mode-watcher` manages dark/light mode globally
- Access current mode reactively via `import { mode } from 'mode-watcher'` → `mode.current`
- CSS tokens defined in `layout.css` with `:root` (light) and `.dark` overrides

### Component Conventions

When you need a UI component, follow this lookup order **strictly**:

1. **`$lib/features/`** — Feature modules (e.g., AG Grid for any table/data grid work, initialized with `{@attach}`)
2. **`$lib/components/`** — Custom reusable components (e.g., `combobox` for any select/combobox — disable search prop for plain select)
3. **`$lib/components/ui/`** — Existing shadcn-svelte components (do NOT manually edit — regenerate via CLI)
4. **[shadcn-svelte](https://shadcn-svelte.com/docs/components)** — Search docs and add: `npx shadcn-svelte@latest add <component>`
5. **Custom with Bits UI** — Last resort only. Must use `cn()` and respect shadcn theme tokens from `layout.css`

| Need                | Use                        | Notes                                 |
| ------------------- | -------------------------- | ------------------------------------- |
| Tables / Data grids | `$lib/features/ag-grid`    | Initialize with `{@attach}` directive |
| Select / Combobox   | `$lib/components/combobox` | For plain select, disable search prop |

Custom components go under `src/lib/components/<component-name>/` with barrel `index.ts`.

### Adding a New Route

1. Create `src/routes/<name>/+page.svelte`
2. If the route needs shared state, add `+layout.svelte` and a `stores/` directory
3. Add navigation entry in the sidebar configuration

## Code Style

- **Comments**: Use sparingly. Only comment complex, non-obvious code. Do not add routine comments, JSDoc, or section markers to straightforward code.

## Key Conventions

- **Svelte 5 runes** are enabled globally — use `$state`, `$derived`, `$effect` (not legacy `$:` or stores)
- **TypeScript strict mode** — all code must pass `npm run check`
- **File extensions**: `.svelte.ts` for rune-enabled modules, `.ts` for plain TypeScript
- **Import sorting**: ESLint enforces groups — svelte → types → externals → internals → relative
- **Path aliases**: `$lib` → `src/lib`, plus `components`, `ui`, `hooks`, `utils` aliases (see `components.json`)
- **Formatting**: Prettier with tabs, single quotes, 140 char width
- **Tests**: vitest with `requireAssertions: true` — every test must have at least one assertion. Place tests as `*.test.ts` next to source or in `__tests__/`
