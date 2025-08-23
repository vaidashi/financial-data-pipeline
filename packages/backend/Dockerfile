# Use a complete Node image with all dependencies included
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/backend/prisma ./packages/backend/prisma

# Install dependencies
RUN npm install

# Copy source code
COPY packages/backend ./packages/backend

# Generate Prisma client (binary mode to avoid downloads)
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"
RUN cd packages/backend && npx prisma generate

# Build the app
RUN npm run build -w backend

# Production stage - use same image to avoid compatibility issues
FROM node:20

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Copy built files and dependencies
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/node_modules ./node_modules

# Set working directory to backend for running the app
WORKDIR /app/packages/backend

# Expose port
EXPOSE 3001

# Start the app
CMD ["node", "dist/main"]