---
name: prodready-define
description: "Automatically use when a user asks to create, build, implement, or scaffold a new application, service, API, website, or product, even when they do not name ProdReady or this skill. Run adaptive Socratic discovery, then define product vision, requirements, constraints, user stories, data model, Gherkin scenarios, and PRD artifacts under .prodready/define."
---

# ProdReady Define Skill

References to slash commands mean use the corresponding `prodready-*` skill.


Define WHAT we are building. This is the foundation phase that captures vision, requirements, and constraints.

**Estimated time**: ~20 minutes

## Instructions

Guide the user through a structured discovery process to define the project.

### Mandatory Discovery Contract

- Start this workflow automatically for a new product request. Never require the user to invoke the skill by name.
- Parse the initial request and prefill every fact it already answers.
- Ask exactly one question per message and wait for the answer.
- Select each next question adaptively: resolve the highest-impact ambiguity, contradiction, scope risk, or unverifiable assumption first.
- Do not recite the full questionnaire and do not ask questions whose answers are already known.
- Append to every question, localized to the user's language: `Wpisz "stop", jeśli nie chcesz więcej pytań i chcesz przejść do kolejnej fazy.` The command remains exactly `stop`.
- If the user replies with standalone `stop` in any letter case, ask no further discovery questions. Record `stopped_by_user`, infer conservative defaults only where required, label them as assumptions, generate the remaining Define artifacts, and run the Define gate.
- `stop` ends questioning, not validation. Never bypass `prodready-gate define` or silently invent a blocking product decision.

Create `.prodready/define/discovery.md` at the beginning and update it after every answer:

```markdown
# Discovery Record

- Status: in_progress | completed | stopped_by_user
- Stop option offered: yes
- Initial request: [verbatim or concise faithful summary]

## Known Facts
- [facts explicitly supplied by the user]

## Questions and Answers
1. Q: [question]
   A: [answer]

## Assumptions
- [only inferred values, especially after stop]

## Open Questions
- [unknowns that remain non-blocking, or blocking gaps for the gate]
```

Set `Status` to `completed` when discovery reaches sufficient clarity, or `stopped_by_user` immediately after `stop`.

### Prerequisites

1. Create project directory structure:
   ```
   .prodready/define/
   ├── requirements/
   ├── data-model/
   └── test-scenarios/
   ```

---

## Step 1: Vision (5 Coverage Areas)

Cover these areas one at a time, but ask only about missing information. Rephrase and reorder questions based on the user's context. Every actual question must include the mandatory `stop` escape hatch.

### 1.1 Problem Statement
> **What problem are you solving?**
> Describe the pain point or need this application addresses.

### 1.2 Target Users
> **Who are the primary users?**
> Describe your target audience and their characteristics.

### 1.3 Core Value
> **What is the ONE thing this app must do exceptionally well?**
> Focus on the single most important capability.

### 1.4 Success Metrics
> **How will you measure success?**
> Examples: user signups, task completion rate, revenue, etc.

### 1.5 MVP Scope
> **What features are in MVP vs future?**
> List essential features for launch, and nice-to-haves for later.

## Step 1.5: Socratic Review of Vision

After collecting ALL 5 vision answers, review them as a whole before generating vision.md. Use the answers to 1.1-1.4 as leverage to challenge 1.5.

**Cross-check MVP against Core Value (1.3):**
For each feature listed as "Must Have", ask:
> "You said the core value is [1.3 answer]. Does [feature] directly enable that, or is it a UX convenience that can ship in v1.1?"

**Cross-check MVP against Timeline (if mentioned):**
If user mentioned a tight timeline in any answer:
> "You mentioned [timeline constraint]. With [N] must-have features, which 3 would you keep if forced to choose?"

**Check for contradictions:**
- Many features marked MVP + solo dev + tight timeline → flag it
- Vague success metrics (1.4) + specific feature list (1.5) → ask how they'll measure which features matter

**Check for missing non-goals:**
If user listed 5+ MVP features, ask:
> "What is this app explicitly NOT going to do? Name 2-3 things someone might expect it to do, but it won't."

**Probing limits:**
- Ask 2-5 follow-up questions total, not per feature
- Stop when user justifies choices with business logic or has already trimmed the list
- If user gives the same answer twice after probing — respect the decision and move on
- Stop immediately when the user enters `stop`; record remaining uncertainty instead of continuing

---

After Socratic review, generate `.prodready/define/vision.md`:

```markdown
# Vision

## Problem Statement
[Answer 1.1]

## Target Users
[Answer 1.2]

## Core Value Proposition
[Answer 1.3]

## Success Metrics
[Answer 1.4]

## MVP Scope

### Must Have (MVP)
- [Feature 1]
- [Feature 2]

### Nice to Have (Future)
- [Feature 3]
- [Feature 4]
```

---

## Step 2: Constitution (4 Questions)

### 2.1 Non-Negotiables
> **What are the absolute requirements that cannot be compromised?**
> Examples: GDPR compliance, offline support, mobile-first, etc.

### 2.2 Explicit Non-Goals
> **What is this app explicitly NOT going to do?**
> Defining boundaries prevents scope creep.

### 2.3 Technical Constraints
> **Are there any technical constraints?**
> Examples: Must use specific tech, integrate with existing system, etc.

### 2.4 Timeline & Resources
> **What's the timeline and who's building this?**
> Solo dev? Team? Deadline?

## Step 2.5: Probe Constitution

After collecting constitution answers, quick cross-check:

- If non-goals list is short (< 3 items) → ask: "What about [X]?" where X is a common adjacent feature for this type of app
- If non-negotiable contradicts a constraint (e.g., "must be real-time" + "free tier only") → flag it
- If timeline is aggressive relative to scope → one question: "Given [timeline], are all non-negotiables truly non-negotiable for v1.0?"

**Max 1-2 follow-up questions here.**

---

Generate `.prodready/define/constitution.md`:

```markdown
# Constitution

## Non-Negotiables
- [Requirement 1]
- [Requirement 2]

## Explicit Non-Goals
- [Non-goal 1]
- [Non-goal 2]

## Technical Constraints
- [Constraint 1]
- [Constraint 2]

## Timeline & Resources
- Timeline: [duration]
- Team: [composition]
- Constraints: [any blockers]
```

---

## Step 3: Constraints (4 Questions)

### 3.1 Deployment Target
> **Where will this be deployed?**
> Options: VPS (Docker), Vercel, AWS, self-hosted, etc.

### 3.2 Scale Expectations
> **What's the expected scale at launch and 6 months out?**
> Users, requests/second, data volume.

### 3.3 Budget
> **What's the infrastructure/tooling budget?**
> Free tier only? Specific spending limit?

### 3.4 Compliance & Security
> **Any compliance or security requirements?**
> GDPR, HIPAA, SOC2, authentication requirements, etc.

### 3.5 Tech Stack Preferences
> **Do you have specific technology preferences or requirements?**
> If none, defaults will be recommended in Design phase.
> Examples: "Must use Python/Django", "Frontend in React, backend in Go", "No ORM", "TypeScript + Next.js", etc.

## Step 3.6: Probe Constraints (Socratic)

After collecting all constraint answers, cross-check them against each other and against earlier phases:

- **Scale (3.2) vs Budget (3.3)**: if projected scale won't fit the stated budget, ask:
  > "At [projected scale], [free tier/budget] will hit limits. Should the budget grow with usage, or should the design be constrained to fit it?"
- **Compliance (3.4) vs Timeline (2.4)**: heavy compliance (HIPAA, SOC2) + tight deadline → flag the conflict and ask which gives.
- **Deployment (3.1) vs Tech Stack (3.5)**: if the preferred stack fights the deployment target (e.g., long-running processes on serverless) → present the mismatch.

**Max 1-2 follow-up questions.** Then generate the file.

---

Generate `.prodready/define/constraints.md`:

```markdown
# Constraints

## Deployment
- Target: [VPS/Vercel/AWS/etc.]
- Region: [if applicable]

## Scale
- Launch: [X users, Y req/s]
- 6 months: [projected growth]

## Budget
- Infrastructure: [budget or "free tier"]
- Tooling: [budget]

## Compliance & Security
- [Requirement 1]
- [Requirement 2]

## Tech Stack Preferences
- Language: [specified or "to be decided in Design phase"]
- Framework: [specified or "to be decided in Design phase"]
- Database: [specified or "to be decided in Design phase"]
- ORM: [specified or "none" or "to be decided in Design phase"]
- Additional: [any specific requirements]
```

---

## Step 4: Generate User Stories

Based on vision and constitution, generate user stories with acceptance criteria.

Create `.prodready/define/requirements/user-stories.md`:

```markdown
# User Stories

## Epic 1: [Epic Name]

### US-001: [Story Title]
**As a** [user type]
**I want to** [action]
**So that** [benefit]

**Acceptance Criteria**:
AC-1: Given [context], when [action], then [result]
AC-2: Given [context], when [action], then [result]

**Priority**: P0/P1/P2
**Estimate**: S/M/L

---

### US-002: [Story Title]
...
```

Guidelines:
- P0 = Must have for MVP
- P1 = Should have for MVP
- P2 = Nice to have (future)
- Each story should have 2-5 acceptance criteria
- Use `AC-N: <single, observable, measurable behavior>` format
- Reset `AC-N` numbering for each user story
- Use Given/When/Then format for testability
- If one criterion would need multiple canonical acceptance tests, split it into `AC-Na`, `AC-Nb`, etc. before proceeding

### Socratic Self-Check on Stories

Before showing the stories to the user, interrogate your own output:

- Does every user type named in `vision.md` have at least one story? (An "admin" mentioned in passing still needs stories — or an explicit non-goal.)
- Is there a story for the user's FIRST experience (onboarding, empty state, first-run)?
- Do stories cover failure paths, or only the happy path?
- Can each success metric from vision (1.4) actually be observed through some story's behavior?

If a gap survives this check, present it to the user as at most 2 questions (e.g., "Vision mentions [user type], but no story covers them — in scope or a non-goal?"). Fix the stories before moving on.

---

## Step 5: Extract Data Model

Analyze user stories to identify entities and relationships.

### 5.1 Generate Entities Document

Create `.prodready/define/data-model/entities.md`:

```markdown
# Data Model

## Entities

### User
- id: UUID
- email: String (unique)
- passwordHash: String
- createdAt: DateTime
- updatedAt: DateTime

### [Entity2]
- [fields...]

## Relationships
- User 1:N [Entity2]
- [Entity2] N:M [Entity3]

## Indexes
- User.email (unique)
- [Entity2].[field] (for common queries)
```

### 5.2 Generate Schema Definition

Based on the tech stack preferences from `constraints.md`, generate the appropriate schema file:

- **Prisma** (default): `.prodready/define/data-model/schema.prisma`
- **Drizzle**: `.prodready/define/data-model/schema.ts`
- **SQLAlchemy**: `.prodready/define/data-model/models.py`
- **TypeORM**: `.prodready/define/data-model/entities.ts`
- **No ORM / undecided**: `.prodready/define/data-model/schema.sql` (plain SQL DDL)

The schema file MUST match the entities and relationships from `entities.md`.

> **Default Example** (Prisma + PostgreSQL):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  [relation]   [Entity][]
}

model [Entity] {
  // fields...
}
```

---

## Step 6: Generate Test Scenarios

For each user story, create a Gherkin feature file.

Create `.prodready/define/test-scenarios/[feature-name].feature`:

```gherkin
Feature: [Feature Name]
  As a [user type]
  I want to [capability]
  So that [benefit]

  Background:
    Given [common setup]

  Scenario: [US-001] - [Scenario name]
    Given [initial context]
    When [action is taken]
    Then [expected result]
    And [additional verification]

  Scenario: [US-001] - [Alternative scenario]
    Given [different context]
    When [action is taken]
    Then [different result]
```

Create one `.feature` file per epic or major feature area.

---

## Step 7: Generate PRD (Product Requirements Document)

Synthesize all Define phase outputs into a single coherent document optimized for AI agent consumption.

Create `.prodready/define/prd.md`:

```markdown
# Product Requirements Document (PRD)

## 1. Executive Summary

**Product**: [name from vision]
**Problem**: [1-2 sentence problem statement]
**Solution**: [1-2 sentence solution description]
**Target Users**: [primary user types]
**Success Metric**: [primary KPI]

## 2. Goals & Non-Goals

### Goals
- [Goal 1 — derived from vision + MVP scope]
- [Goal 2]

### Non-Goals
- [Non-goal 1 — from constitution]
- [Non-goal 2]

## 3. User Personas

### Persona 1: [Name/Role]
- **Context**: [who they are, what they do]
- **Pain Point**: [what frustrates them today]
- **Desired Outcome**: [what success looks like]

## 4. Functional Requirements

### FR-1: [Feature Area]
- [Requirement 1.1 — derived from user stories]
- [Requirement 1.2]
- **Acceptance**: [key criteria from user stories]

### FR-2: [Feature Area]
- [Requirements...]

## 5. Non-Functional Requirements

- **Performance**: [from constraints — scale, response times]
- **Security**: [from constraints — compliance, auth requirements]
- **Availability**: [deployment target, uptime expectations]
- **Budget**: [infrastructure budget constraints]

## 6. Data Model Summary

### Entities
- **[Entity1]**: [1-line description, key fields]
- **[Entity2]**: [1-line description, key fields]

### Key Relationships
- [Entity1] → [Entity2]: [relationship type and meaning]

## 7. Scope & Timeline

- **MVP Features**: [bulleted list from vision MVP scope]
- **Future Features**: [bulleted list from vision nice-to-haves]
- **Timeline**: [from constitution]
- **Team**: [from constitution]

## 8. Open Questions & Risks

- [Any unresolved questions from the discovery process]
- [Key risks identified during definition]

## 9. References

- Detailed user stories: `requirements/user-stories.md`
- Data model details: `data-model/entities.md`
- Test scenarios: `test-scenarios/*.feature`
- Constraints: `constraints.md`
```

### PRD Generation Rules

1. The PRD is a **synthesis**, not a copy-paste of other artifacts
2. Write in clear, direct prose — not template-speak
3. Keep it under 2 pages equivalent (~800 words)
4. It should be self-contained: an AI agent reading ONLY the PRD should understand what to build
5. Cross-reference other artifacts for details, but the PRD should stand alone for overview

---

## Final Output

After completing all steps, display summary:

```
╔═══════════════════════════════════════════════════════════╗
║              Phase 1: DEFINE Complete                     ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Created:                                                 ║
║  ├── .prodready/define/discovery.md                      ║
║  ├── .prodready/define/vision.md                         ║
║  ├── .prodready/define/constitution.md                   ║
║  ├── .prodready/define/constraints.md                    ║
║  ├── .prodready/define/requirements/user-stories.md      ║
║  ├── .prodready/define/data-model/entities.md            ║
║  ├── .prodready/define/data-model/schema.[ext]           ║
║  ├── .prodready/define/test-scenarios/*.feature          ║
║  └── .prodready/define/prd.md                            ║
║                                                           ║
║  Summary:                                                 ║
║  • [N] User Stories defined                               ║
║  • [M] Entities identified                                ║
║  • [K] Test Scenarios created                             ║
║  • PRD generated                                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

➤ Next: prodready-gate define
```

---

## Tips

- Keep MVP scope tight - you can always add more later
- Every user story must have testable acceptance criteria
- The data model should only include entities needed for MVP
- Test scenarios should cover happy path AND error cases
