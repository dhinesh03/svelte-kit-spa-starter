# Orchestrator Wiki — Reference

## Grill Question Bank

Each question includes context for why it matters to the orchestrator. Questions are project-type-agnostic.

### Q1: Repo Role & Consumers

> From exploring the codebase, I can see this repo [consumes/exposes/processes] [N services/endpoints/pipelines]. What consumes FROM this repo?

**Why it matters**: The orchestrator needs to know the dependency graph direction. A pure consumer (leaf node) never receives issues as a dependency of another repo's task. A producer may need paired issues when its API/schema changes.

**Probe for**:
- **Frontend**: Other frontends embedding/iframing this one; shared component packages
- **Backend**: Frontend clients, other backend consumers, mobile apps, third-party integrations
- **Pipeline**: Downstream pipelines, APIs that serve processed data, dashboards, reports
- **Library**: All repos that import this package
- **Infra**: All services deployed on this infrastructure

### Q2: Task Categories

> For the orchestrator to correctly route tasks here, it needs to know the types of work that involve this repo.

**Why it matters**: The orchestrator matches task descriptions to repos. Missing a category means tasks get misrouted.

**Auto-detect from codebase based on project type, then present for validation:**

| Frontend | Backend API | Data Pipeline | Library | Infra |
|----------|-------------|---------------|---------|-------|
| UI/UX/styling | New endpoint | New pipeline/DAG | New public API | New resource |
| New route/page | Schema change | Source/connector change | Breaking change | Scaling change |
| Grid/table changes | Auth/middleware | Transformation logic | Bug fix | Security/IAM |
| Real-time features | Performance/caching | Scheduling change | Deprecation | Networking |
| State management | Integration (new service) | Data quality/validation | Docs/examples | Monitoring |
| Auth/access control | Database migration | Monitoring/alerting | Version bump | Cost optimization |
| Bug fix | Bug fix | Bug fix | | Disaster recovery |

**Ask**: "Are there categories I'm missing? Are there categories that SOUND like they'd involve this repo but actually need NO changes here (or vice versa)?"

### Q3: API/Data Contract

> Is there a shared contract or spec between this repo and its dependents/dependencies?

**Why it matters**: If no shared contract, the orchestrator must create paired issues when interfaces change.

**Probe by type**:
- **Frontend ↔ Backend**: OpenAPI/Swagger, GraphQL schema, shared types package, or manual sync?
- **Backend ↔ Backend**: gRPC proto files, OpenAPI, shared SDK, or ad-hoc?
- **Pipeline ↔ Consumers**: Avro/Protobuf schemas, JSON Schema, data catalog, or implicit?
- **Library ↔ Consumers**: Semver + changelog, or breaking changes discovered at build time?

### Q4: Deprecated Features

> I found code for [feature X]. Is this active or deprecated?

**Why it matters**: Deprecated features should be excluded to prevent routing tasks to dead code.

**Auto-detect candidates**: Unused exports, commented-out routes/endpoints/DAGs, TODO/FIXME/DEPRECATED markers, features with no entry point.

### Q5: Domain Glossary Verification

> Present extracted business terms with inferred meanings. Ask: "Is this glossary accurate? Any terms humans would use in task descriptions that I've missed?"

**Why it matters**: The orchestrator receives tasks in business language. The glossary translates human intent to code locations.

### Q6: Cross-Repo Dependency Matrix

> Present auto-detected matrix of task patterns vs whether this repo + other repos are affected.

**Why it matters**: This is the orchestrator's primary routing logic. A wrong entry means tasks get misrouted.

### Q7: Wiki Location

> Where should wiki.md live? Recommend repo root.

**Why it matters**: The orchestrator needs a consistent path across all repos.

---

## Wiki Template

Use this exact structure. Every section is mandatory. Mark inapplicable sections as "N/A — [reason]" rather than omitting them. Replace placeholders with actual data.

```markdown
# {repo-name} — Orchestrator Wiki

> This wiki is consumed by an orchestrator agent that receives ambiguous tasks and must determine which repositories are affected. It describes what this repo owns, what it depends on, and the signals that indicate a task involves this repo.

## Identity

- **Repo**: `{org}/{repo-name}`
- **Type**: {Frontend SPA | Backend API | Data Pipeline | Library/SDK | Infrastructure | Hybrid}
- **Role**: {Pure consumer (leaf node) | Producer + Consumer | Pure producer}
- **Domain**: {one-line domain description}
- **Stack**: {key technologies, language, framework}
- **Auth**: {auth mechanism, or "N/A"}
- **Real-time**: {real-time mechanism, or "N/A"}

## What This Repo Owns

This repo owns {scope description}. It is responsible for:

- {responsibility 1}
- {responsibility 2}
- ...

This repo does **NOT** own:

- {non-responsibility 1}
- {non-responsibility 2}
- ...

## Interfaces

{Describe contract situation: shared types, OpenAPI, Protobuf, manual sync, etc.}

### APIs/Services EXPOSED (if applicable)

{For backends: list every endpoint exposed with method, path, and purpose.}
{For libraries: list public API surface.}
{For pipelines: list output datasets/tables/topics.}
{For frontends: typically "N/A — pure consumer."}

| Method | Path / Interface | Purpose |
|--------|-----------------|---------|
| {GET/POST/...} | {path} | {purpose} |

### APIs/Services CONSUMED (if applicable)

{For frontends: all backend APIs called.}
{For backends: downstream services, databases, caches, queues.}
{For pipelines: data sources, ingestion points.}

| Service | Base URL / Connection | Purpose |
|---------|----------------------|---------|
| {name} | {url or connection string} | {purpose} |

### Events/Messages (if applicable)

{Kafka topics, SQS queues, GraphQL subscriptions, WebSocket channels, webhooks — both produced and consumed.}

| Direction | Channel / Topic | Payload | Purpose |
|-----------|----------------|---------|---------|
| {PRODUCE/CONSUME} | {topic/channel} | {schema ref or shape} | {purpose} |

### Endpoints Detail

{Group by domain. List every endpoint with method, path, and one-line description.}
{For backends: these are the routes this repo serves.}
{For frontends: these are the routes this repo calls.}

## Feature Areas

{Describe every major feature area. Adapt structure to project type:}
{- Frontend: routes, sub-routes, tabs}
{- Backend: modules, controllers, domain services}
{- Pipeline: DAGs, jobs, stages}
{- Library: public modules, feature groups}
{- Infra: resource groups, environments}

## Data Flow Patterns

{Describe key data flow patterns the orchestrator needs for task routing.}
{Focus on patterns where a task in this repo implies work in another repo.}

## Cross-Repo Dependency Matrix

When the orchestrator receives a task, use this matrix to determine if this repo is affected and whether changes in other repos are also needed.

| Task Pattern | This Repo Affected? | Other Repo Change Needed? | Why |
|---|---|---|---|
| {pattern} | YES/NO | YES/NO/MAYBE | {reason} |

## Domain Glossary

Terms humans use in task descriptions. The orchestrator maps these to the correct feature area.

| Term | Meaning | Maps to |
|------|---------|---------|
| {term} | {meaning} | {feature area or module} |

## Issue Format

When creating issues for this repo, the orchestrator should use this format:

\```
Title: <concise description of the change>

## Task
<What needs to be done and why>

## Feature Area
<Which module/feature is affected — use names from the Feature Areas section>

## Cross-Repo Dependencies
<"None" OR link to issues in other repos that must be completed first or in parallel>

## Acceptance Criteria
- [ ] <verifiable criterion 1>
- [ ] <verifiable criterion 2>
- [ ] <project-specific checks, e.g. "tests pass", "build succeeds", "migration runs cleanly">
\```

The implementing agent has full access to the codebase and will determine the specific files and modules to modify. Do not include code-level implementation details in the issue.

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| {layer} | {technology} |

## Architecture Pattern (if applicable)

{Describe the key architectural pattern so the orchestrator understands structural constraints:}
{- Frontend: state management, data fetching strategy}
{- Backend: layered architecture, DDD, microservice boundaries}
{- Pipeline: batch vs stream, orchestration pattern, idempotency}
{- Library: module structure, extension points}

## External Links (if applicable)

| Resource | Dev URL | Prod URL |
|----------|---------|----------|
| {name} | {url} | {url} |
```

---

## Update Mode Checklist

When updating an existing wiki, check for changes since last update:

**Universal:**
- [ ] New feature areas or modules added
- [ ] Features removed or deprecated
- [ ] New external service dependencies
- [ ] Dependency manifest changes (major versions)
- [ ] New domain terms used in recent PRs/issues
- [ ] Changes to auth/authz flow
- [ ] New data flow patterns
- [ ] Cross-repo dependency matrix still accurate

**Frontend:**
- [ ] New routes or sub-routes
- [ ] New API endpoints consumed
- [ ] New or removed real-time subscriptions

**Backend API:**
- [ ] New endpoints exposed
- [ ] Endpoint contracts changed (request/response shape)
- [ ] New database tables or migrations
- [ ] New downstream service integrations
- [ ] New events produced or consumed

**Data Pipeline:**
- [ ] New DAGs, jobs, or pipeline stages
- [ ] New data sources or sinks
- [ ] Schema changes in input/output data
- [ ] Schedule changes

**Library/SDK:**
- [ ] Public API surface changes
- [ ] Breaking changes introduced
- [ ] New consumers

**Infrastructure:**
- [ ] New resources provisioned
- [ ] Environment changes
- [ ] Security/IAM changes
