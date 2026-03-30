# File Conventions Reference

## Route File Priority

1. `+page.svelte` — the page component (required for a route to render)
2. `+page.ts` — universal load function
3. `+page.server.ts` — server-only load + form actions (NOT in SPA)
4. `+layout.svelte` — layout wrapper (MUST render `{@render children()}`)
5. `+layout.ts` — universal layout load
6. `+layout.server.ts` — server-only layout load (NOT in SPA)
7. `+error.svelte` — error boundary for this route and children
8. `+server.ts` — standalone API endpoint (NOT in SPA)

## .svelte.ts Files in Routes

- `stores/` directory convention for route-specific state
- Class-based state with context API pattern
- Must use `.svelte.ts` extension for runes

## Colocated Files

Any file without `+` prefix is ignored by SvelteKit:

```
src/routes/dashboard/
  +page.svelte          ← route file
  +page.ts              ← route file
  DashboardChart.svelte ← ignored by router, available for import
  utils.ts              ← ignored by router
```
