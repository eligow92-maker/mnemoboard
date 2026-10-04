---
name: prodready-gate
description: "Use to validate a ProdReady phase gate for define, design, plan, scaffold, implement, build, or verify before allowing the next phase. For define/design/plan it also runs an automatic Socratic completeness audit."
---

# ProdReady Gate Skill

References to slash commands mean use the corresponding `prodready-*` skill.


Validate completion of a specific phase before proceeding to the next.

**Usage**: `prodready-gate [phase]`

**Arguments**: `$ARGUMENTS` (one of: define, design, plan, scaffold, implement, build, verify)

## Instructions

Parse the phase argument and run the appropriate validation checks.

### Phase: DEFINE

Check existence and validity of artifacts in `.prodready/define/`:

```
Quality Gate: DEFINE
═══════════════════════════

[ ] discovery.md exists and has Status: completed or stopped_by_user
[ ] discovery.md records Stop option offered: yes
[ ] discovery.md separates user-provided facts from inferred assumptions
[ ] If Status is stopped_by_user, no unresolved blocking decision is hidden as an assumption
[ ] vision.md exists and has content
[ ] constitution.md exists and has content
[ ] constraints.md exists and has content (including Tech Stack Preferences)
[ ] requirements/user-stories.md exists with acceptance criteria in `AC-N:` format
[ ] Each acceptance criterion is single, observable, and measurable
[ ] data-model/entities.md exists
[ ] data-model/schema.* exists and is valid (validation depends on ORM: npx prisma validate, SQL syntax check, etc.)
[ ] test-scenarios/*.feature files exist (at least 1)
[ ] prd.md exists and is a coherent summary (not just copy of other files)

Result: [PASSED ✓ | FAILED ✗]
```

### Phase: DESIGN

Check artifacts in `.prodready/design/`:

```
Quality Gate: DESIGN
═══════════════════════════

[ ] architecture/pattern.md exists
[ ] architecture/tech-stack.md exists
[ ] architecture/adr/ has at least 1 ADR file
[ ] api/openapi.yaml exists and is valid YAML
[ ] openapi.yaml has paths defined

Result: [PASSED ✓ | FAILED ✗]
```

### Phase: PLAN

Check artifacts in `.prodready/plan/`:

```
Quality Gate: PLAN
═══════════════════════════

[ ] implementation-plan.md exists
[ ] backlog.md exists with TASK-XXX entries
[ ] Each task has Priority, Estimate, Status, Acceptance Criteria
[ ] Each task acceptance criterion uses `AC-N:` format
[ ] Each `AC-N` has a matching `Write failing canonical test for AC-N` task
[ ] Each `AC-N` has a matching `Implement AC-N (red→green)` task
[ ] dependencies.mmd exists (Mermaid diagram)
[ ] test-plan.md exists with AC-to-canonical-test traceability

Result: [PASSED ✓ | FAILED ✗]
```

### Phase: SCAFFOLD

Check development infrastructure:

```
Quality Gate: SCAFFOLD
═══════════════════════════

[ ] Dockerfile exists
[ ] compose.yaml exists
[ ] compose.override.yaml exists
[ ] .dockerignore exists
[ ] .env.example exists (no real secrets)
[ ] .github/workflows/ci.yml exists
[ ] Makefile exists with dev targets
[ ] docker compose up builds successfully
[ ] Application starts in container

Result: [PASSED ✓ | FAILED ✗]
```

Run: `docker compose up --build -d && docker compose ps`

### Phase: IMPLEMENT

Validate code implementation:

```
Quality Gate: IMPLEMENT
═══════════════════════════

[ ] All tasks in backlog.md marked as Done
[ ] src/ directory exists with code (or equivalent for chosen framework)
[ ] tests/ directory exists with tests
[ ] Every story/task-scoped `AC-N` has exactly one canonical test whose name starts with `AC-N: `
[ ] No canonical AC test is skipped, pending, or todo
[ ] Every completed `TASK-XXX` has a handoff capsule in `.prodready/implement/handovers/TASK-XXX.md`
[ ] All unit tests pass
[ ] All integration tests pass
[ ] Type check passes (language-specific: npx tsc --noEmit, mypy, etc.)
[ ] Linter passes (npm run lint, ruff check, etc.)
[ ] Code coverage >= 80% (if configured)

Result: [PASSED ✓ | FAILED ✗]
```

Run quality checks per tech-stack.md:
```bash
# Default (TypeScript): npx tsc --noEmit && npm run lint && npm test
# Python: mypy . && ruff check . && pytest
# Adapt commands to chosen stack
```

### Phase: BUILD

Validate infrastructure:

```
Quality Gate: BUILD
═══════════════════════════

[ ] Dockerfile production stage optimized (non-root user, health check, minimal image)
[ ] compose.prod.yaml exists
[ ] Docker production build succeeds (docker build -t test-build .)
[ ] .github/workflows/deploy.yml exists (if applicable)
[ ] CI extended with E2E and Docker build jobs
[ ] README.md exists with setup instructions
[ ] DEPLOYMENT.md exists
[ ] Makefile has production targets (prod-up, prod-down, prod-logs)

Result: [PASSED ✓ | FAILED ✗]
```

Run: `docker build -t prodready-gate-test . 2>&1`

### Phase: VERIFY

Final production readiness check:

```
Quality Gate: VERIFY
═══════════════════════════

[ ] .prodready/verify/spec-compliance.md shows 100%
[ ] .prodready/verify/security-report.md has no CRITICAL/HIGH issues
[ ] .prodready/verify/performance-report.md meets targets
[ ] .prodready/verify/acceptance-results.md shows every story/task-scoped AC has exactly one canonical PASS
[ ] E2E tests pass (npm run test:e2e or equivalent)
[ ] .prodready/verify/launch-checklist.md all items checked

Result: [PASSED ✓ | FAILED ✗]
```

## Socratic Completeness Audit (define / design / plan only)

The checklist verifies that artifacts EXIST. This audit verifies they are COHERENT and COMPLETE. Run it automatically after the checklist for the define, design, and plan gates — even when the checklist passes. The phase skills already ask Socratic questions during creation; this is the independent second pass that catches what slipped through anyway.

**Method**: act as a skeptical reviewer who did NOT participate in creating the artifacts. Ask each audit question below AGAINST THE ARTIFACTS — do not ask the user. For each question, either cite the artifact passage that answers it, or record a finding. Only findings reach the user.

### Audit Questions: DEFINE

- Does discovery.md prove that Socratic discovery ran automatically or that the user explicitly stopped it?
- Were already-known facts reused, with no unnecessary repeated questions recorded?
- Are assumptions introduced after `stop` explicit, conservative, and non-blocking?
- Does every user type named in vision.md have at least one user story — or an explicit non-goal?
- Do test scenarios cover failure paths, or only happy paths?
- Can each success metric from vision.md actually be measured with the data the entities store?
- Do any two artifacts contradict each other (non-negotiables vs constraints vs timeline vs MVP scope)?
- Is the user's first-run experience (onboarding, empty states) represented anywhere?
- If compliance is mentioned (e.g., GDPR): does the data model support deletion/export of user data?

### Audit Questions: DESIGN

- Map every P0 user story to endpoint(s) in openapi.yaml. Any P0 story with no endpoint?
- Does every ADR list a genuine alternative with a genuine rejection reason?
- Authorization: stories imply roles/ownership — does any design artifact say who can do what, or only who can log in?
- At the scale stated in constraints.md, where is the first bottleneck — and does any artifact address or consciously defer it?
- For each external service in the design: is failure behavior defined anywhere?
- Does the stack or pattern violate budget, deployment target, or a non-negotiable?

### Audit Questions: PLAN

- Is every P0 user story traceable to at least one TASK-XXX? List orphans.
- Does the sum of estimates fit the timeline from constitution.md with buffer (≤ ~70% of capacity)?
- Does the riskiest/most-unknown work appear in Sprint 1-2, or is it deferred to the end?
- After Sprint 1, does any thin slice work end-to-end?
- Does every AC-N from the backlog appear in test-plan.md traceability?
- Does every external dependency (accounts, keys, approvals) appear as an explicit blocker or risk?

### Finding Classification

- **✗ GAP** — a contradiction between artifacts, or a P0 story that cannot be implemented/traced. **Fails the gate**, listed alongside checklist failures.
- **? OPEN** — a real question the artifacts leave unanswered, without blocking implementation. Does NOT fail the gate. Present at most 3 to the user, most important first; write their answers back into the relevant artifact (not just chat).
- Answered questions produce no output — do not list everything that passed.

## Output Format

### On SUCCESS:

```
Quality Gate: [PHASE]
═══════════════════════════

✓ [check 1]
✓ [check 2]
...

Socratic Audit                (define/design/plan only)
───────────────────────────
✓ No gaps found
? OPEN: [question 1]
? OPEN: [question 2]

Result: PASSED ✓ [(N open questions) if any]
➤ Ready for: prodready-[next-phase]
```

If there are OPEN findings, ask them (max 3) before printing the final result, and write the answers back into the artifacts.

### On FAILURE:

```
Quality Gate: [PHASE]
═══════════════════════════

✓ [passing check]
✗ [failing check] - [reason]

Socratic Audit                (define/design/plan only)
───────────────────────────
✗ GAP: [contradiction or coverage gap] - [artifacts involved]

Result: FAILED ✗ (X issues)
➤ Fix with: prodready-fix [suggested-type]
```

## Next Phase Mapping

| Current | Next Command |
|---------|--------------|
| define | `prodready-design` |
| design | `prodready-plan` |
| plan | `prodready-scaffold` |
| scaffold | `prodready-implement` |
| implement | `prodready-build` |
| build | `prodready-verify` |
| verify | PROD READY |

## Final Gate (verify) Success Message

```
Quality Gate: VERIFY
═══════════════════════════

✓ Spec compliance 100%
✓ Security scan passed
✓ Performance targets met
✓ E2E tests passed

Result: PASSED ✓

🎉 PROD READY

Deploy with:
  docker compose -f compose.yaml -f compose.prod.yaml up -d
```
