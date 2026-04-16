---
paths:
  - 'src/routes/**/*.svelte'
  - 'src/routes/**/*.svelte.ts'
  - 'src/lib/apis/**/*.ts'
  - 'src/lib/services/**/*.ts'
  - 'src/lib/services/**/*.svelte.ts'
  - 'src/lib/hooks/**/*.svelte.ts'
---

# API Conventions

## Architecture

```
resource() → fetchData() → API module → FetchService(+auth) → fetch()
```

- **FetchService** instances are configured with auth in `api-service.ts` — API modules and callers never handle auth directly
- All API functions return `CancellableRequest<T>` with `{ request: Promise<RequestResult<T>>, cancel: () => void }` where `RequestResult<T>` = `{ data: T, response: Response }`
- For GETs: use `fetchData()` with `resource()` — it auto-unwraps to `T`
- For mutations: destructure `{ data }` from `await cancellableReq.request`
- API functions accept an optional `signal?: AbortSignal` parameter for cancellation
- SSE connections use the standalone `createSSEConnection()` from `$lib/services/fetch`
- Import `FetchService`, `fetchData`, API instances, and types from `$lib/services/fetch` (barrel)

## API Service Instances (api-service.ts)

Each backend gets a pre-configured `FetchService` with auth and base URL:

```ts
// src/lib/services/fetch/api-service.ts
import { FetchService } from './fetch-service';

// Enterprise: configure with auth token
export const internalApi = new FetchService({
	baseUrl: import.meta.env.VITE_API_BASE_URL,
	getAuthToken: () => authService.getAccessToken().then((t) => t || null)
});
```

## API Module Pattern

Add new API modules under `src/lib/apis/<name>/` with types.ts, CRUD functions, barrel index.ts:

```ts
// src/lib/apis/orders/orders.ts
import type { CancellableRequest } from '$lib/services/fetch';
import { internalApi } from '$lib/services/fetch';
import type { Order } from './types';

export function getOrders(params?: { status?: string }, signal?: AbortSignal): CancellableRequest<Order[]> {
	return internalApi.get<Order[]>('/orders', { params, signal });
}
```

## Data Fetching Rules

- **All reactive data fetching (GETs)** MUST use `resource()` from `runed` as the reactive wrapper
- **All HTTP requests** MUST go through `FetchService` — never use raw `fetch()` directly
- **Mutations (POST/PUT/DELETE)** use `FetchService` directly without `resource()`
- Use `fetchData()` to bridge `CancellableRequest` with `resource()`'s abort signal

```ts
import { resource } from 'runed';
import { fetchData } from '$lib/services/fetch';
import { getOrders, type Order } from '$lib/apis/orders';

const orders = resource(
	() => statusFilter,
	async (status, _prev, { signal }) => fetchData((s) => getOrders({ status }, s), signal),
	{ initialValue: [] as Order[] }
);
```

## Mutations (POST/PUT/DELETE)

Mutations use the API function directly — no `resource()` or `fetchData()`:

```ts
import { createOrder, updateOrder, deleteOrder } from '$lib/apis/orders';

async function handleCreate() {
	const { data: newOrder } = await createOrder({ name: 'New' }).request;
	// use newOrder...
}

async function handleDelete(id: number) {
	await deleteOrder(id).request;
	// refresh relevant resource or update local state
}
```

## Resource Error Handling in Templates

Use `resource.loading`, `resource.error`, and `resource.current` consistently:

```svelte
{#if resource.loading}
	<!-- Skeleton placeholders appropriate to the content shape -->
{:else if resource.error}
	<p class="text-sm text-destructive">{resource.error.message}</p>
{:else}
	<!-- Render resource.current -->
{/if}
```

- Loading skeletons should match the shape of the expected content
- Error messages use `text-sm text-destructive` consistently
- Prefix error text with context when helpful: `"Failed to load X: {error.message}"`
