---
name: codify-instruction
description: Transform ad-hoc developer instructions into properly formatted, LLM-readable rules saved to CLAUDE.local.md or .claude/rules/project-rules.md. Use when a developer gives a valuable convention, constraint, or architectural decision that should be shared across all collaborators and AI agents working on the project.
---

# Codify Instruction

Transform informal developer instructions into structured, shareable project rules.

## When to Use

- Developer states a convention: "always use X for Y", "never do Z"
- Code review reveals a pattern that should be enforced project-wide
- Team agrees on an architectural decision worth codifying

## When NOT to Use

- **Personal preference** (one developer's style) → save as auto-memory instead
- **One-time task** ("fix this bug") → not a rule, just do it
- **Already documented** in existing rules or CLAUDE.md → no action needed

## Protected Files (Do NOT Modify)

The following files are managed by `@hartreepartners/claude-setup` and will be **overwritten on update**. NEVER add, edit, or remove content from these files:

- `CLAUDE.md`
- `.claude/rules/code-style.md`
- `.claude/rules/state-management.md`
- `.claude/rules/api-conventions.md`
- `.claude/rules/component-conventions.md`
- `.claude/rules/coding-guidelines.md`

## Workflow

### Step 1 — Classify Destination

| Does the instruction...                                                       | Save to                                                          |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Describe project structure, commands, onboarding, or team workflows?          | `CLAUDE.local.md` (under the appropriate section)                |
| Apply as a coding convention, architectural pattern, or domain-specific rule? | `.claude/rules/project-rules.md` (under the appropriate section) |

### Step 2 — Check Existing Rules (Read-Only)

1. **Read** `CLAUDE.md` and all `.claude/rules/*.md` files to understand existing conventions
2. **Read** `CLAUDE.local.md` and `.claude/rules/project-rules.md` to check for duplicates
3. If the instruction **duplicates** an existing rule, inform the developer — do NOT add it again
4. If the instruction **contradicts** a managed rule, inform the developer and let them decide whether to add an override in the owned file

> **Important**: This step is read-only. Never modify managed files.

### Step 3 — Transform to LLM-Optimized Format

- Write as direct commands: "Use X", "Do NOT Y", "All Z MUST..."
- Be specific — name the exact file, function, or pattern
- Include "why" only when it prevents a common mistake
- Use bold for key terms: **FetchService**, **resource()**
- Use tables for decision matrices, code blocks for replicable patterns
- Inline anti-patterns with "Do NOT" near the related rule (no separate section)

### Step 4 — Confirm with Developer

Before saving, show the developer:

1. **Where**: which owned file and section the rule will be added to
2. **What**: the exact formatted text to be inserted
3. Wait for approval before writing

### Step 5 — Save to Owned File

- Append the rule to the appropriate section in the target owned file
- Maintain existing structure and section headings
- Verify total rule file stays under 120 lines — if exceeded, advise the developer to reorganize or archive older rules

## Examples

**Input:** "Whenever we add a new API module, always include a types.ts"

**Action:** Append to `.claude/rules/project-rules.md` → "Domain-Specific Patterns":

```markdown
- Every API module MUST contain `types.ts` with response/request types — export from barrel `index.ts`
```

**Input:** "Dark mode should use `.dark` class, not `prefers-color-scheme`"

**Action:** Append to `.claude/rules/project-rules.md` → "General Conventions":

```markdown
- Use `.dark` class selector for dark mode — do NOT use `prefers-color-scheme` (mode-watcher controls the class)
```

**Input:** "Always run check before committing"

**Action:** Append to `CLAUDE.local.md` → "Lessons Learned":

```markdown
- **Pre-commit**: Run `npm run check` before every commit to catch type errors early
```
