# Project Rules

<!-- This file is OWNED by your project — claude-setup will never overwrite it. -->
<!-- Use /codify-instruction to add rules here, or edit manually. -->

## General Conventions

<!-- Project-wide coding conventions, naming patterns, and architectural decisions -->

## Domain-Specific Patterns

<!-- Rules scoped to specific areas: API modules, components, state management, etc. -->

### API Mock Handlers (MSW + Faker)

When adding or updating any API module under `src/lib/apis/<name>/`, the matching MSW handler at `src/lib/mocks/handlers/<name>.ts` MUST be created or updated in the same change.

- Every CRUD function exported from `apis/<name>/` must have a matching `http.<verb>(...)` handler.
- Mock data MUST use `@faker-js/faker` and MUST be **semantically meaningful** — pick the most specific faker namespace for each field (`faker.person.fullName()`, `faker.commerce.price()`, `faker.location.city()`, etc.). `faker.lorem.*` is allowed only for free-text body/description fields.
- Always call `faker.seed(<integer>)` at module top for deterministic test fixtures.
- Foreign keys must reference real IDs from a parent fixture array via `faker.helpers.arrayElement(parents).id` — never standalone random ints.
- Import response types from `$lib/apis/<name>/types`; never redeclare them in the handler.
- Register the handler in `src/lib/mocks/handlers/index.ts` (otherwise MSW won't intercept).
- For domain-specific enumerable values (vessel types, fuel grades, ports, counterparties, etc.) use `faker.helpers.arrayElement([...])` with a curated list — not lorem.

Reference: `.claude/skills/api-mock-handlers/SKILL.md` and the canonical example at `src/lib/mocks/handlers/json-placeholder.ts`.
