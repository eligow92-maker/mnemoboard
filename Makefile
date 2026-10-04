.PHONY: build prod-up prod-down prod-logs prod-ps setup dev dev-build dev-down logs shell test test-unit test-integration test-coverage test-e2e \
	lint lint-fix typecheck format db-migrate db-reset db-seed db-studio db-backup clean help

EXEC := docker compose exec app
PROD := docker compose -f compose.yaml -f compose.prod.yaml

# ===========================================
# Development
# ===========================================

dev: ## Start development environment
	docker compose up

dev-build: ## Rebuild and start development
	docker compose up --build

dev-down: ## Stop development environment
	docker compose down

logs: ## Follow application logs
	docker compose logs -f app

shell: ## Open a shell in the app container
	$(EXEC) sh

# ===========================================
# Testing (inside the app container)
# ===========================================

test: ## Run unit and integration tests
	$(EXEC) npm test

test-unit: ## Run unit tests
	$(EXEC) npm run test:unit

test-integration: ## Run integration tests
	$(EXEC) npm run test:integration

test-coverage: ## Run tests with coverage
	$(EXEC) npm run test:coverage

test-e2e: ## Run E2E tests from the host against the running dev environment
	npm run test:e2e

# ===========================================
# Code Quality
# ===========================================

lint: ## Run linter
	$(EXEC) npm run lint

lint-fix: ## Fix linting issues
	$(EXEC) npm run lint -- --fix

typecheck: ## Run type check
	$(EXEC) npx tsc --noEmit

format: ## Format code
	$(EXEC) npm run format

# ===========================================
# Database
# ===========================================

db-migrate: ## Run database migrations
	$(EXEC) npx prisma migrate deploy

db-reset: ## Reset database (destroys all data)
	$(EXEC) npx prisma migrate reset

db-seed: ## Seed database
	$(EXEC) npx prisma db seed

db-studio: ## Open database GUI
	npx prisma studio

db-backup: ## Dump the database to backups/
	mkdir -p backups
	docker compose exec -T db sh -c 'pg_dump -U "$$POSTGRES_USER" "$$POSTGRES_DB"' > backups/mnemoboard-$$(date +%Y%m%d-%H%M%S).sql

# ===========================================
# Production (dom: serwer lub komputer w sieci lokalnej, bez logowania — nie wystawiać do internetu)
# ===========================================

setup: ## First-time setup of the production stack (creates .env, builds, starts)
	./scripts/setup.sh

build: ## Build the production image
	$(PROD) build

prod-up: ## Start the production stack (waits until healthy)
	$(PROD) up -d --build --wait

prod-down: ## Stop the production stack (data is kept in the volume)
	$(PROD) down

prod-logs: ## Follow production logs
	$(PROD) logs -f

prod-ps: ## Show production containers and their health
	$(PROD) ps

# ===========================================
# Cleanup
# ===========================================

clean: ## Remove containers, volumes (destroys data) and build artifacts
	docker compose down -v
	rm -rf .next node_modules coverage dist build

# ===========================================
# Help
# ===========================================

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
