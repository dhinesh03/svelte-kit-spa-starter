# Svelte 5 Project Guidelines

## Project Configuration (SvelteKit + Svelte 5)

- **Framework**: SvelteKit with adapter-static configured for SPA mode (`ssr: false`, `csr: true`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with OKLCH color space, tw-animate-css
- **UI Components**: [shadcn-svelte](https://shadcn-svelte.com/) components in `src/lib/components/ui/` built on Bits UI
- **Package Manager**: npm
- **Dev Server**: localhost:3000

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
│   ├── services/          # HTTP client, auth (MSAL), navigation
│   └── utils.ts           # Shared utilities (cn, helpers)
├── routes/
│   ├── +layout.svelte     # Root layout
│   ├── +layout.ts         # SPA config
│   ├── layout.css         # Tailwind v4 theme tokens (OKLCH, light/dark)
│   └── <feature>/         # Feature routes (file-based routing)
```

## Common Scripts

| Command            | Purpose                            |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start dev server on localhost:3000 |
| `npm run build`    | Production build                   |
| `npm run check`    | TypeScript + Svelte type checking  |
| `npm run lint:fix` | Format + lint fix                  |
| `npm run test`     | Run unit tests (vitest)            |

## State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- `runed` library's `resource()` for reactive data fetching with dependency tracking
- For shared state across components, use **class-based approach with context API** in `.svelte.ts` files
- Avoid using writable stores for shared state
- Always use `setContext`/`getContext` with **Symbol keys** for shared state within route boundaries

### Class-Based State Pattern

```ts
// <route>/stores/MyState.svelte.ts
export class MyState {
  value = $state(initialValue);
  computed = $derived(/* ... */);
  action = () => { /* mutate state */ };
}

const KEY = Symbol('my-state');
export const setMyContext = () => { const s = new MyState(); setContext(KEY, s); return s; };
export const getMyContext = () => getContext<MyState>(KEY);
```

- Call `setMyContext()` in the parent `+layout.svelte`
- Call `getMyContext()` in any child component

## Key Patterns

### API Integration

- All API functions return `CancellableRequest<T>` with `{ request: Promise, cancel: () => void }`
- `FetchService` handles auth token injection, cancellation, timeouts, SSE, uploads
- Add new API modules under `src/lib/apis/` following the existing module pattern (types, CRUD functions, barrel export)

### Theming

- `mode-watcher` manages dark/light mode globally
- Access current mode reactively via `import { mode } from 'mode-watcher'` → `mode.current`
- CSS tokens defined in `layout.css` with `:root` (light) and `.dark` overrides

### Component Conventions

- Use `{@attach}` directive for DOM initialization (e.g., AG Grid)
- shadcn-svelte components in `src/lib/components/ui/` — regenerate via CLI, don't manually edit
- Custom components go under `src/lib/components/<component-name>/` with barrel `index.ts`

### Adding a New Route

1. Create `src/routes/<name>/+page.svelte`
2. If the route needs shared state, add `+layout.svelte` and a `stores/` directory
3. Add navigation entry in the sidebar configuration

### Testing

- Unit tests use **vitest** — place test files next to source as `*.test.ts` or in `__tests__/`
- Run with `npm run test` (single run) or `npm run test:unit` (watch mode)
