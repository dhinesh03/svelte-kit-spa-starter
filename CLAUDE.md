# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other AI agents when working with code in this repository. Detailed rules are in `.claude/rules/`.

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

## Rules (`.claude/rules/`)

Detailed rules are split by concern and auto-loaded by Claude Code:

| Rule file | Scope | What it covers |
| --- | --- | --- |
| `state-management.md` | All files | Svelte 5 runes, class-based state pattern, context API |
| `api-conventions.md` | `src/lib/apis/**`, `src/lib/services/**` | CancellableRequest pattern, FetchService, API module structure |
| `component-conventions.md` | `src/lib/components/**`, `src/routes/**/*.svelte` | Component lookup order, shadcn-svelte, theming |
| `code-style.md` | All files | TypeScript strict, imports, formatting, testing |

### Adding a New Route

1. Create `src/routes/<name>/+page.svelte`
2. If the route needs shared state, add `+layout.svelte` and a `stores/` directory
3. Add navigation entry in the sidebar configuration
