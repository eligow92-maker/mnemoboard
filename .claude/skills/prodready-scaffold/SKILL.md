---
name: prodready-scaffold
description: "Use after the ProdReady plan gate passes to create development Docker, compose.yaml + compose.override.yaml, .dockerignore, .env.example, CI, Makefile, and verify containers start."
---

# ProdReady Scaffold Skill

References to slash commands mean use the corresponding `prodready-*` skill.


Create development infrastructure before implementation begins. The agent codes inside containers from the start.

**Estimated time**: ~15 minutes

**Prerequisites**: Complete `prodready-plan` and pass `prodready-gate plan`

## Instructions

Set up Docker, CI, and development tooling so implementation happens inside containers.

### Prerequisites Check

1. Verify `.prodready/plan/` exists with implementation plan and backlog
2. Read `.prodready/design/architecture/tech-stack.md` for technology choices
3. Read `.prodready/define/constraints.md` for deployment target and tech stack preferences

---

## Step 1: Dockerfile

Create a Dockerfile adapted to the chosen tech stack from `tech-stack.md`.

The Dockerfile uses four stages: `deps` (install), `dev` (development target used by compose.override.yaml), `builder` (production build), `runner` (minimal production image). Production stages are finalized in Phase 5.

> **Default Example** (Next.js + Node.js 22 + Prisma). Requires `output: 'standalone'` in `next.config.ts`:

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache ca-certificates openssl

COPY package.json package-lock.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund --ignore-scripts; \
    else \
      echo "No lockfile found." && exit 1; \
    fi

FROM node:22-alpine AS dev
WORKDIR /app

RUN apk add --no-cache ca-certificates openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run dev"]

FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=8192

RUN apk add --no-cache ca-certificates openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Pass dummy values for every env var the build requires — real values come
# from the environment at runtime, never baked into the image.
RUN if [ -f package-lock.json ]; then \
      DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
      npm run build; \
    else \
      echo "No lockfile found." && exit 1; \
    fi

RUN npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache ca-certificates openssl

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

USER node

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

> **For other stacks**, adapt accordingly:
> - **Python/Django**: `FROM python:3.12-slim`, `pip install -r requirements.txt`, `gunicorn`
> - **Go**: `FROM golang:1.22-alpine AS builder`, multi-stage with scratch/alpine runner
> - **Ruby/Rails**: `FROM ruby:3.3-slim`, `bundle install`, `puma`

---

## Step 2: compose.yaml (base) + compose.override.yaml (development)

Compose configuration is split into three files (no obsolete `version:` key):

- `compose.yaml` — base: services, env wiring, volumes, healthchecks. Shared by every environment.
- `compose.override.yaml` — development overrides: build target `dev`, port mappings, bind mounts, dev command. Loaded **automatically** by `docker compose up`.
- `compose.prod.yaml` — production overlay, created in Phase 5. Used explicitly: `docker compose -f compose.yaml -f compose.prod.yaml up -d`.

Database service depends on choice in `tech-stack.md`:
- **PostgreSQL** (default): `postgres:17-alpine`
- **MySQL**: `mysql:8`
- **MongoDB**: `mongo:7`
- **SQLite**: no database service needed

> **Default Example** (Node.js + PostgreSQL) — `compose.yaml`:

```yaml
services:
  app:
    image: app
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

> `compose.override.yaml`:

```yaml
services:
  app:
    build:
      target: dev
    ports:
      - '3000:3000'
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: sh -c "npx prisma migrate deploy && npx prisma db seed && npm run dev"

  db:
    ports:
      - '5432:5432'
    healthcheck:
      interval: 5s
```

If the stack needs Redis or extra background services (worker, scheduler), add them to `compose.yaml` the same way: env-driven config, named volume, healthcheck; dev-only settings (ports, bind mounts, `profiles`) go to `compose.override.yaml`.

---

## Step 3: .dockerignore

```dockerignore
# Git
.git
.gitignore

# Dependencies
node_modules
__pycache__
*.pyc
.venv
vendor/

# Build
.next
dist
build

# Environment
.env
.env.*
!.env.example

# IDE
.idea
.vscode
*.swp

# Testing
coverage
.nyc_output

# Misc
*.md
!README.md
.DS_Store

# ProdReady artifacts
.prodready
```

---

## Step 4: .env.example

Create `.env.example` with all required environment variables (NO real secrets):

```bash
# ===========================================
# Application
# ===========================================
NODE_ENV=development
PORT=3000

# ===========================================
# Database (compose.yaml derives DATABASE_URL from these)
# ===========================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app_dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_dev

# ===========================================
# Authentication
# ===========================================
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# ===========================================
# Optional: External Services
# ===========================================
# SMTP_HOST=
# SMTP_PORT=
```

Adapt variables to the chosen tech stack (e.g., `DJANGO_SECRET_KEY` for Django, `RAILS_MASTER_KEY` for Rails).

---

## Step 5: Basic CI

Create `.github/workflows/ci.yml` with lint + test jobs only. E2E tests and Docker build verification will be added in Phase 5 (Finalize).

> **Default Example** (TypeScript + Vitest):

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

  test:
    name: Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: always()
        with:
          files: ./coverage/lcov.info
```

> **For other stacks**, adapt:
> - **Python**: `pip install`, `ruff check`, `mypy`, `pytest`
> - **Go**: `go vet`, `golangci-lint`, `go test`
> - **Ruby**: `bundle install`, `rubocop`, `rspec`

---

## Step 6: Makefile (Development Targets)

Create `Makefile` with development targets only. Production targets will be added in Phase 5.

```makefile
.PHONY: dev test lint clean help

# ===========================================
# Development
# ===========================================

dev: ## Start development environment
	docker compose up

dev-build: ## Rebuild and start development
	docker compose up --build

# ===========================================
# Testing
# ===========================================

test: ## Run all tests
	npm test

test-unit: ## Run unit tests
	npm run test:unit

test-integration: ## Run integration tests
	npm run test:integration

test-coverage: ## Run tests with coverage
	npm run test:coverage

# ===========================================
# Code Quality
# ===========================================

lint: ## Run linter
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint -- --fix

typecheck: ## Run type check
	npx tsc --noEmit

format: ## Format code
	npm run format

# ===========================================
# Database
# ===========================================

db-migrate: ## Run database migrations
	npx prisma migrate deploy

db-reset: ## Reset database
	npx prisma migrate reset

db-seed: ## Seed database
	npx prisma db seed

db-studio: ## Open database GUI
	npx prisma studio

# ===========================================
# Cleanup
# ===========================================

clean: ## Clean build artifacts and containers
	docker compose down -v
	rm -rf .next node_modules coverage dist build

# ===========================================
# Help
# ===========================================

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
```

Adapt commands to match the chosen tech stack (e.g., `pytest` instead of `npm test`, `alembic upgrade head` instead of `npx prisma migrate deploy`).

---

## Step 7: Verify Container Runs

After creating all scaffold files:

1. Run `docker compose up --build` to verify the dev environment starts
2. Confirm the application is accessible at localhost
3. Confirm the database is reachable from the app container

If verification fails, fix the issue before proceeding.

---

## Final Output

```
╔═══════════════════════════════════════════════════════════╗
║           Phase 3.5: SCAFFOLD Complete                    ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Created:                                                 ║
║  ├── Dockerfile                                          ║
║  ├── compose.yaml                                        ║
║  ├── compose.override.yaml                               ║
║  ├── .dockerignore                                       ║
║  ├── .env.example                                        ║
║  ├── .github/workflows/ci.yml                            ║
║  └── Makefile                                            ║
║                                                           ║
║  Verified:                                                ║
║  ✓ Container builds successfully                         ║
║  ✓ Application starts                                    ║
║  ✓ Database reachable                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

➤ Next: prodready-gate scaffold
```
