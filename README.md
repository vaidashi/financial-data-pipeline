# Financial Data Pipeline

A work in progress of a real-time financial data monitoring system with predictive analytics, built with modern technologies for scalability and performance.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend**: NestJS API with TypeScript
- **Frontend**: React application with TypeScript
- **Infrastructure**: Docker, PostgreSQL, Redis, Kafka, Prometheus, Grafana

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-data-pipeline
   make setup-full
   make dev

1. **Available Commands**
    ```bash
    make dev          # Start development servers (both frontend and backend)
    make build        # Build all packages
    make test         # Run all tests
    make lint         # Run linting
    make format       # Format code

    make docker-up    # Start Docker services
    make docker-down  # Stop Docker services  
    make docker-build # Build Docker images

    make clean        # Clean build artifacts and node_modules
    make setup-full   # Project initial setup and db init/seed
    make ci           # Run CI pipeline locally
    make help         # Show all available commands

    # Backend tests only
    npm run test -w backend

    # Frontend tests only  
    npm run test -w frontend

    # Watch mode
    npm run test:watch -w backend
    npm run test:watch -w frontend

    # Coverage
    npm run test:cov -w backend
    npm run test:coverage -w frontend

    # Code Quality Checks
    make lint         # Check linting
    make lint-fix     # Fix linting issues
    make format       # Format code
    make format-check # Check formatting