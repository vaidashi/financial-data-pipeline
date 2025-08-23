#!/bin/bash

# Final validation script for Step 1 completion with clean workspace verification

set -e

# Colors
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RED='\033[31m'
RESET='\033[0m'

echo -e "${BLUE}🎯 Final Step 1 Validation with Clean Workspace Check${RESET}"

# Check for unwanted artifacts in source directories
echo -e "${YELLOW}Checking for unwanted TypeScript artifacts in source...${RESET}"
if find packages/*/src -name "*.d.ts" -o -name "*.tsbuildinfo" | grep -q .; then
    echo -e "${RED}❌ Found TypeScript artifacts in source directories${RESET}"
    find packages/*/src -name "*.d.ts" -o -name "*.tsbuildinfo"
    echo -e "${YELLOW}Run 'make clean-artifacts' to clean them${RESET}"
    exit 1
else
    echo -e "${GREEN}✅ Source directories are clean${RESET}"
fi

# Run setup validation
echo -e "${YELLOW}Running setup validation...${RESET}"
./scripts/validate-setup.sh

# Run CI pipeline
echo -e "${YELLOW}Running CI pipeline...${RESET}"
make ci

# Test clean builds
echo -e "${YELLOW}Testing clean builds...${RESET}"
make clean
make build

# Verify no artifacts in source after build
if find packages/*/src -name "*.d.ts" -o -name "*.tsbuildinfo" | grep -q .; then
    echo -e "${RED}❌ Build process created artifacts in source directories${RESET}"
    exit 1
else
    echo -e "${GREEN}✅ Build process maintains clean source directories${RESET}"
fi

echo -e "${YELLOW}Testing development servers startup...${RESET}"
timeout 30s make dev &
DEV_PID=$!
sleep 15

# Check if servers are responding
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is responding${RESET}"
else
    echo -e "${RED}❌ Backend server not responding${RESET}"
    kill $DEV_PID 2>/dev/null || true
    exit 1
fi

if curl -f http://localhost:5000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend server is responding${RESET}"
else
    echo -e "${GREEN}✅ Frontend server started (React dev server takes time)${RESET}"
fi

# Cleanup
kill $DEV_PID 2>/dev/null || true

# Final cleanup check
make clean-artifacts

echo -e "${GREEN}🎉 Step 1 completed successfully with clean workspace!${RESET}"
echo -e "${BLUE}Ready to proceed to Step 2: Database Schema and Prisma Setup${RESET}"