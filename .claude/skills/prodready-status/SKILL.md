---
name: prodready-status
description: "Use to inspect .prodready project progress, calculate phase completion, detect the current phase, gather quality metrics, and show the next action."
---

# ProdReady Status Skill

References to slash commands mean use the corresponding `prodready-*` skill.


Display current progress across all ProdReady phases.

## Instructions

Analyze the `.prodready/` directory structure and project state to display comprehensive status.

### Steps

1. **Check Phase Completion**

For each phase, verify existence and completeness of artifacts:

```
Phase 1   (Define):   .prodready/define/
Phase 2   (Design):   .prodready/design/
Phase 3   (Plan):     .prodready/plan/
Phase 3.5 (Scaffold): Dockerfile, compose.yaml, compose.override.yaml, .github/workflows/ci.yml, Makefile
Phase 4   (Implement): src/, tests/
Phase 5   (Finalize): compose.prod.yaml, README.md, DEPLOYMENT.md
Phase 6   (Verify):   .prodready/verify/
```

2. **Calculate Progress**

For each phase calculate percentage:

- **Define**: Check for discovery.md, vision.md, constitution.md, constraints.md, user-stories.md, schema.*, *.feature files, prd.md; discovery.md must have Status `completed` or `stopped_by_user`
- **Design**: Check for pattern.md, tech-stack.md, ADR-*.md, openapi.yaml
- **Plan**: Check for implementation-plan.md, backlog.md, dependencies.mmd, test-plan.md
- **Scaffold**: Check for Dockerfile, compose.yaml, compose.override.yaml, .dockerignore, .env.example, ci.yml, Makefile
- **Implement**: Count completed tasks in backlog.md (Status: Done vs total tasks)
- **Implement handoffs**: Count `.prodready/implement/handovers/TASK-*.md` and compare with completed tasks
- **Finalize**: Check for compose.prod.yaml, deploy.yml, README.md, DEPLOYMENT.md, production Makefile targets
- **Verify**: Check for spec-compliance.md, security-report.md, performance-report.md, launch-checklist.md

3. **Detect Current Phase**

Find the first incomplete phase as the "current" one.

4. **Gather Metrics**

- Count passing/failing tests
- Count TypeScript/ESLint errors
- Calculate code coverage if available
- Count completed implementation handoff capsules

5. **Display Status**

Output in this format:

```
╔═══════════════════════════════════════════════╗
║           ProdReady Status                    ║
╠═══════════════════════════════════════════════╣
║ Phase 1:   Define    ████████████ 100% ✓     ║
║ Phase 2:   Design    ████████████ 100% ✓     ║
║ Phase 3:   Plan      ████████████ 100% ✓     ║
║ Phase 3.5: Scaffold  ████████████ 100% ✓     ║
║ Phase 4:   Implement ████████░░░░  75%       ║
║ Phase 5:   Finalize  ░░░░░░░░░░░░   0%       ║
║ Phase 6:   Verify    ░░░░░░░░░░░░   0%       ║
╠═══════════════════════════════════════════════╣
║ ➤ Current: prodready-implement              ║
║   Progress: 15/20 tasks done                  ║
║   Failing: 2 tests                            ║
║   Hint: prodready-fix test                  ║
╚═══════════════════════════════════════════════╝
```

### Progress Bar Logic

- 12 characters total for bar
- Filled: `█` (U+2588)
- Empty: `░` (U+2591)
- Calculate: `filled = round(percentage / 100 * 12)`

### Hints Logic

Provide actionable hints based on current state:

| State | Hint |
|-------|------|
| Tests failing | `prodready-fix test` |
| Lint errors | `prodready-fix lint` |
| Done tasks without handoff capsules | write missing `.prodready/implement/handovers/TASK-XXX.md` before continuing |
| Phase complete | `prodready-gate [phase]` |
| Gate passed | `prodready-[next-phase]` |

### Edge Cases

- If `.prodready/` doesn't exist: "No ProdReady project detected. Start with `prodready-define`"
- If no tasks in backlog: Show 0% for Implement phase
- If all phases 100%: Show "🎉 PROD READY" message
