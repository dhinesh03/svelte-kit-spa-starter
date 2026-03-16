# SvelteKit SPA Starter

A minimal SvelteKit Single Page Application starter template with TypeScript, Tailwind CSS v4, and essential tooling pre-configured.

## Tech Stack

- **SvelteKit** (static adapter, SPA mode)
- **Svelte 5** (runes enabled)
- **TypeScript**
- **Tailwind CSS v4** (with typography & forms plugins)
- **Bits UI** — headless component library
- **AG Grid** — data grid
- **Fuse.js** — fuzzy search
- **Vitest** — unit testing
- **ESLint + Prettier** — linting & formatting

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

Open [http://localhost:5173](http://localhost:5173) in your browser.

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

| Script              | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start dev server              |
| `npm run build`     | Build for production          |
| `npm run preview`   | Preview production build      |
| `npm run check`     | Run svelte-check              |
| `npm run lint`      | Check formatting & linting    |
| `npm run lint:fix`  | Auto-fix formatting & linting |
| `npm run format`    | Format with Prettier          |
| `npm run test`      | Run unit tests                |
| `npm run test:unit` | Run unit tests in watch mode  |

## Project Structure

```
src/
├── lib/          # Shared components, utilities, and stores
├── routes/       # SvelteKit file-based routing
└── app.html      # HTML template
static/           # Static assets
```

## License

MIT
