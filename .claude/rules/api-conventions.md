---
paths:
  - "src/lib/apis/**/*.ts"
  - "src/lib/services/**/*.ts"
---
# API Conventions

- All API functions return `CancellableRequest<T>` with `{ request: Promise<T>, cancel: () => void }`
- `FetchService` handles auth token injection, cancellation, timeouts, SSE, uploads
- Add new API modules under `src/lib/apis/<name>/` following the existing pattern (types.ts, CRUD functions, barrel index.ts)
