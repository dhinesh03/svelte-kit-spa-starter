---
paths:
  - "src/lib/components/**"
  - "src/lib/features/**"
  - "src/routes/**/*.svelte"
---
# Component Conventions

When you need a UI component, follow this lookup order **strictly**:

1. **`$lib/features/`** — Feature modules (e.g., AG Grid for any table/data grid work, initialized with `{@attach}`)
2. **`$lib/components/`** — Custom reusable components (e.g., `combobox` for any select/combobox — disable search prop for plain select)
3. **`$lib/components/ui/`** — Existing shadcn-svelte components (do NOT manually edit — regenerate via CLI)
4. **[shadcn-svelte](https://shadcn-svelte.com/docs/components)** — Search docs and add: `npx shadcn-svelte@latest add <component>`
5. **Custom with Bits UI** — Last resort only. Must use `cn()` and respect shadcn theme tokens from `layout.css`

| Need | Use | Notes |
| --- | --- | --- |
| Tables / Data grids | `$lib/features/ag-grid` | Initialize with `{@attach}` directive |
| Select / Combobox | `$lib/components/combobox` | For plain select, disable search prop |

Custom components go under `src/lib/components/<component-name>/` with barrel `index.ts`.

## Theming

- `mode-watcher` manages dark/light mode globally
- Access current mode reactively via `import { mode } from 'mode-watcher'` → `mode.current`
- CSS tokens defined in `layout.css` with `:root` (light) and `.dark` overrides
