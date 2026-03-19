# SvelteKit SPA Starter

A feature-rich SvelteKit Single Page Application starter template with TypeScript, Tailwind CSS v4, Azure AD authentication, and 40+ pre-built UI components.

## Tech Stack

| Category          | Technology                                         |
| ----------------- | -------------------------------------------------- |
| Framework         | SvelteKit 2 (static adapter, SPA mode)             |
| Language          | Svelte 5 (runes) + TypeScript (strict)             |
| Styling           | Tailwind CSS v4, tw-animate-css, tailwind-variants |
| UI Components     | Bits UI (40+ headless components), Lucide icons    |
| Authentication    | Azure AD / MSAL                                    |
| Data Grid         | AG Grid Community                                  |
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
│   ├── apis/                    # API wrappers with cancellable requests
│   │   └── json-placeholder/    # Example: JSONPlaceholder CRUD (posts, users, todos)
│   ├── components/
│   │   ├── ui/                  # 40+ Bits UI components (accordion, button,
│   │   │                        #   card, dialog, tabs, sidebar, etc.)
│   │   ├── combobox/            # Searchable dropdown (single/multi, grouped,
│   │   │                        #   virtual scrolling, fuzzy search)
│   │   ├── sortable-list/       # Drag-and-drop reorderable list
│   │   ├── ThemeSwitcher.svelte # Dark/light mode toggle
│   │   └── UnderConstruction.svelte
│   ├── features/
│   │   ├── ag-grid/             # AG Grid setup with Quartz theme
│   │   └── transition.ts        # Crossfade animation utilities
│   ├── hooks/
│   │   └── is-mobile.svelte.ts  # Responsive breakpoint detection (768px)
│   ├── services/
│   │   ├── auth-service.ts      # Azure AD/MSAL singleton (login, tokens, SSO)
│   │   ├── fetch-service.ts     # HTTP client (cancellation, uploads, SSE, auth)
│   │   ├── api-service.ts       # Pre-configured FetchService instances
│   │   └── navigation-client.ts # MSAL + SvelteKit router integration
│   ├── helpers.ts               # Debounce utility
│   └── utils.ts                 # cn() — clsx + tailwind-merge
├── routes/
│   ├── +layout.svelte           # Root layout (theme switcher, toaster)
│   ├── +layout.ts               # SPA config (ssr=false, csr=true)
│   ├── +error.svelte            # Error page (404, 403, 500)
│   ├── layout.css               # Global styles, CSS variables, dark mode
│   └── showcase/
│       ├── +page.svelte         # Component demos (ComboBox, SortableList)
│       └── api/
│           └── +page.svelte     # API integration demo with JSONPlaceholder
├── app.html                     # HTML template
└── app.d.ts                     # Global type declarations
static/                          # Static assets
```

## Key Features

### Authentication (Azure AD / MSAL)

Singleton `AuthService` with full Azure AD integration:

- Login/logout with popup or redirect
- Silent SSO and token refresh
- Multi-account switching
- Configurable storage (localStorage, sessionStorage, memoryStorage)
- Event-driven callbacks for auth state changes
- `withAuth()` wrapper for authenticated API calls

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
- **ThemeSwitcher** — Dark/light mode toggle via `mode-watcher`

### Theming

- Dark/light mode with CSS custom properties (OKLch color space)
- Tailwind CSS v4 with `@tailwindcss/forms` and `@tailwindcss/typography`
- Inter variable font
- Built-in animations via `tw-animate-css`

### State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- `runed` library's `resource()` for reactive data fetching with dependency tracking
- No centralized store — state is co-located with components

## License

MIT
