---
paths:
  - 'src/routes/**/*.svelte'
  - 'src/routes/**/*.svelte.ts'
  - 'src/lib/apis/**/*.ts'
  - 'src/lib/services/**/*.ts'
  - 'src/lib/hooks/**/*.svelte.ts'
---

# API Conventions

- All API functions return `CancellableRequest<T>` with `{ request: Promise<T>, cancel: () => void }`
- `FetchService` handles auth token injection, cancellation, timeouts, SSE, uploads
- Add new API modules under `src/lib/apis/<name>/` following the existing pattern (types.ts, CRUD functions, barrel index.ts)

## Data Fetching Rules

- **All reactive data fetching (GETs)** MUST use `resource()` from `runed` as the reactive wrapper
- **All HTTP requests** MUST go through `FetchService` — never use raw `fetch()` directly
- **Mutations (POST/PUT/DELETE)** and SSE use `FetchService` directly without `resource()`
- Connect `resource()`'s abort signal to `CancellableRequest.cancel()` for proper cleanup

```ts
// Correct pattern: resource() + CancellableRequest
const items = resource(
	() => reactiveDep,
	async (dep, _prevDep, { signal }) => {
		const { request, cancel } = apiModule.getItems(dep);
		signal.addEventListener('abort', () => cancel('dependency changed'));
		const { data } = await request;
		return data;
	},
	{ initialValue: [] as Item[] }
);
```
