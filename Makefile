.PHONY: help install dev build test lint clean docker-up docker-down docker-build format setup ci db-setup db-migrate db-reset db-seed db-studio api-test

# Colors for output
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
RESET := \033[0m

# Default target
help: ## Show this help message
	@echo "$(BLUE)Financial Data Pipeline - Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "$(YELLOW)Installing dependencies...$(RESET)"
	@npm run install:all
	@echo "$(GREEN)✅ Dependencies installed successfully$(RESET)"

dev: ## Start development servers
	@echo "$(YELLOW)Starting development servers...$(RESET)"
	@npm run dev

build: ## Build all packages
	@echo "$(YELLOW)Building all packages...$(RESET)"
	@npm run build
	@echo "$(GREEN)✅ Build completed successfully$(RESET)"

test: ## Run all tests
	@echo "$(YELLOW)Running tests...$(RESET)"
	@npm run test
	@echo "$(GREEN)✅ Tests completed$(RESET)"

test-watch: ## Run tests in watch mode
	@echo "$(YELLOW)Running tests in watch mode...$(RESET)"
	@npm run test:watch

test-e2e: ## Run end-to-end tests
	@echo "$(YELLOW)Running end-to-end tests...$(RESET)"
	@cd packages/backend && npm run test:e2e
	@echo "$(GREEN)✅ E2E tests completed$(RESET)"

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

docker-up: ## Start Docker services
	@echo "$(YELLOW)Starting Docker services...$(RESET)"
	@docker compose up -d
	@echo "$(GREEN)✅ Docker services started$(RESET)"
	@echo "$(BLUE)Services available at:$(RESET)"
	@echo "  📊 Adminer (DB): http://localhost:8080"
	@echo "  🔴 Redis Commander: http://localhost:8081"

docker-down: ## Stop Docker services
	@echo "$(YELLOW)Stopping Docker services...$(RESET)"
	@docker compose down
	@echo "$(GREEN)✅ Docker services stopped$(RESET)"

docker-build: ## Build Docker images
	@echo "$(YELLOW)Building Docker images...$(RESET)"
	@docker compose build
	@echo "$(GREEN)✅ Docker images built$(RESET)"

docker-logs: ## View Docker logs
	@docker compose logs -f

# Database Commands
db-setup: docker-up ## Set up database with Docker and run initial migration
	@echo "$(YELLOW)Setting up database...$(RESET)"
	@sleep 5  # Wait for PostgreSQL to be ready
	@cd packages/backend && npm run db:migrate
	@echo "$(GREEN)✅ Database setup completed$(RESET)"

db-migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(RESET)"
	@cd packages/backend && npm run db:migrate
	@echo "$(GREEN)✅ Database migrations completed$(RESET)"

db-migrate-deploy: ## Deploy migrations to production
	@echo "$(YELLOW)Deploying database migrations...$(RESET)"
	@cd packages/backend && npm run db:migrate:deploy
	@echo "$(GREEN)✅ Database migrations deployed$(RESET)"

db-reset: ## Reset database and run migrations
	@echo "$(YELLOW)Resetting database...$(RESET)"
	@cd packages/backend && npm run db:reset
	@echo "$(GREEN)✅ Database reset completed$(RESET)"

db-seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(RESET)"
	@cd packages/backend && npm run db:seed
	@echo "$(GREEN)✅ Database seeded successfully$(RESET)"

db-studio: ## Open Prisma Studio
	@echo "$(YELLOW)Opening Prisma Studio...$(RESET)"
	@cd packages/backend && npm run db:studio

db-generate: ## Generate Prisma client
	@echo "$(YELLOW)Generating Prisma client...$(RESET)"
	@cd packages/backend && npm run db:generate
	@echo "$(GREEN)✅ Prisma client generated$(RESET)"

# API Testing Commands
api-test: ## Test API endpoints
	@echo "$(YELLOW)Testing API endpoints...$(RESET)"
	@curl -f http://localhost:3001/api/v1/health > /dev/null && echo "$(GREEN)✅ Health endpoint working$(RESET)" || echo "$(RED)❌ Health endpoint failed$(RESET)"
	@curl -f http://localhost:3001/api/v1/instruments > /dev/null && echo "$(GREEN)✅ Instruments endpoint working$(RESET)" || echo "$(RED)❌ Instruments endpoint failed$(RESET)"

api-docs: ## Open API documentation
	@echo "$(YELLOW)Opening API documentation...$(RESET)"
	@open http://localhost:3001/api/docs || xdg-open http://localhost:3001/api/docs

setup: clean-artifacts ## Initial project setup
	@echo "$(BLUE)🚀 Setting up Financial Data Pipeline...$(RESET)"
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh
	@make clean-artifacts
	@echo "$(GREEN)✅ Project setup completed!$(RESET)"

setup-full: setup db-setup db-seed ## Complete setup including database
	@echo "$(GREEN)✅ Full setup completed!$(RESET)"
	@echo "$(BLUE)Available services:$(RESET)"
	@echo "  🚀 Backend API: http://localhost:3001"
	@echo "  📚 API Docs: http://localhost:3001/api/docs"
	@echo "  🎨 Frontend: http://localhost:3000"
	@echo "  📊 Adminer: http://localhost:8080"
	@echo "  🔴 Redis Commander: http://localhost:8081"

ci: lint format-check test build ## Run CI pipeline locally
	@echo "$(GREEN)✅ CI pipeline completed successfully!$(RESET)"

check-deps: ## Check for outdated dependencies
	@echo "$(YELLOW)Checking for outdated dependencies...$(RESET)"
	@npm outdated || true

update-deps: ## Update dependencies
	@echo "$(YELLOW)Updating dependencies...$(RESET)"
	@npm update

reset: clean install ## Reset project (clean + install)
	@echo "$(GREEN)✅ Project reset completed$(RESET)"