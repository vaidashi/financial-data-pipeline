# Database Schema Documentation

## Overview
The Financial Data Pipeline uses PostgreSQL as the primary database with Prisma ORM for type-safe database operations.

## Schema Structure

### User Management
- **Users**: Core user accounts with authentication
- **UserSessions**: JWT refresh token management  
- **ApiKeys**: API access keys for programmatic access

### Financial Data
- **FinancialInstruments**: Stocks, ETFs, crypto, bonds, etc.
- **MarketData**: Historical OHLCV data with multiple intervals
- **RealTimeQuotes**: Current market prices and metrics

### Portfolio Management  
- **Portfolios**: User investment portfolios
- **PortfolioItems**: Individual positions within portfolios
- **Transactions**: Buy/sell/dividend transaction history

### Analytics & Monitoring
- **Predictions**: ML model predictions and accuracy tracking
- **SentimentAnalysis**: News and social sentiment scores
- **TechnicalIndicators**: RSI, MACD, moving averages, etc.

### Alerts & Watchlists
- **Watchlists**: User-curated instrument lists
- **Alerts**: Price and condition-based notifications

### System Monitoring
- **DataSources**: External API management
- **SystemMetrics**: Performance and health metrics
- **AuditLogs**: User action tracking

## Key Features

### Scalability
- Indexed queries for performance
- Partitioned time-series data support
- Optimized for real-time updates

### Data Integrity
- Foreign key constraints
- Enum types for data consistency
- JSON fields for flexible metadata

### Security
- Bcrypt password hashing
- JWT token management
- Role-based access control
- Audit logging

## Development

### Local Setup
```bash
make docker-up         # Start PostgreSQL and Redis
make db-setup          # Run migrations
make db-seed           # Add sample data
make db-studio         # Open Prisma Studio