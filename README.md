# SvelteKit SPA Starter

A feature-rich SvelteKit Single Page Application starter template with TypeScript, Tailwind CSS v4, Azure AD authentication, and 40+ pre-built UI components.

## Tech Stack

| Category          | Technology                                         |
| ----------------- | -------------------------------------------------- |
| Framework         | SvelteKit 2 (static adapter, SPA mode)             |
| Language          | Svelte 5 (runes) + TypeScript (strict)             |
| Styling           | Tailwind CSS v4, tw-animate-css, tailwind-variants |
| UI Components     | Bits UI (40+ headless components), Lucide icons    |
| Authentication    | Azure AD / MSAL (optional)                         |
| Data Grid         | AG Grid Community                                  |
| Charts            | Plotly.js                                          |
| Search            | Fuse.js (fuzzy search)                             |
| Virtual Scrolling | Virtua                                             |
| Reactivity        | Runed (reactive resources)                         |
| Testing           | Vitest                                             |
| Linting           | ESLint 9 (flat config) + Prettier                  |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Clone & Install

```sh
git clone git@github.com:dhinesh03/svelte-kit-spa-starter.git
cd svelte-kit-spa-starter
npm install
```

### Environment Variables (Optional)

Copy the example env file and fill in Azure AD credentials if you need authentication:

```sh
cp .env.example .env
```

```env
VITE_AZURE_TENANT_ID=       # Azure AD tenant ID
VITE_AZURE_CLIENT_ID=       # Azure AD app registration client ID
VITE_ACCESS_SCOPES=api://your-api/.default
```

Leave these empty to run the app without authentication. Routes under `(protected)/` will require auth when configured.

### Development

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```sh
npm run build
```

The static output is generated in the `build/` directory, ready to be deployed to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

Preview the production build locally:

```sh
npm run preview
```

## Available Scripts

| Script                | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start dev server on port 3000        |
| `npm run build`       | Build for production (static output) |
| `npm run preview`     | Preview production build             |
| `npm run check`       | Run svelte-check for type errors     |
| `npm run check:watch` | Run svelte-check in watch mode       |
| `npm run lint`        | Check formatting & linting           |
| `npm run lint:fix`    | Auto-fix formatting & linting        |
| `npm run format`      | Format with Prettier                 |
| `npm run test`        | Run unit tests once                  |
| `npm run test:unit`   | Run unit tests in watch mode         |

## Project Structure

```
src/
├── lib/
│   ├── apis/                    # API modules — typed CRUD with CancellableRequest pattern
│   ├── components/
│   │   ├── ui/                  # 40+ shadcn-svelte components (accordion, button,
│   │   │                        #   card, dialog, tabs, sidebar, etc.)
│   │   ├── combobox/            # Searchable dropdown (single/multi, grouped,
│   │   │                        #   virtual scrolling, fuzzy search)
│   │   ├── file-upload/         # Drag-and-drop file upload zone
│   │   ├── sortable-list/       # Drag-and-drop reorderable list
│   │   ├── ThemeSwitcher.svelte # Dark/light mode toggle
│   │   └── UnderConstruction.svelte
│   ├── features/
│   │   ├── ag-grid/             # AG Grid setup with Quartz theme ({@attach})
│   │   ├── plotly/              # Plotly charts with dark/light theme ({@attach})
│   │   └── transition.ts        # Crossfade animation utilities
│   ├── hooks/
│   │   └── is-mobile.svelte.ts  # Responsive breakpoint detection (768px)
│   ├── services/
│   │   ├── fetch/               # FetchService, fetchData bridge, SSE, API instances
│   │   ├── auth-service.ts      # Azure AD/MSAL singleton (login, tokens, SSO)
│   │   └── navigation-client.ts # MSAL + SvelteKit router integration
│   ├── helpers.ts               # Debounce utility
│   └── utils.ts                 # cn() — clsx + tailwind-merge
├── routes/
│   ├── +layout.svelte           # Root layout (auth init, theme switcher, toaster)
│   ├── +layout.ts               # SPA config (ssr=false, csr=true)
│   ├── +page.svelte             # Landing page (redirects to /showcase)
│   ├── +error.svelte            # Error page (404, 403, 500)
│   ├── layout.css               # Global styles, CSS variables, dark mode
│   ├── (protected)/             # Auth-guarded routes (auto-login on access)
│   │   ├── +layout.svelte       # Auth guard — redirects to login if not authenticated
│   │   └── dashboard/           # Protected dashboard page
│   └── showcase/                # Demo routes (public, dev reference)
│       ├── api/                 # API integration examples
│       ├── charts/              # Plotly chart demos
│       ├── components/          # UI component showcase
│       ├── file-upload/         # File upload demo
│       ├── live-table/          # AG Grid live streaming table
│       └── toast/               # Toast notification demos
├── app.html                     # HTML template
└── app.d.ts                     # Global type declarations
static/                          # Static assets
.github/workflows/               # CI/CD (Claude Code + review automation)
```

## Key Features

### Authentication (Azure AD / MSAL)

Optional Azure AD authentication with protected route groups:

- Singleton `AuthService` with full Azure AD integration
- Login/logout with popup or redirect
- Silent SSO and token refresh
- Multi-account switching
- Protected route group `(protected)/` with automatic login redirect
- `withAuth()` wrapper for authenticated API calls
- **Optional** — leave env vars empty to run without auth

### HTTP Client (FetchService)

Type-safe HTTP client with enterprise features:

- GET, POST, PUT, PATCH, DELETE with typed responses
- Request cancellation via AbortController
- Automatic timeout handling
- FormData uploads with progress tracking
- File downloads
- Server-Sent Events (SSE) with auth support
- Automatic Bearer token injection

All API functions return a `CancellableRequest<T>` with both a `request` promise and a `cancel()` method for cleanup.

### UI Components

**40+ [shadcn-svelte](https://shadcn-svelte.com/) components** in `src/lib/components/ui/` built on Bits UI, including: Accordion, Alert, Badge, Button, Card, Checkbox, Collapsible, Command, Dialog, Dropdown Menu, Input, Label, Pagination, Popover, Progress, Radio Group, Resizable Panes, Sheet, Sidebar, Skeleton, Slider, Sonner (toasts), Spinner, Switch, Tabs, Textarea, Toggle, Tooltip, and more.

**Custom components:**

- **ComboBox** — Searchable dropdown with single/multi select, item grouping, virtual scrolling (Virtua), fuzzy search (Fuse.js), and configurable sizes
- **SortableList** — Drag-and-drop reorderable list with handle and full-item drag modes
- **FileUpload** — Drag-and-drop file upload zone with preview
- **ThemeSwitcher** — Dark/light mode toggle via `mode-watcher`

### Theming

- Dark/light mode with CSS custom properties (OKLch color space)
- Tailwind CSS v4 with `@tailwindcss/forms` and `@tailwindcss/typography`
- Inter variable font
- Built-in animations via `tw-animate-css`

### State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- `runed` library's `resource()` for reactive data fetching with dependency tracking
- Class-based state with `createContext()` for shared state across components
- No centralized store — state is co-located with components

### CI/CD (Claude Code)

AI-assisted development workflows via GitHub Actions:

- **Implementation** (`claude.yml`) — Claude Code agent triggered by `@claude` mentions in issues/PRs. Uses Superpowers plugin for TDD, systematic debugging, and verification-before-completion. Captures Playwright screenshots as visual evidence.
- **Code Review** (`claude-code-review.yml`) — Automated PR review on pushes to `develop`. Runs type checks, lint, and tests. Fixes critical issues directly and posts review summary.
- **Branching** — `develop` for integration, `master` for releases. PRs target `develop`.

## License

MIT
