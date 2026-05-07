---
name: orchestrator-wiki
description: Generate or update a wiki.md for an orchestrator agent that routes ambiguous tasks to the correct repos and creates GitHub issues. Works for any project type — frontend, backend API, data pipeline, library, infra. Use when the user says "create wiki", "update wiki", "orchestrator wiki", "wiki.md", or needs to document a repo for cross-repo task routing.
---

# Orchestrator Wiki

Generate or update `/wiki.md` — a structured document consumed by an orchestrator agent that receives ambiguous tasks, determines which repos are affected, and creates targeted GitHub issues.

## Mode Detection

- If `/wiki.md` exists at repo root → **Update mode**
- If no `/wiki.md` exists → **Create mode**

## Workflow

### Phase 1 — DETECT PROJECT TYPE

Before exploring, determine the repo type by checking for:

| Indicator                                                        | Project Type                 |
| ---------------------------------------------------------------- | ---------------------------- |
| `.svelte`, `.tsx`, `.vue`, `angular.json`                        | Frontend                     |
| `Dockerfile` + API framework (Flask, Express, Spring, FastAPI)   | Backend API                  |
| `dags/`, Airflow/Prefect/Dagster config, Spark jobs              | Data Pipeline                |
| Published to package registry, `exports` in package.json, `lib/` | Library/SDK                  |
| Terraform, CloudFormation, Pulumi, Helm charts                   | Infrastructure               |
| Multiple types present                                           | Hybrid — document all facets |

### Phase 2 — EXPLORE (automated, no user input needed)

Use the Explore agent to deep-scan the codebase. Extract items relevant to the detected project type:

**Universal (all project types):**

1. Git remote URL for repo identification
2. Dependency manifest (package.json, pyproject.toml, go.mod, pom.xml, Cargo.toml, etc.)
3. Available scripts/commands (build, test, lint, deploy)
4. All external service dependencies (databases, cloud services, auth providers, message brokers)
5. All environment variables and environment detection logic
6. Authentication/authorization mechanism
7. External app links and integrations

**Frontend-specific:** 8. All API endpoints CONSUMED (URLs, base paths, service clients) 9. Route modules, sub-routes, tabs, and their purposes 10. Real-time data channels (WebSocket, SSE, GraphQL subscriptions) 11. State management patterns

**Backend API-specific:** 8. All API endpoints EXPOSED (routes, controllers, handlers) with methods and paths 9. All downstream services CONSUMED (other APIs, databases, caches, queues) 10. Events/messages PRODUCED (Kafka topics, SQS queues, SNS topics, webhooks) 11. Events/messages CONSUMED (subscriptions, listeners, consumers) 12. Database schemas or migrations

**Data Pipeline-specific:** 8. Pipeline definitions (DAGs, jobs, stages, tasks) 9. Data sources (ingestion points, connectors, file formats) 10. Data sinks (output destinations, warehouses, APIs fed) 11. Scheduling (cron, triggers, dependencies between pipelines) 12. Data schemas or contracts (Avro, Protobuf, JSON Schema)

**Library/SDK-specific:** 8. Public API surface (exported functions, classes, types) 9. Consumers of this library (which repos depend on it) 10. Versioning and release strategy 11. Breaking change history

**Infrastructure-specific:** 8. Resources managed (compute, storage, networking, IAM) 9. Environments provisioned (dev, staging, prod) 10. Services this infra supports (which repos deploy onto it)

### Phase 3 — GRILL (interview the user, one question at a time)

Ask each question sequentially. For each, provide your recommended answer based on Phase 2 findings. Skip questions answerable from the codebase.

See [REFERENCE.md](REFERENCE.md) for the full question bank and wiki template.

**Required questions (always ask):**

1. **Repo role** — Is this a producer, consumer, or both? What consumes from it, and what does it consume?
2. **Task categories** — What types of work involve this repo? Validate the auto-detected list
3. **API/data contract** — Is there a shared contract with dependent repos, or manual sync?
4. **Deprecated features** — Any features in the codebase that are deprecated and should be excluded?
5. **Domain glossary verification** — Present extracted terms, ask for corrections/additions

**Conditional questions (ask only if not answerable from codebase):** 6. **Cross-repo dependency signals** — Present auto-detected matrix, ask for corrections 7. **Wiki location** — Confirm repo root (`/wiki.md`) or alternate location

### Phase 4 — GENERATE

Write `/wiki.md` using the template in [REFERENCE.md](REFERENCE.md). Include only sections relevant to the detected project type. Mark inapplicable sections as "N/A" rather than omitting them, so the orchestrator knows they were considered.

### Phase 5 — UPDATE MODE (if wiki already exists)

1. Read existing `/wiki.md`
2. Run Phase 1-2 (detect + explore)
3. Diff what changed (new endpoints, new modules, removed features, new dependencies)
4. Present changes to user for confirmation
5. Update the file preserving user-confirmed content from previous grill sessions
