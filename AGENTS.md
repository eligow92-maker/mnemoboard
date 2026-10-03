# ProdReady Framework - Agent Instructions

> Philosophy: "Don't build twice. Specify once, build right."

**Golden Rule**: never skip phases. Always run the matching `prodready-gate` validation before moving to the next phase.

**Automatic Discovery Rule**: when the user asks to create, build, implement, or scaffold an application, service, API, website, or product, immediately begin the `prodready-define` Socratic discovery behavior. The user does not need to name or invoke a skill.

```
Define -> gate -> Design -> gate -> Plan -> gate -> Scaffold -> gate -> Implement -> gate -> Build -> gate -> Verify -> gate -> PROD READY
```

## Skills

ProdReady workflows live as Codex skills in `.agents/skills/prodready-*/SKILL.md`. Use the skill whose name matches the user's intent or the current phase.

| Phase / Utility | Skill | Purpose |
|---|---|---|
| 1 | `prodready-define` | Capture vision, constitution, constraints, user stories, data model, Gherkin scenarios, and PRD. |
| Gate | `prodready-gate` with `define` | Validate Define artifacts before Design. |
| 2 | `prodready-design` | Choose architecture, tech stack, ADRs, OpenAPI contract, and UI design artifacts. |
| Gate | `prodready-gate` with `design` | Validate Design artifacts before Plan. |
| 3 | `prodready-plan` | Create implementation strategy, backlog, dependency graph, and test plan. |
| Gate | `prodready-gate` with `plan` | Validate Plan artifacts before Scaffold. |
| 3.5 | `prodready-scaffold` | Create Docker/dev infrastructure, CI, Makefile, and verify containers. |
| Gate | `prodready-gate` with `scaffold` | Validate Scaffold artifacts before Implement. |
| 4 | `prodready-implement` | Implement backlog tasks test-first, with acceptance-criteria-to-test mapping. |
| Gate | `prodready-gate` with `implement` | Validate implementation before Build. |
| 5 | `prodready-build` | Finalize production Docker, CI/CD, deployment files, setup script, README, deployment guide, and API docs. |
| Gate | `prodready-gate` with `build` | Validate production build before Verify. |
| 6 | `prodready-verify` | Run production-readiness checks and generate verification reports. |
| Final Gate | `prodready-gate` with `verify` | Validate final readiness and mark PROD READY. |
| Utility | `prodready-status` | Show progress across all phases and recommend the next action. |
| Utility | `prodready-fix` with `test`, `lint`, `security`, `performance`, or `spec` | Fix gate or verification failures, then re-run the relevant gate. |

## Session Start Protocol

When a user starts a conversation related to ProdReady:

1. Check whether `.prodready/` exists.
2. If it does not exist and the user wants to build a product, start `prodready-define` immediately and ask the first unanswered discovery question. Do not merely recommend the skill.
3. If it exists, use `prodready-status` behavior:
   - scan artifact directories,
   - determine the current phase,
   - identify existing and missing artifacts,
   - tell the user exactly where they are and what comes next.
4. Never assume the user remembers where they left off.

## Mandatory Socratic Discovery

For every new product request, run Socratic discovery before Design or implementation:

1. Extract facts already present in the user's request; never ask for information they already supplied.
2. Ask exactly one question per message, choosing the next question dynamically from the largest unresolved product risk.
3. Challenge contradictions, oversized MVP scope, unmeasurable success criteria, hidden dependencies, and unsupported assumptions instead of mechanically completing a questionnaire.
4. Append this localized escape hatch to every discovery question: `Wpisz "stop", jeśli nie chcesz więcej pytań i chcesz przejść do kolejnej fazy.` Use the user's language while keeping the command exactly `stop`.
5. Treat a standalone, case-insensitive `stop` as authoritative. Ask no more discovery questions, record the opt-out, infer only conservative defaults, and mark every inferred value as an assumption.
6. After `stop`, finish the Define artifacts from known facts and explicit assumptions, run `prodready-gate define`, and advance only if the gate passes. `stop` skips further questions, never the gate.
7. Persist the discovery trail in `.prodready/define/discovery.md`; the Define gate must reject a missing or invalid trail.

Do not wait for an explicit `prodready-define` request. Do not start coding from a product request while Define is incomplete.

## Phase Order

| Current phase | Required validation | Next phase |
|---|---|---|
| Define | `prodready-gate define` | `prodready-design` |
| Design | `prodready-gate design` | `prodready-plan` |
| Plan | `prodready-gate plan` | `prodready-scaffold` |
| Scaffold | `prodready-gate scaffold` | `prodready-implement` |
| Implement | `prodready-gate implement` | `prodready-build` |
| Build | `prodready-gate build` | `prodready-verify` |
| Verify | `prodready-gate verify` | PROD READY |

## Required Artifacts

### Define

- `.prodready/define/discovery.md`
- `.prodready/define/vision.md`
- `.prodready/define/constitution.md`
- `.prodready/define/constraints.md`
- `.prodready/define/requirements/user-stories.md`
- `.prodready/define/data-model/entities.md`
- `.prodready/define/data-model/schema.*`
- `.prodready/define/test-scenarios/*.feature`
- `.prodready/define/prd.md`

### Design

- `.prodready/design/architecture/pattern.md`
- `.prodready/design/architecture/tech-stack.md`
- `.prodready/design/architecture/adr/ADR-*.md`
- `.prodready/design/api/openapi.yaml`
- `.prodready/design/ui/tokens.md` and `.prodready/design/ui/components.md` when a frontend exists

### Plan

- `.prodready/plan/implementation-plan.md`
- `.prodready/plan/backlog.md`
- `.prodready/plan/dependencies.mmd`
- `.prodready/plan/test-plan.md`

### Scaffold

- `Dockerfile`
- `compose.yaml`
- `.dockerignore`
- `.env.example`
- `.github/workflows/ci.yml`
- `Makefile`

### Implement

- application source code, usually `src/` or the equivalent for the chosen framework
- tests, usually `tests/unit/`, `tests/integration/`, and later `tests/e2e/`
- one canonical acceptance test for every story/task-scoped `AC-N`, named with the prefix `AC-N: `
- all tasks in `.prodready/plan/backlog.md` marked `Done`
- commits per task when appropriate: `feat: TASK-XXX - [description]`

### Build

- finalized production `Dockerfile`
- `compose.prod.yaml`
- extended `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml` when applicable
- production targets in `Makefile`
- `scripts/setup.sh`
- `README.md`
- `DEPLOYMENT.md`
- `docs/api.md`

### Verify

- `.prodready/verify/spec-compliance.md`
- `.prodready/verify/security-report.md`
- `.prodready/verify/performance-report.md`
- `.prodready/verify/acceptance-results.md`
- `.prodready/verify/launch-checklist.md`

## Gate Protocol

On pass:

1. Announce `Gate PASSED`.
2. State the exact next skill, for example: `Ready for: prodready-design`.

On fail:

1. List every failing check with a specific reason.
2. Suggest the appropriate fix skill, for example: `Fix with: prodready-fix test`.
3. After any fix, tell the user to re-run the same gate.

## User Guidance Rules

1. Always state the current position: `You are in Phase X: [Name]`.
2. Always state what comes next.
3. Block phase skipping. If the user tries to jump ahead, explain the concrete risk and guide them through the missing phase quickly.
4. Explain gate failures specifically; never say only that "some checks failed".
5. After fixes, prompt the relevant re-gate.
6. Keep progress acknowledgements brief.

## Recovery Patterns

### Going Back

Allowed. Warn that changing earlier artifacts may invalidate later artifacts and that later gates must be re-run.

### Restarting

Delete `.prodready/` only if the user explicitly asks for a full restart, then start with `prodready-define`.

### Interrupted Session

Use `prodready-status` behavior, then resume from the last incomplete step within the current phase.

### Gate Keeps Failing

After three failed attempts on the same check, explain the root cause and identify manual intervention if automatic fixes are insufficient.

### No `.prodready/`

Direct the user to `prodready-define`.

## Core Principles

1. Specification first: define and design before writing code.
2. Gates are non-negotiable.
3. Test-first implementation: RED, GREEN, refactor.
4. `.prodready/` is the single source of truth for project decisions.
5. Keep tasks small and atomic: less than 4 hours, one commit-worthy change.
6. Fix issues, re-gate, and iterate until green.
7. Guide the user by default: current phase, next action, and exact blocker.

## Acceptance Criteria & TDD

The workflow is anchored in test-driven development. Every acceptance criterion must have exactly one canonical acceptance test, and that canonical test must be RED before implementation starts.

### Canonical AC Test Mapping

- Write acceptance criteria as `AC-N: <single, observable, measurable behavior>`.
- `AC-N` numbering resets per user story or backlog task.
- Every story/task-scoped `AC-N` must have exactly one canonical acceptance test whose test name starts with `AC-N: `.
- Additional technical tests are allowed and encouraged, but they must not use the `AC-N: ` prefix and do not count as canonical AC coverage.
- If one AC needs multiple canonical acceptance tests, split the AC into `AC-Na`, `AC-Nb`, and update the specification before implementation.

### Red Phase Requirement

Before starting implementation for `AC-N`:

1. Write the canonical test named `AC-N: <criterion text>`.
2. Run the project test command from `tech-stack.md`.
3. Confirm the canonical test executes and fails. Skipped, pending, or todo tests do not satisfy RED.
4. Only then start the GREEN implementation.

Phase skipping includes skipping RED. `prodready-gate implement` and `prodready-gate verify` must block missing, skipped, duplicated within the same story/task traceability row, or non-passing canonical AC tests.

## Anti-Patterns

| User says | Agent response |
|---|---|
| "Build me an app" | Start Socratic Define immediately with the most valuable unanswered question and the `stop` escape hatch. |
| "Let's just start coding" | "Definition first prevents rework. I'll begin with one short discovery question. Type `stop` at any time to finish discovery with explicit assumptions." |
| "stop" during discovery | Stop asking questions, record the opt-out and assumptions, complete Define artifacts, then run the Define gate. |
| "Skip the gate" | "The gate catches issues while they are cheap to fix. I need to run `prodready-gate [phase]` before moving on." |
| "Tests are overkill" | "The implement phase is test-first so acceptance criteria are verified as code." |
| "I already know the architecture" | "Good. I will capture those decisions in `prodready-design` as ADRs so the project has a record." |
| "Just deploy it" | "Run `prodready-verify` first so security, performance, and acceptance gaps are caught before production." |
