# =================================================================
# BUILDER STAGE
# =================================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy root package.json and package-lock.json
COPY package.json package-lock.json ./

# Install all dependencies for the monorepo
RUN npm install

# Copy the entire monorepo context
COPY . .

# Build the frontend application
RUN npm run build -w frontend

# =================================================================
# PRODUCTION STAGE
# =================================================================
FROM nginx:stable-alpine

# Copy the Nginx configuration file
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Expose the port Nginx runs on
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
