# SPA Setup Reference

## Minimal SPA Configuration

### 1. Install adapter-static

```bash
npm i -D @sveltejs/adapter-static
```

### 2. Configure svelte.config.js

```js
import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '200.html',
			precompress: false,
			strict: true
		})
	}
};
```

### 3. Set ssr = false in root layout

```ts
// src/routes/+layout.ts
export const ssr = false;
```

## Fallback Page by Host

| Host         | Fallback Name                 |
| ------------ | ----------------------------- |
| Surge        | `200.html`                    |
| Netlify      | `200.html` (via `_redirects`) |
| GitHub Pages | `404.html`                    |
| Apache       | `200.html` (via `.htaccess`)  |
| Nginx        | `200.html` (via `try_files`)  |
| Generic      | `index.html` (last resort)    |

## Netlify \_redirects

```
/* /200.html 200
```

Place in `static/_redirects`.

## Nginx Config

```nginx
location / {
  try_files $uri $uri/ /200.html;
}
```

## GitHub Pages

```js
// svelte.config.js
export default {
	kit: {
		paths: { base: '/repo-name' },
		adapter: adapter({ fallback: '404.html' })
	}
};
```

Add `static/.nojekyll` file.

## Precompression

```js
adapter({ precompress: true }); // generates .gz and .br files
```

Requires server config to serve compressed files.

## strict Mode

```js
adapter({ strict: true }); // fail build if not all routes prerenderable
adapter({ strict: false }); // allow non-prerendered routes (uses fallback)
```

SPA mode typically uses `strict: true` since fallback handles all routes.
