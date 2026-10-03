---
name: prodready-implement
description: "Use after the ProdReady scaffold gate passes to implement backlog tasks test-first, map acceptance criteria to assertions, update task status, and commit per TASK-XXX."
---

# ProdReady Implement Skill

References to slash commands mean use the corresponding `prodready-*` skill.


Implement code according to the plan and specification.

**Estimated time**: Varies by project complexity

**Prerequisites**: Complete `prodready-scaffold` and pass `prodready-gate scaffold`

## Instructions

Execute the implementation plan task by task, following test-first development.

### Development Environment

Implementation should run inside the Docker container created during Scaffold phase.
Use `make dev` or `docker compose up` to start the environment before coding.

### Prerequisites Check

1. Verify `.prodready/plan/backlog.md` exists with tasks
2. Verify `.prodready/define/test-scenarios/*.feature` exists
3. Verify `.prodready/design/api/openapi.yaml` exists
4. Verify `.prodready/implement/handovers/` exists or create it before the first implementation task

---

## Implementation Flow

```
┌────────────────────────────────────────────────────────────┐
│                  IMPLEMENTATION LOOP                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. Read backlog.md → Find next "Ready" task               │
│                                                            │
│  2. For each TASK-XXX:                                     │
│     ┌──────────────────────────────────────────┐          │
│     │ a. Read acceptance criteria               │          │
│     │ b. Find related .feature scenario         │          │
│     │ c. MAP each AC to one canonical test      │  ← KEY  │
│     │ d. Write canonical tests (RED)            │          │
│     │ e. Implement code (GREEN)                 │          │
│     │ f. Refactor if needed                     │          │
│     │ g. Run lint + types                       │          │
│     │ h. Commit: "feat: TASK-XXX - [desc]"     │          │
│     │ i. Update task status in backlog.md      │          │
│     │ j. Write task handoff capsule            │          │
│     │ k. Check context before next task        │          │
│     └──────────────────────────────────────────┘          │
│                                                            │
│  3. Repeat until all tasks Done                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Step 1: Read the Plan

Load and parse:
- `.prodready/plan/backlog.md` - Task list
- `.prodready/plan/dependencies.mmd` - Task order
- `.prodready/plan/test-plan.md` - Testing strategy

Identify the first task with:
- Status: Ready
- Blocked by: None (or all blockers are Done)

---

## Step 2: Task Execution

For each task, follow this process:

### 2.1 Understand the Task

Read from backlog.md:
```markdown
### TASK-XXX: [Title]
**Priority**: P0 | **Estimate**: 2h | **Status**: Ready

**Description**: [What to do]

**Acceptance Criteria**:
AC-1: Criterion 1
AC-2: Criterion 2
```

### 2.2 Map Acceptance Criteria to Canonical Tests

This is the critical step. Do NOT write tests generically. Follow this exact process:

#### a. Find Related Feature File

Search `.prodready/define/test-scenarios/*.feature` for scenarios related to this task.
If no direct `.feature` match, use the task's acceptance criteria directly.

#### b. Extract Acceptance Criteria

From the task in `backlog.md`, list every acceptance criterion:
```
AC-1: Given [context], when [action], then [result]
AC-2: ...
```

Each criterion must be single, observable, and measurable. If one criterion needs multiple canonical acceptance tests, split the criterion in the spec/backlog before implementation.

#### c. Map Each Criterion to One Canonical Acceptance Test

For EACH acceptance criterion, define exactly one canonical acceptance test:

| AC | Canonical Test Type | Canonical Test Name | Key Assertion |
|----|---------------------|---------------------|---------------|
| AC-1 | integration | `AC-1: creates resource with valid data` | `expect(result).toMatchObject(expected)` |
| AC-2 | integration | `AC-2: returns 409 for duplicate email` | `expect(response.status).toBe(409)` |
| AC-3 | unit | `AC-3: rejects missing required name` | `expect(() => fn()).toThrow('message')` |

**Rules for mapping**:
- Each acceptance criterion has exactly one canonical acceptance test.
- The canonical test name must start with `AC-N: `.
- Skipped, pending, and todo tests do not count.
- Additional technical tests are allowed, but they must not use the `AC-N: ` prefix.
- If an AC has multiple behaviors or "and" clauses that require multiple canonical tests, split the AC before coding.

#### d. Document the Mapping

Before writing any code, output the mapping table so it is visible and reviewable.
This prevents "write a test" from becoming a vague, unhelpful step.

### 2.3 Write Canonical Tests from Mapping (RED)

NOW write the tests, following the mapping from 2.2.

For each row in the mapping table:
1. Create exactly one canonical test whose name starts with `AC-N: `
2. Write the assertion FIRST (what you expect)
3. Write the setup (arrange) to make the assertion meaningful
4. Write the action (act) that triggers the behavior

**Canonical test naming convention**: `it('AC-N: [criterion text or concise equivalent]')`

Map test names back to acceptance criteria:
```
// AC-1: Given valid data, when creating resource, then resource is created
it('AC-1: creates resource when given valid data', async () => { ... })

// AC-2: Given duplicate email, when registering, then return 409
it('AC-2: returns 409 when email already exists', async () => { ... })
```

> Test examples below use Vitest (default). Adapt to the test framework specified in
> `.prodready/design/architecture/tech-stack.md`.

**Unit Test example** (`tests/unit/[module]/[name].test.ts`):
```typescript
import { describe, it, expect } from 'vitest'
import { createSomething } from '@/modules/something/service'

describe('createSomething', () => {
  it('AC-1: creates resource when given valid data', async () => {
    const input = { name: 'Test' }
    const result = await createSomething(input)
    expect(result).toMatchObject({
      id: expect.any(String),
      name: 'Test'
    })
  })

  it('AC-2: rejects missing required name', async () => {
    await expect(createSomething({}))
      .rejects.toThrow('Name is required')
  })
})
```

**Integration Test example** (`tests/integration/api/[resource].test.ts`):
```typescript
import { describe, it, expect } from 'vitest'
import { testClient } from '@/tests/helpers/client'

describe('POST /api/resource', () => {
  it('AC-3: creates resource through the API and returns 201', async () => {
    const response = await testClient.post('/api/resource', {
      json: { name: 'Test' }
    })
    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Test'
    })
  })
})
```

Run ALL mapped tests to confirm they fail (RED):
```bash
yarn test [test-file]
```

If the project uses another runner, use the command from `.prodready/design/architecture/tech-stack.md`. If any canonical test passes before implementation, the test is likely not testing the right thing. Review and fix the test or split/refine the AC before coding.

A canonical test marked `it.skip`, `it.todo`, pending, or equivalent does not satisfy RED. It must execute and fail.

### 2.4 Implement Code (GREEN)

Write minimal code to make the test pass.

**Project Structure** (adapt to chosen framework from `.prodready/design/architecture/tech-stack.md`):

> **Default Example** (Next.js 15 + TypeScript):

```
src/
├── app/
│   ├── api/
│   │   └── [resource]/
│   │       └── route.ts        # API routes
│   └── (pages)/                # UI pages
├── modules/
│   └── [feature]/
│       ├── domain/
│       │   ├── entities.ts     # Domain entities
│       │   └── repository.ts   # Repository interface
│       ├── application/
│       │   └── use-cases.ts    # Business logic
│       └── infrastructure/
│           └── prisma-repo.ts  # Prisma implementation
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── auth.ts                 # Auth utilities
│   └── validation.ts           # Zod schemas
└── types/
    └── index.ts                # Shared types
```

For other frameworks, adapt accordingly:
- **Django**: `apps/[feature]/models.py`, `views.py`, `urls.py`, `tests/`
- **Express**: `src/routes/`, `src/services/`, `src/models/`, `tests/`
- **FastAPI**: `app/routers/`, `app/services/`, `app/models/`, `tests/`
- **Rails**: `app/models/`, `app/controllers/`, `spec/`

**Example API Route** (`src/app/api/[resource]/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createResource } from '@/modules/resource/application/use-cases'
import { CreateResourceSchema } from '@/lib/validation'
import { withAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    const body = await request.json()

    // Validate input
    const result = CreateResourceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      )
    }

    // Execute use case
    const resource = await createResource({
      ...result.data,
      userId: user.id
    })

    return NextResponse.json(resource, { status: 201 })
  })
}
```

**Example Use Case** (`src/modules/[feature]/application/use-cases.ts`):
```typescript
import { prisma } from '@/lib/prisma'
import type { CreateResourceInput, Resource } from '../domain/entities'

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  return prisma.resource.create({
    data: {
      name: input.name,
      userId: input.userId
    }
  })
}
```

Run test to confirm it passes (GREEN):
```bash
npm test -- --run [test-file]
```

### 2.5 Refactor

If code can be improved:
- Extract duplicated logic
- Improve naming
- Simplify complexity

Run tests after refactoring to ensure nothing broke.

### 2.6 Check Quality

Run quality checks appropriate for the tech stack:

**Default (TypeScript/Next.js)**:
```bash
npx tsc --noEmit    # Type check
npm run lint         # Linter
npm test            # Tests
```

**Python/Django**:
```bash
mypy .              # Type check
ruff check .        # Linter
pytest              # Tests
```

Adapt commands to match the linter, type checker, and test runner from `tech-stack.md`.

Fix any issues before proceeding.

### 2.7 Commit

Create atomic commit for the task:
```bash
git add .
git commit -m "feat: TASK-XXX - [Short description]

- [Change 1]
- [Change 2]

Implements: [US-XXX reference if applicable]"
```

### 2.8 Update Backlog

Update `.prodready/plan/backlog.md`:

Change:
```markdown
**Status**: Ready
```

To:
```markdown
**Status**: Done
```

### 2.9 Write Task Handoff Capsule

After the task is complete, create:

`.prodready/implement/handovers/TASK-XXX.md`

Use this structure:

```markdown
# TASK-XXX Handoff

## Task
- Title:
- Status: Done
- Completed at:

## Acceptance Criteria Covered
- AC-1:
- AC-2:

## Canonical Tests
- `AC-1: ...` in `tests/...`
- `AC-2: ...` in `tests/...`

## Files Changed
- `src/...`
- `tests/...`
- `.prodready/plan/backlog.md`

## Commands Run
- `npm test -- --run ...` - PASS
- `npm run lint` - PASS
- `npx tsc --noEmit` - PASS

## Decisions
- ...

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-YYY: ...
```

This handoff capsule is the durable restart point for a fresh context. It must be specific enough that a new agent session can run `prodready-status`, read the latest capsule, and continue without re-discovering the completed task.

### 2.10 Context Budget Check

Before starting another task, explicitly decide whether to continue in the same context.

This check applies to normal interactive use of `prodready-implement`. It does not apply when the user explicitly starts an unattended `/goal prodready-implement` run; use section 2.11 instead.

Stop and request a fresh context when any of these are true:

- The current session has completed at least one implementation task and the next task is not trivial.
- The task required broad exploration across many files, frameworks, or specifications.
- The agent estimates that more than about 70% of the context window has been used.
- The next task has new domain boundaries or many dependencies.
- The user asked for one-task-per-session execution.

When stopping, output:

```text
Task TASK-XXX is complete and the handoff capsule is written.
You are in Phase 4: Implement.
Next: clear the context, start a fresh session with prodready-status, then continue with TASK-YYY.
```

Do not start `TASK-YYY` after this message.

### 2.11 `/goal prodready-implement` Unattended Mode

Use this mode when the user asks for `/goal prodready-implement` or clearly requests unattended implementation of all remaining backlog tasks.

Suggested invocation:

```text
/goal prodready-implement
```

Goal behavior:

- Implement all currently unblocked `Ready` tasks from `.prodready/plan/backlog.md` in dependency order.
- Complete exactly one `TASK-XXX` at a time.
- For every task, preserve the normal RED -> GREEN -> refactor sequence.
- For every task, write one handoff capsule at `.prodready/implement/handovers/TASK-XXX.md`.
- After every task, run task-relevant tests and quality checks from `.prodready/design/architecture/tech-stack.md`.
- After every task, update `.prodready/plan/backlog.md`, then report `prodready-status` behavior.
- Continue automatically to the next unblocked task after the handoff; do not stop merely because one task finished.
- If context compaction or resume happens, reconstruct state from `.prodready/plan/backlog.md`, `.prodready/plan/dependencies.mmd`, `prodready-status` behavior, and the latest handoff capsule before continuing.
- When all implementation tasks are `Done`, stop and run or request `prodready-gate implement`.

Unattended stop conditions:

- A command requires user approval and cannot be safely skipped.
- The same test, lint, type, Docker, or gate failure repeats three times with the same root cause.
- The specification is contradictory or lacks a required product decision.
- Required secrets, credentials, API keys, external accounts, or paid services are missing.
- The next step would skip a required phase or gate.
- All implementation tasks are complete.

At every unattended stop, write the current task handoff if any task was completed, state the exact blocker, and state the next command or skill to run.

---

## Step 3: Progress Tracking

After each task, display progress:

Also mention the handoff capsule path for the completed task.

```
╔═══════════════════════════════════════════════════════════╗
║              Implementation Progress                      ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ✓ TASK-001: Project Scaffolding                         ║
║  ✓ TASK-002: Docker Setup                                ║
║  ✓ TASK-003: Database Setup                              ║
║  → TASK-004: Authentication (in progress)                ║
║  ○ TASK-005: Feature1 Data                               ║
║  ○ TASK-006: Feature1 API                                ║
║                                                           ║
║  Progress: 3/20 tasks (15%)                               ║
║  Tests: 12 passing, 0 failing                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Step 4: Handle Blockers

If a task fails:

1. **Test failure**: Fix test or implementation
2. **Dependency issue**: Install missing package
3. **Design issue**: Note in backlog, continue with next task

If blocked for external reason:
```markdown
**Status**: Blocked
**Blocked reason**: [reason]
```

---

## Coding Standards

Follow the conventions of the chosen language and framework. Read `.prodready/design/architecture/tech-stack.md` for the specific stack.

> **Default Example** (TypeScript):

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types on functions
- Use Zod for runtime validation

### Naming

- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Imports

```typescript
// External
import { NextRequest } from 'next/server'

// Internal - absolute
import { prisma } from '@/lib/prisma'
import { createResource } from '@/modules/resource/application/use-cases'

// Internal - relative (same module only)
import { ResourceEntity } from './entities'
```

### Error Handling

```typescript
// Use Result pattern for expected errors
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Throw for unexpected errors
if (!user) {
  throw new Error('Unexpected: user not found after auth')
}
```

---

## Final Output

After all tasks completed:

```
╔═══════════════════════════════════════════════════════════╗
║              Phase 4: IMPLEMENT Complete                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Completed:                                               ║
║  ✓ 20/20 tasks implemented                               ║
║  ✓ 45 unit tests passing                                 ║
║  ✓ 12 integration tests passing                          ║
║  ✓ TypeScript: 0 errors                                  ║
║  ✓ ESLint: 0 errors                                      ║
║  ✓ Coverage: 84%                                         ║
║                                                           ║
║  Git:                                                     ║
║  • 20 commits created                                     ║
║  • All on feature branch                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

➤ Next: prodready-gate implement
```

---

## Troubleshooting

### Test Won't Pass

1. Re-read acceptance criteria
2. Check test assertions match implementation
3. Debug with `console.log` or debugger
4. Check for async issues

### TypeScript Errors

1. Check import paths
2. Ensure types are exported
3. Run `npx tsc --noEmit` for full error

### Dependency Cycle

1. Extract shared types to `@/types`
2. Use dependency injection
3. Restructure module boundaries
