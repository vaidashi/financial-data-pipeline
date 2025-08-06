.PHONY: help install dev build test lint clean clean-all clean-artifacts docker-up docker-down docker-build format setup ci

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
	@npm run docker:up
	@echo "$(GREEN)✅ Docker services started$(RESET)"

docker-down: ## Stop Docker services
	@echo "$(YELLOW)Stopping Docker services...$(RESET)"
	@npm run docker:down
	@echo "$(GREEN)✅ Docker services stopped$(RESET)"

docker-build: ## Build Docker images
	@echo "$(YELLOW)Building Docker images...$(RESET)"
	@npm run docker:build
	@echo "$(GREEN)✅ Docker images built$(RESET)"

setup: clean-artifacts ## Initial project setup
	@echo "$(BLUE)🚀 Setting up Financial Data Pipeline...$(RESET)"
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh
	@make clean-artifacts
	@echo "$(GREEN)✅ Project setup completed!$(RESET)"

ci: lint