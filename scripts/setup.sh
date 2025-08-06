#!/bin/bash

# Script to set up the development environment with clean workspace

set -e

# Colors for output
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

echo -e "${BLUE}🚀 Setting up Financial Data Pipeline development environment...${RESET}"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is not supported. Please install Node.js >= $REQUIRED_NODE_VERSION${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version check passed: $NODE_VERSION${RESET}"

# Check npm version
NPM_VERSION=$(npm --version)
REQUIRED_NPM_VERSION="9.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NPM_VERSION" "$NPM_VERSION" | sort -V | head -n1)" != "$REQUIRED_NPM_VERSION" ]; then
    echo -e "${RED}❌ npm version $NPM_VERSION is not supported. Please install npm >= $REQUIRED_NPM_VERSION${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ npm version check passed: $NPM_VERSION${RESET}"

# Clean any existing artifacts first
echo -e "${YELLOW}🧹 Cleaning existing build artifacts...${RESET}"
if [ -f "package.json" ]; then
    npm run clean:all 2>/dev/null || true
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${RESET}"
npm install

# Set up git hooks
echo -e "${YELLOW}🎣 Setting up git hooks...${RESET}"
npm run prepare

# Create environment files
echo -e "${YELLOW}📄 Creating environment files...${RESET}"
if [ ! -f packages/backend/.env ]; then
    cp packages/backend/.env.example packages/backend/.env
    echo -e "${GREEN}Created packages/backend/.env${RESET}"
fi

if [ ! -f packages/frontend/.env ]; then
    cp packages/frontend/.env.example packages/frontend/.env
    echo -e "${GREEN}Created packages/frontend/.env${RESET}"
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${RESET}"
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p data/kafka
mkdir -p prometheus_data
mkdir -p grafana_data
mkdir -p docker/postgres
mkdir -p docker/redis
mkdir -p docker/kafka
mkdir -p docs/api
mkdir -p docs/architecture

# Clean up any TypeScript artifacts that might have been generated during install
echo -e "${YELLOW}🧹 Final cleanup of TypeScript artifacts...${RESET}"
npm run clean:artifacts 2>/dev/null || true

# Create .gitkeep files for empty directories
touch logs/.gitkeep
touch data/.gitkeep
touch docs/api/.gitkeep
touch docs/architecture/.gitkeep

echo -e "${GREEN}✅ Development environment setup complete!${RESET}"
echo ""
echo -e "${BLUE}Next steps:${RESET}"
echo -e "1. Review and update .env files as needed"
echo -e "2. Run '${YELLOW}make dev${RESET}' to start development servers"
echo -e "3. Run '${YELLOW}make docker-up${RESET}' to start supporting services (will be available in next step)"
echo ""
echo -e "${BLUE}Available commands:${RESET}"
echo -e "  ${GREEN}make help${RESET}           - Show all available commands"
echo -e "  ${GREEN}make dev${RESET}            - Start development servers"
echo -e "  ${GREEN}make build${RESET}          - Build all packages"
echo -e "  ${GREEN}make test${RESET}           - Run tests"
echo -e "  ${GREEN}make lint${RESET}           - Run linting"
echo -e "  ${GREEN}make clean-artifacts${RESET} - Clean TypeScript artifacts"
echo -e "  ${GREEN}make clean-all${RESET}      - Deep clean everything"