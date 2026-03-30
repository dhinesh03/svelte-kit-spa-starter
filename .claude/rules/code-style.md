# Code Style & Conventions

- **Svelte 5 runes** are enabled globally — use `$state`, `$derived`, `$effect` (not legacy `$:` or stores)
- **TypeScript strict mode** — all code must pass `npm run check`
- **File extensions**: `.svelte.ts` for rune-enabled modules, `.ts` for plain TypeScript
- **Import sorting**: ESLint enforces groups — svelte → types → externals → internals → relative
- **Path aliases**: `$lib` → `src/lib`, plus `components`, `ui`, `hooks`, `utils` aliases (see `components.json`)
- **Formatting**: Prettier with tabs, single quotes, 140 char width
- **Comments**: Use sparingly. Only comment complex, non-obvious code. Do not add routine comments, JSDoc, or section markers to straightforward code.

## Testing

- vitest with `requireAssertions: true` — every test must have at least one assertion
- Place tests as `*.test.ts` next to the source file being tested
- Prefer testing `.svelte.ts` logic directly over DOM-based component tests
