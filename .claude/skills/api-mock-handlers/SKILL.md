---
name: api-mock-handlers
description: "Use when adding a new API module under src/lib/apis/* or modifying endpoints/types in an existing one. Mandates a matching MSW handler in src/lib/mocks/handlers/ backed by domain-meaningful faker data (not random lorem). Covers seed determinism, FK consistency, semantic faker namespaces, error paths, and registration in the handlers barrel."
---

# API Mock Handlers (MSW + Faker)

Every API module under `src/lib/apis/<name>/` MUST have a corresponding MSW handler at `src/lib/mocks/handlers/<name>.ts`. When endpoints, params, or response types change, update the handler in the **same change**.

## Trigger

| Change                                     | Required mock action                                       |
| ------------------------------------------ | ---------------------------------------------------------- |
| New `src/lib/apis/<name>/` module          | Create `src/lib/mocks/handlers/<name>.ts` and register it  |
| New endpoint added (CRUD function)         | Add matching `http.<verb>(...)` handler                    |
| Type change in `<name>/types.ts`           | Regenerate fixture(s) so shape stays in sync               |
| New params (query, path) added             | Handler must read & filter on those params                 |
| Endpoint deleted                           | Delete handler entry                                       |

## Mocks must be MEANINGFUL, not random

Map each field to the **most semantic** faker namespace. Treat `lorem.*` and bare random strings as last-resort fallbacks.

| Field semantic            | Use                                                  | Don't use                |
| ------------------------- | ---------------------------------------------------- | ------------------------ |
| Person name               | `faker.person.fullName()`, `firstName`, `lastName`   | `lorem.words`            |
| Email                     | `faker.internet.email({ firstName, lastName })`      | `lorem.word + '@x.com'`  |
| Username / handle         | `faker.internet.username({ firstName, lastName })`   | random chars             |
| Phone                     | `faker.phone.number()`                               | random digits            |
| Address                   | `faker.location.{street,city,zipCode,country}`       | lorem                    |
| Company / org             | `faker.company.{name,catchPhrase,buzzPhrase}`        | lorem                    |
| Money / price             | `faker.commerce.price({ min, max, dec })` as number  | `number.float`           |
| Product                   | `faker.commerce.{productName,department,material}`   | lorem                    |
| Currency code             | `faker.finance.currencyCode()`                       | hardcoded 'USD'          |
| Account / IBAN / BIC      | `faker.finance.{accountNumber,iban,bic}`             | random digits            |
| Past / future date        | `faker.date.{past,future,recent,soon}` → `.toISOString()` | `Date.now() - random` |
| URL / domain              | `faker.internet.{url,domainName}`                    | hardcoded                |
| UUID                      | `faker.string.uuid()`                                | `Math.random()`          |
| Boolean flag              | `faker.datatype.boolean({ probability })`            | always `true`            |
| Free-text description     | `faker.lorem.paragraph()` (acceptable fallback)      | —                        |
| Domain term (vessel, port, fuel grade, etc.) | `faker.helpers.arrayElement([...domain values])` | lorem |

**Rule of thumb:** if the field name suggests a real-world concept (port, vessel, grade, counterparty, trade, instrument), use `faker.helpers.arrayElement` over a curated domain list — never `lorem`.

## Required structure for a handler file

```ts
// src/lib/mocks/handlers/<name>.ts
import type { Foo, Bar } from '$lib/apis/<name>/types';

import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.example.com';

faker.seed(42); // deterministic — required so tests are stable

// 1. Generate parents first so children can reference real foreign keys
const foos: Foo[] = Array.from({ length: 5 }, (_, i) => ({
	id: i + 1,
	name: faker.person.fullName(),
	createdAt: faker.date.past({ years: 1 }).toISOString()
	// ...
}));

// 2. Children reference parent IDs via faker.helpers.arrayElement
const bars: Bar[] = Array.from({ length: 12 }, (_, i) => ({
	id: i + 1,
	fooId: faker.helpers.arrayElement(foos).id,
	amount: Number(faker.commerce.price({ min: 100, max: 10_000, dec: 2 }))
}));

export const <name>Handlers = [
	http.get(`${BASE}/foos`, ({ request }) => {
		const url = new URL(request.url);
		const status = url.searchParams.get('status');
		const filtered = status ? foos.filter((f) => f.status === status) : foos;
		return HttpResponse.json(filtered);
	}),

	http.get(`${BASE}/foos/:id`, ({ params }) => {
		const foo = foos.find((f) => f.id === Number(params.id));
		return foo ? HttpResponse.json(foo) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
	}),

	http.post(`${BASE}/foos`, async ({ request }) => {
		const body = (await request.json()) as Omit<Foo, 'id'>;
		const created: Foo = { ...body, id: foos.length + 1 };
		return HttpResponse.json(created, { status: 201 });
	}),

	http.patch(`${BASE}/foos/:id`, async ({ params, request }) => {
		const patch = (await request.json()) as Partial<Foo>;
		const existing = foos.find((f) => f.id === Number(params.id));
		if (!existing) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
		return HttpResponse.json({ ...existing, ...patch });
	}),

	http.delete(`${BASE}/foos/:id`, () => new HttpResponse(null, { status: 200 }))
];
```

## Required: register the handler

After creating `<name>.ts`, add it to the barrel:

```ts
// src/lib/mocks/handlers/index.ts
import { <name>Handlers } from './<name>';
// ...
export const handlers = [...<name>Handlers, /* others */];
```

If a handler is not exported from `index.ts`, MSW will not intercept it.

## Rules

1. **One handler file per API module.** File name mirrors the API directory (`apis/orders/` → `mocks/handlers/orders.ts`).
2. **Cover every exported CRUD function.** Missing endpoints fall through to the real network in dev and `error` in tests.
3. **Use the API's actual types** from `$lib/apis/<name>/types` — never redeclare them in the handler.
4. **Seed faker.** `faker.seed(<integer>)` at module top — required for stable tests.
5. **Foreign keys must reference real fixture IDs.** Use `faker.helpers.arrayElement(parents).id`.
6. **Filter on params.** If the API supports `?status=`, `?userId=`, etc., the handler must implement filtering.
7. **Mirror error shapes.** 404/400/500 responses should match the real API's error envelope.
8. **No `lorem.*` for domain fields.** Pick a semantic faker namespace or a curated `arrayElement` list.
9. **Never hit the real backend in tests.** `vitest-setup.ts` uses `onUnhandledRequest: 'error'` — keep it that way.

## Quick checklist (before commit)

- [ ] Handler file exists at `src/lib/mocks/handlers/<name>.ts`
- [ ] All CRUD functions in `apis/<name>/` have a matching `http.<verb>(...)` handler
- [ ] `faker.seed(...)` is set
- [ ] Field-by-field: each fixture value uses a semantic faker call (no `lorem` for non-text fields)
- [ ] FKs resolve to real IDs in the parent fixture array
- [ ] Handler is exported from `src/lib/mocks/handlers/index.ts`
- [ ] `npm run dev:mock` and `npm test` both pass

## Common mistakes

| Mistake                                            | Fix                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| `name: faker.lorem.word()`                         | `name: faker.person.fullName()` (or domain-specific)             |
| `userId: faker.number.int()` (no parent)           | `userId: faker.helpers.arrayElement(users).id`                   |
| New endpoint shipped without handler               | Add handler in same PR — test will fail with `onUnhandledRequest: 'error'` |
| Forgetting `faker.seed(...)`                       | Adds non-determinism; tests become flaky                         |
| Re-declaring response type in handler              | Import from `$lib/apis/<name>/types`                             |
| Hardcoded base URL                                 | Use `import.meta.env.VITE_API_BASE_URL` (or the API's BASE const) |
| Returning `200` for missing resource               | Return `404` with `{ message: '...' }` matching real error shape |

## Reference example

`src/lib/mocks/handlers/json-placeholder.ts` is the canonical reference — read it before adding a new handler.
