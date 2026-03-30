# Page Options Reference

## SPA Mode Essentials

### Root Layout for SPA

```ts
// src/routes/+layout.ts
export const ssr = false; // entire app is SPA
```

### Per-Page Prerendering Within SPA

```ts
// src/routes/about/+page.ts
export const prerender = true;
export const ssr = true; // MUST re-enable for prerendering
```

## Option Cascade

Options cascade from layouts to pages. Page options override layout options.

```ts
// src/routes/+layout.ts
export const ssr = false; // default for all pages

// src/routes/about/+page.ts
export const prerender = true;
export const ssr = true; // override for this page
```

## ssr Option

| Value            | Behavior                    |
| ---------------- | --------------------------- |
| `true` (default) | Server renders HTML         |
| `false`          | Empty shell, client JS only |

**GOTCHA**: If `ssr = false`, SvelteKit still imports the module on the server to evaluate options. Browser-only code at module top level will break.

## csr Option

| Value            | Behavior                                           |
| ---------------- | -------------------------------------------------- |
| `true` (default) | Client JS loaded, hydration                        |
| `false`          | No client JS at all. No HMR. Full-page navigation. |

`csr = false` + `ssr = false` = nothing renders.

## prerender Option

| Value    | Behavior                                 |
| -------- | ---------------------------------------- |
| `true`   | Page rendered at build time              |
| `false`  | Dynamic SSR only                         |
| `'auto'` | Both prerendered AND in dynamic manifest |

Rules:

- Cannot prerender pages with form actions
- `url.searchParams` forbidden during prerendering
- Use `entries()` for dynamic params

## trailingSlash Option

| Value               | URL behavior | File output        |
| ------------------- | ------------ | ------------------ |
| `'never'` (default) | `/about`     | `about.html`       |
| `'always'`          | `/about/`    | `about/index.html` |
| `'ignore'`          | Both work    | Both generated     |

**GOTCHA**: `'ignore'` harms SEO (duplicate content on two URLs).

## config Option

Adapter-specific config. Merged at top level only (not deep merge).

```ts
export const config = {
	runtime: 'edge' // adapter-specific
};
```
