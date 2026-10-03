---
name: prodready-build
description: "Use after the ProdReady implement gate passes to finalize production Docker, CI/CD, deploy workflow, Makefile targets, setup script, README, deployment guide, and API docs."
---

# ProdReady Build Skill

References to slash commands mean use the corresponding `prodready-*` skill.


Finalize infrastructure for production deployment. Development Docker and CI were created in the Scaffold phase — this phase adds production configs, deploy pipeline, and documentation.

**Estimated time**: ~30 minutes

**Prerequisites**: Complete `prodready-implement` and pass `prodready-gate implement`

## Instructions

Finalize production infrastructure, add deploy pipeline, and create documentation.

### Prerequisites Check

1. Verify `src/` exists with implemented code
2. Verify all tests pass
3. Verify Dockerfile, compose.yaml, and compose.override.yaml exist (from Scaffold phase)
4. Read `.prodready/design/architecture/tech-stack.md` for technology choices

---

## Step 1: Production Docker Configuration

Development Dockerfile, compose.yaml, and compose.override.yaml were created in the Scaffold phase. Now finalize for production.

### 1.1 Finalize Dockerfile

Review the existing Dockerfile and ensure the production stage is optimized:
- Multi-stage build with minimal final image
- Non-root user for security
- Health check configured
- No development dependencies in final stage
- ORM-specific build steps included (adapt to tech stack from `tech-stack.md`)

### 1.2 compose.prod.yaml (Production overlay)

`compose.prod.yaml` is an **overlay** on top of `compose.yaml` — it only adds/overrides production settings (image, restart policy, healthcheck, resource limits). Base services, env wiring, and volumes stay in `compose.yaml`. Run it explicitly:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

(`compose.override.yaml` is NOT loaded when `-f` is passed explicitly, so dev ports and bind mounts never leak into production.)

Adapt database service to the chosen database from `tech-stack.md` (PostgreSQL, MySQL, MongoDB, etc.).

```yaml
services:
  app:
    image: ghcr.io/${GHCR}:${APP_SHA} # image from registry; alternatively build on the server
    platform: linux/amd64
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    command: ['sh', '-c', 'npx prisma migrate deploy && node server.js']
    expose:
      - '3000'
    # Truthful readiness: the endpoint probes real dependencies (DB), so
    # `up -d --wait` fails instead of reporting success over a dead stack.
    healthcheck:
      test:
        [
          'CMD-SHELL',
          'wget -qO- http://127.0.0.1:3000/api/health || exit 1',
        ]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 90s
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 768M

  # Daily pg_dump with retention. Off-server copies are the owner's job.
  db-backup:
    image: postgres:17-alpine
    depends_on:
      - db
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - BACKUP_RETENTION=14
      - BACKUP_INTERVAL_SECONDS=86400
    volumes:
      - db_backups:/backups
      - ./scripts/db-backup.sh:/usr/local/bin/db-backup.sh:ro
    entrypoint: ['sh', '/usr/local/bin/db-backup.sh']

  db:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  # Optional: reverse proxy with TLS (Caddy/Traefik) or a tunnel (cloudflared)
  # traefik:
  #   image: traefik:v3
  #   ...

volumes:
  db_backups:
```

---

## Step 2: CI/CD Configuration

### 2.1 Extend CI Pipeline

The basic CI (lint + test) was created in Scaffold phase. Now add Docker build and E2E test jobs to `.github/workflows/ci.yml`.

Adapt ORM-specific steps to the chosen stack:
- **Prisma**: `npx prisma generate` + `npx prisma migrate deploy`
- **Drizzle**: `npx drizzle-kit push`
- **Django**: `python manage.py migrate`
- **SQLAlchemy/Alembic**: `alembic upgrade head`

Add these jobs to the existing CI:

```yaml
  # Add to existing ci.yml (after lint and test jobs from Scaffold):

  build:
    name: Build Docker
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: app:test
          cache-from: type=gha
          cache-to: type=gha,mode=max

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4

      - name: Setup environment
        # Adapt to chosen stack and E2E framework from tech-stack.md
        run: |
          # Install dependencies and E2E test framework
          npm ci
          npx playwright install --with-deps chromium

      - name: Start services
        run: docker compose up -d

      - name: Wait for services
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-report
          path: playwright-report/

      - name: Stop services
        run: docker compose down
        if: always()
```

### 2.2 GitHub Actions Deploy (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    name: Build and Push
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Step 3: Extend Makefile with Production Targets

Development Makefile was created in Scaffold phase. Add production targets:

```makefile
# ===========================================
# Production (add to existing Makefile)
# ===========================================

build: ## Build production Docker image
	docker build -t app:latest .

build-prod: ## Build the production compose stack
	docker compose -f compose.yaml -f compose.prod.yaml build

prod-up: ## Start the production compose stack
	docker compose -f compose.yaml -f compose.prod.yaml up -d

prod-down: ## Stop the production compose stack
	docker compose -f compose.yaml -f compose.prod.yaml down

prod-logs: ## View production logs
	docker compose -f compose.yaml -f compose.prod.yaml logs -f

test-e2e: ## Run E2E tests
	npm run test:e2e
```

Adapt commands to the chosen tech stack.

---

## Step 5: Documentation

### 5.1 README.md

```markdown
# [Project Name]

[Brief description from vision.md]

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development)

### Development

```bash
# Clone repository
git clone [repo-url]
cd [project-name]

# Copy environment file
cp .env.example .env

# Start development environment
make dev

# Open http://localhost:3000
```

### Running Tests

```bash
make test          # All tests
make test-unit     # Unit tests only
make test-e2e      # E2E tests only
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `PORT` | No | Server port (default: 3000) |

See `.env.example` for all options.

## Architecture

[Brief architecture overview from pattern.md]

## API Documentation

API endpoints are documented in `.prodready/design/api/openapi.yaml`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## License

[License type]
```

### 5.2 DEPLOYMENT.md

```markdown
# Deployment Guide

## VPS Deployment (Docker Compose)

### Prerequisites

- VPS with Docker & Docker Compose installed
- Domain name (optional, for SSL)
- SSH access

### Step 1: Prepare Server

```bash
# SSH into server
ssh user@your-server

# Install Docker (if not installed) — includes the `docker compose` plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Verify
docker compose version
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone [repo-url]
cd [project-name]

# Create production environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production
```

**Required production values**:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:STRONG_PASSWORD@db:5432/app_prod
JWT_SECRET=GENERATE_SECURE_SECRET
POSTGRES_USER=user
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_DB=app_prod
```

Generate secure secret:
```bash
openssl rand -base64 32
```

### Step 3: Deploy

```bash
# Load environment
export $(cat .env.production | xargs)

# Build and start (compose.override.yaml is skipped because -f is explicit)
docker compose -f compose.yaml -f compose.prod.yaml up -d --build --wait

# Run migrations (if not part of the app start command)
docker compose -f compose.yaml -f compose.prod.yaml run --rm --no-deps app [ORM migration command]
# Prisma: npx prisma migrate deploy
# Django: python manage.py migrate
# Alembic: alembic upgrade head

# Check status
docker compose -f compose.yaml -f compose.prod.yaml ps
docker compose -f compose.yaml -f compose.prod.yaml logs -f
```

### Step 4: SSL with Traefik (Optional)

Add to `compose.prod.yaml`:

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    restart: unless-stopped

  app:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.app.entrypoints=websecure"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
    # Remove ports mapping when using Traefik
```

### Maintenance

```bash
# View logs
docker compose -f compose.yaml -f compose.prod.yaml logs -f app

# Restart services
docker compose -f compose.yaml -f compose.prod.yaml restart

# Update deployment
git pull
docker compose -f compose.yaml -f compose.prod.yaml up -d --build --wait

# Backup database (the db-backup sidecar also runs a daily pg_dump)
docker compose -f compose.yaml -f compose.prod.yaml exec db pg_dump -U user app_prod > backup.sql
```

### Monitoring

Basic health check:
```bash
curl http://localhost:3000/api/health
```

Add monitoring (optional):
- Uptime: UptimeRobot, Healthchecks.io
- Logs: Loki, Papertrail
- Metrics: Prometheus + Grafana
```

### 5.3 API Documentation

Create `docs/api.md`:

```markdown
# API Reference

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require Bearer token:

```
Authorization: Bearer <token>
```

## Endpoints

[Generate from openapi.yaml - list main endpoints with examples]

### POST /auth/register

Register a new user.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

[Continue for other endpoints...]
```

---

## Step 6: Setup Script

Create `scripts/setup.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Setting up project..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

# Start services
echo "🐳 Starting Docker services..."
docker compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
echo "📊 Running database migrations..."
docker compose exec app npx prisma migrate deploy

# Seed database (optional)
# echo "🌱 Seeding database..."
# docker compose exec app npx prisma db seed

echo "✅ Setup complete!"
echo ""
echo "📌 Next steps:"
echo "   1. Edit .env with your configuration"
echo "   2. Open http://localhost:3000"
echo ""
echo "📚 Commands:"
echo "   make dev      - Start development"
echo "   make test     - Run tests"
echo "   make help     - Show all commands"
```

Make executable: `chmod +x scripts/setup.sh`

---

## Final Output

```
╔═══════════════════════════════════════════════════════════╗
║           Phase 5: FINALIZE Complete                      ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Created/Updated:                                         ║
║  ├── Dockerfile (production optimized)                   ║
║  ├── compose.prod.yaml                                   ║
║  ├── .github/workflows/ci.yml (+ E2E, Docker build)     ║
║  ├── .github/workflows/deploy.yml                        ║
║  ├── Makefile (+ production targets)                     ║
║  ├── scripts/setup.sh                                    ║
║  ├── README.md                                           ║
║  ├── DEPLOYMENT.md                                       ║
║  └── docs/api.md                                         ║
║                                                           ║
║  Production:                                              ║
║  ✓ Dockerfile optimized for production                   ║
║  ✓ Production compose configured                         ║
║  ✓ Deploy pipeline ready                                 ║
║                                                           ║
║  CI/CD Extended:                                          ║
║  ✓ E2E tests added                                       ║
║  ✓ Docker build verification added                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

➤ Next: prodready-gate build
```
