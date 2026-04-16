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
│   ├── features/          # Feature-specific logic and initialization especially *.svelte.ts files (e.g., ag-grid, plotly, transitions)
│   ├── hooks/             # Reactive hooks as .svelte.ts files
│   ├── services/
│   │   ├── fetch/         # FetchService, fetchData bridge, SSE, pre-configured API instances (barrel index.ts)
│   │   ├── auth-service.ts      # AuthService (Azure AD/MSAL) — uses createSubscriber, NOT runes
│   │   └── navigation-client.ts # SvelteKit NavigationClient for MSAL
│   ├── utils.ts           # Tailwind merge (cn), type utilities
│   └── helpers.ts         # Event helpers (makeDebounce)
├── routes/
│   ├── +layout.svelte     # Root layout
│   ├── +layout.ts         # SPA config
│   ├── layout.css         # Tailwind v4 theme tokens (OKLCH, light/dark)
│   └── <feature>/         # Feature routes (file-based routing)
```

## Rules (`.claude/rules/`)

Detailed rules are split by concern and auto-loaded by Claude Code:

| Rule file                  | Scope                                             | What it covers                                                          |
| -------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| `state-management.md`      | All files                                         | Svelte 5 runes, class-based state, context API, file extension rules    |
| `api-conventions.md`       | `src/lib/apis/**`, `src/lib/services/**`          | FetchService+auth, fetchData bridge, API module pattern, error handling |
| `component-conventions.md` | `src/lib/components/**`, `src/routes/**/*.svelte` | Component lookup order, shadcn-svelte, theming                          |
| `code-style.md`            | All files                                         | TypeScript strict, imports, formatting, testing                         |
| `project-rules.md`         | All files                                         | Project-specific conventions and overrides (owned — edit freely)        |

## Adding a New Route

1. Create `src/routes/<name>/+page.svelte`
2. If the route needs shared state, add `+layout.svelte` and a `stores/` directory
3. Add navigation entry in the parent layout's sidebar nav items array

## Skills (`.claude/skills/`)

Project-level skills provide reference documentation and workflows. Use them when working on Svelte tasks or codifying project conventions:

| Task                                       | Skills to load                                             |
| ------------------------------------------ | ---------------------------------------------------------- |
| Creating/editing components                | `svelte-runes`, `svelte-template-syntax`, `svelte-styling` |
| Reactive state, props, effects             | `svelte-runes`                                             |
| Shared state, context API                  | `svelte-state-context`                                     |
| Event handling, bindings, transitions      | `svelte-bindings-events`                                   |
| Snippets, {@attach}, {@html}               | `svelte-template-syntax`                                   |
| Error boundaries, window/document bindings | `svelte-special-elements`                                  |
| Routing, layouts, page options             | `sveltekit-routing`                                        |
| Load functions, invalidation, hooks        | `sveltekit-data-loading`                                   |
| SPA setup, $app modules, $env              | `sveltekit-spa-static`                                     |
| Remote functions (.remote.ts)              | `sveltekit-remote-functions`                               |
| Reactive utilities (runed library)         | `runed`                                                    |
| CSS, theming, class attributes             | `svelte-styling`                                           |
| Codify developer instructions into rules   | `codify-instruction`                                       |

## Codifying Developer Instructions

When a developer states a convention, constraint, or architectural decision — phrases like "always use X", "never do Y", "from now on", "enforce this", or "make this a rule" — invoke `/codify-instruction` to transform it into a properly formatted rule and save it to `CLAUDE.local.md` (for project-level info) or `.claude/rules/project-rules.md` (for coding conventions). **Never modify managed files** (`CLAUDE.md`, `.claude/rules/code-style.md`, etc.) — they are overwritten on `claude-setup update`.

## Project-Specific Instructions

@CLAUDE.local.md
