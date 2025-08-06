#!/bin/bash

# Script to clean up workspace and maintain organization

set -e

# Colors
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

echo -e "${BLUE}🧹 Cleaning workspace...${RESET}"

# Function to remove files matching pattern
remove_files() {
    pattern=$1
    description=$2
    
    echo -e "${YELLOW}Removing $description...${RESET}"
    find . -name "$pattern" -type f -not -path "./node_modules/*" -not -path "./packages/*/node_modules/*" -delete 2>/dev/null || true
}

# Function to remove directories
remove_dirs() {
    pattern=$1
    description=$2
    
    echo -e "${YELLOW}Removing $description directories...${RESET}"
    find . -name "$pattern" -type d -not -path "./node_modules/*" -not -path "./packages/*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
}

# Remove TypeScript build artifacts
remove_files "*.d.ts" "TypeScript declaration files"
remove_files "*.d.ts.map" "TypeScript declaration maps"
remove_files "*.tsbuildinfo" "TypeScript build info files"

# Remove build directories
remove_dirs "dist" "build output"
remove_dirs "build" "build output"

# Remove coverage directories
remove_dirs "coverage" "coverage reports"

# Remove cache directories
remove_dirs ".cache" "cache"
remove_dirs ".parcel-cache" "parcel cache"

# Preserve source declaration files
echo -e "${YELLOW}Preserving source declaration files...${RESET}"
# This ensures we don't accidentally remove intentional .d.ts files in src directories

echo -e "${GREEN}✅ Workspace cleaned successfully!${RESET}"

# Show current workspace structure
echo -e "${BLUE}Current workspace structure:${RESET}"
tree -I 'node_modules|.git' -L 3 . 2>/dev/null || find . -type d -not -path "./node_modules/*" -not -path "./.git/*" | head -20