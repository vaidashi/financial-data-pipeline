.PHONY: help install dev build test lint clean format setup ci api-test frontend-test

# =================================================================
# VARIABLES
# =================================================================

# Colors for output
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
RESET := \033[0m

# =================================================================
# HELP
# =================================================================

help: ## Show this help message
	@echo "$(BLUE)Financial Data Pipeline - Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# =================================================================
# LOCAL DEVELOPMENT
# =================================================================

install: ## Install all dependencies
	@echo "$(YELLOW)Installing dependencies...$(RESET)"
	@npm run install:all
	@echo "$(GREEN)✅ Dependencies installed successfully$(RESET)"

dev: ## Start development servers locally
	@echo "$(YELLOW)Starting development servers...$(RESET)"
	@npm run dev

dev-backend: ## Start only backend development server locally
	@echo "$(YELLOW)Starting backend development server...$(RESET)"
	@npm run dev -w backend

dev-frontend: ## Start only frontend development server locally
	@echo "$(YELLOW)Starting frontend development server...$(RESET)"
	@npm run dev -w frontend

build: ## Build all packages locally
	@echo "$(YELLOW)Building all packages...$(RESET)"
	@npm run build
	@echo "$(GREEN)✅ Build completed successfully$(RESET)"

build-backend: ## Build backend only locally
	@echo "$(YELLOW)Building backend...$(RESET)"
	@npm run build -w backend
	@echo "$(GREEN)✅ Backend build completed$(RESET)"

build-frontend: ## Build frontend only locally
	@echo "$(YELLOW)Building frontend...$(RESET)"
	@npm run build -w frontend
	@echo "$(GREEN)✅ Frontend build completed$(RESET)"

# =================================================================
# DOCKER DEVELOPMENT
# =================================================================

docker-up: ## Start development environment with Docker
	@echo "$(YELLOW)Starting Docker development environment...$(RESET)"
	@docker compose up -d
	@echo "$(GREEN)✅ Docker services started for development$(RESET)"
	@echo "$(BLUE)Services available at:$(RESET)"
	@echo "  🚀 Backend API: http://localhost:3001"
	@echo "  🎨 Frontend: http://localhost:5000"
	@echo "  📊 Adminer (DB): http://localhost:8080"
	@echo "  🔴 Redis Commander: http://localhost:8081"

docker-down: ## Stop development environment
	@echo "$(YELLOW)Stopping Docker development environment...$(RESET)"
	@docker compose down
	@echo "$(GREEN)✅ Docker services stopped$(RESET)"

docker-build: ## Build development Docker images
	@echo "$(YELLOW)Building development Docker images...$(RESET)"
	@docker compose build
	@echo "$(GREEN)✅ Docker images built for development$(RESET)"

docker-logs: ## View Docker logs for development
	@docker compose logs -f

# =================================================================
# DOCKER PRODUCTION
# =================================================================

docker-up-prod: ## Start production environment with Docker
	@echo "$(YELLOW)Starting Docker production environment...$(RESET)"
	@docker compose -f docker-compose.yml up -d --build
	@echo "$(GREEN)✅ Docker services started for production$(RESET)"

docker-down-prod: ## Stop production environment
	@echo "$(YELLOW)Stopping Docker production environment...$(RESET)"
	@docker compose -f docker-compose.yml down
	@echo "$(GREEN)✅ Docker services stopped$(RESET)"

docker-build-prod: ## Build production Docker images
	@echo "$(YELLOW)Building production Docker images...$(RESET)"
	@docker compose -f docker-compose.yml build
	@echo "$(GREEN)✅ Docker images built for production$(RESET)"

# =================================================================
# DATABASE (LOCAL)
# =================================================================

db-migrate: ## Run database migrations locally
	@echo "$(YELLOW)Running database migrations...$(RESET)"
	@cd packages/backend && npm run db:migrate
	@echo "$(GREEN)✅ Database migrations completed$(RESET)"

db-seed: ## Seed database locally
	@echo "$(YELLOW)Seeding database...$(RESET)"
	@cd packages/backend && npm run db:seed
	@echo "$(GREEN)✅ Database seeded successfully$(RESET)"

db-reset: ## Reset database and run migrations locally
	@echo "$(YELLOW)Resetting database...$(RESET)"
	@cd packages/backend && npm run db:reset
	@echo "$(GREEN)✅ Database reset completed$(RESET)"

db-studio: ## Open Prisma Studio locally
	@echo "$(YELLOW)Opening Prisma Studio...$(RESET)"
	@cd packages/backend && npm run db:studio

# =================================================================
# DATABASE (DOCKER)
# =================================================================

docker-db-migrate: ## Run database migrations in Docker
	@echo "$(YELLOW)Running database migrations in Docker...$(RESET)"
	@docker compose exec backend npm run db:migrate
	@echo "$(GREEN)✅ Database migrations completed$(RESET)"

docker-db-seed: ## Seed database in Docker
	@echo "$(YELLOW)Seeding database in Docker...$(RESET)"
	@docker compose exec backend npm run db:seed
	@echo "$(GREEN)✅ Database seeded successfully$(RESET)"

docker-db-reset: ## Reset database in Docker
	@echo "$(YELLOW)Resetting database in Docker...$(RESET)"
	@docker compose exec backend npm run db:reset
	@echo "$(GREEN)✅ Database reset completed$(RESET)"

docker-db-studio: ## Open Prisma Studio from Docker container
	@echo "$(YELLOW)Opening Prisma Studio...$(RESET)"
	@echo "Forwarding port 5555 from the container. Access Prisma Studio at http://localhost:5555"
	@docker compose exec backend npm run db:studio

# =================================================================
# TESTING
# =================================================================

test: ## Run all tests locally
	@echo "$(YELLOW)Running tests...$(RESET)"
	@npm run test
	@echo "$(GREEN)✅ Tests completed$(RESET)"

test-backend: ## Run backend tests only locally
	@echo "$(YELLOW)Running backend tests...$(RESET)"
	@cd packages/backend && npm run test
	@echo "$(GREEN)✅ Backend tests completed$(RESET)"

test-frontend: ## Run frontend tests only locally
	@echo "$(YELLOW)Running frontend tests...$(RESET)"
	@cd packages/frontend && npm run test -- --run
	@echo "$(GREEN)✅ Frontend tests completed$(RESET)"

test-e2e: ## Run end-to-end tests locally
	@echo "$(YELLOW)Running end-to-end tests...$(RESET)"
	@cd packages/backend && npm run test:e2e
	@echo "$(GREEN)✅ E2E tests completed$(RESET)"

# =================================================================
# LINTING & FORMATTING
# =================================================================

lint: ## Run linting
	@echo "$(YELLOW)Running linting...$(RESET)"
	@npm run lint
	@echo "$(GREEN)✅ Linting completed$(RESET)"

lint-fix: ## Fix linting issues
	@echo "$(YELLOW)Fixing linting issues...$(RESET)"
	@npm run lint:fix
	@echo "$(GREEN)✅ Linting issues fixed$(RESET)"

format: ## Format code
	@echo "$(YELLOW)Formatting code...$(RESET)"
	@npm run format
	@echo "$(GREEN)✅ Code formatted$(RESET)"

format-check: ## Check code formatting
	@echo "$(YELLOW)Checking code formatting...$(RESET)"
	@npm run format:check
	@echo "$(GREEN)✅ Code formatting check completed$(RESET)"

# =================================================================
# CLEANING
# =================================================================

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	@npm run clean
	@echo "$(GREEN)✅ Build artifacts cleaned$(RESET)"

clean-all: ## Deep clean - remove all node_modules and build artifacts
	@echo "$(YELLOW)Deep cleaning all artifacts...$(RESET)"
	@npm run clean:all
	@echo "$(GREEN)✅ Deep clean completed$(RESET)"

clean-artifacts: ## Remove TypeScript artifacts (.d.ts, .tsbuildinfo)
	@echo "$(YELLOW)Cleaning TypeScript artifacts...$(RESET)"
	@npm run clean:artifacts
	@echo "$(GREEN)✅ TypeScript artifacts cleaned$(RESET)"

# =================================================================
# SETUP
# =================================================================

setup: install ## Initial project setup
	@echo "$(BLUE)🚀 Setting up Financial Data Pipeline...$(RESET)"
	@echo "$(GREEN)✅ Project setup completed! Now run 'make docker-up' to start the development environment.$(RESET)"

setup-full: setup docker-up docker-db-migrate docker-db-seed ## Complete setup including database
	@echo "$(GREEN)✅ Full setup completed!$(RESET)"

# =================================================================
# CI/CD
# =================================================================

ci: lint test format-check docker-build-prod ## Run CI pipeline
	@echo "$(GREEN)✅ CI pipeline completed successfully!$(RESET)"