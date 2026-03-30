# $env Modules Reference

## Available in SPA

### $env/static/public

```ts
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
```

- Injected at **build time** — enables dead code elimination
- Must have `PUBLIC_` prefix (configurable via `config.kit.env.publicPrefix`)
- Values are frozen after build

### $env/dynamic/public

```ts
import { env } from '$env/dynamic/public';
console.log(env.PUBLIC_API_URL);
```

- Read from `process.env` at **runtime**
- In dev: includes `.env` values
- In production: depends on adapter

## NOT Available in SPA

### $env/static/private

```ts
// CANNOT import in SPA mode — server-only
import { DATABASE_URL } from '$env/static/private';
```

### $env/dynamic/private

```ts
// CANNOT import in SPA mode — server-only
import { env } from '$env/dynamic/private';
```

## .env File Setup

```env
# .env
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_NAME=My App

# These only work with SSR, not in SPA:
DATABASE_URL=postgres://...
SECRET_KEY=abc123
```

## TypeScript Types

Declare in `src/app.d.ts` or `.env` for auto-generated types:

```ts
// Types are auto-generated in .svelte-kit/ambient.d.ts
// Just declare vars in .env (even empty) for correct types
```

## Best Practices for SPA

1. Use `$env/static/public` for API URLs, feature flags
2. Never put secrets in `PUBLIC_` vars — they're in client bundle
3. Use `$env/dynamic/public` when values must change without rebuild
4. For secrets in SPA: use a backend API as proxy
