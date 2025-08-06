#!/bin/bash

# Script to validate the development environment setup

set -e

# Colors for output
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

echo -e "${BLUE}🔍 Validating development environment setup...${RESET}"

# Check if required files exist
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${RESET}"
    else
        echo -e "${RED}❌ $1 missing${RESET}"
        exit 1
    fi
}

# Check if required directories exist
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${RESET}"
    else
        echo -e "${RED}❌ $1 missing${RESET}"
        exit 1
    fi
}

echo -e "${YELLOW}Checking project structure...${RESET}"

# Check root files
check_file "package.json"
check_file "tsconfig.base.json"
check_file ".eslintrc.js"
check_file ".prettierrc"
check_file ".gitignore"
check_file "Makefile"

# Check directories
check_directory "packages"
check_directory "packages/backend"
check_directory "packages/frontend"
check_directory "scripts"

# Check backend files
echo -e "${YELLOW}Checking backend structure...${RESET}"
check_file "packages/backend/package.json"
check_file "packages/backend/tsconfig.json"
check_file "packages/backend/nest-cli.json"
check_file "packages/backend/src/main.ts"
check_file "packages/backend/src/app.module.ts"
check_file "packages/backend/src/app.controller.ts"
check_file "packages/backend/src/app.service.ts"

# Check frontend files
echo -e "${YELLOW}Checking frontend structure...${RESET}"
check_file "packages/frontend/package.json"
check_file "packages/frontend/tsconfig.json"
check_file "packages/frontend/vite.config.ts"
check_file "packages/frontend/index.html"
check_file "packages/frontend/src/main.tsx"
check_file "packages/frontend/src/App.tsx"

# Check if dependencies are installed
echo -e "${YELLOW}Checking dependencies...${RESET}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Root dependencies installed${RESET}"
else
    echo -e "${RED}❌ Root dependencies not installed. Run 'npm install'${RESET}"
    exit 1
fi

if [ -d "packages/backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${RESET}"
else
    echo -e "${RED}❌ Backend dependencies not installed${RESET}"
    exit 1
fi

if [ -d "packages/frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${RESET}"
else
    echo -e "${RED}❌ Frontend dependencies not installed${RESET}"
    exit 1
fi

# Test build
echo -e "${YELLOW}Testing builds...${RESET}"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build test passed${RESET}"
else
    echo -e "${RED}❌ Build test failed${RESET}"
    exit 1
fi

# Test linting
echo -e "${YELLOW}Testing linting...${RESET}"
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Linting test passed${RESET}"
else
    echo -e "${RED}❌ Linting test failed${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ All validation checks passed!${RESET}"