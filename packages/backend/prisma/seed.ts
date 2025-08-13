import { PrismaClient } from '@prisma/client';
import { InstrumentType, UserRole, DataInterval, FinancialInstrument } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@financial-pipeline.com' },
    update: {},
    create: {
      email: 'admin@financial-pipeline.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
      preferences: {
        theme: 'dark',
        currency: 'USD',
        timezone: 'UTC',
      },
    },
  });

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@financial-pipeline.com' },
    update: {},
    create: {
      email: 'demo@financial-pipeline.com',
      username: 'demo',
      password: demoPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.USER,
      emailVerified: true,
    },
  });

  // Create financial instruments (popular stocks)
  const instruments = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: InstrumentType.STOCK,
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      description:
        'Apple Inc. designs, manufactures, and markets consumer electronics, computer software, and online services.',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      type: InstrumentType.STOCK,
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Internet Software/Services',
      description: 'Alphabet Inc. provides online advertising services and web-based search.',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      type: InstrumentType.STOCK,
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Software',
      description: 'Microsoft Corporation develops and licenses consumer and enterprise software.',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      type: InstrumentType.STOCK,
      exchange: 'NASDAQ',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      description:
        'Tesla, Inc. designs, develops, manufactures, and sells electric vehicles and energy generation systems.',
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com, Inc.',
      type: InstrumentType.STOCK,
      exchange: 'NASDAQ',
      sector: 'Consumer Cyclical',
      industry: 'Internet Retail',
      description: 'Amazon.com, Inc. provides online retail shopping services.',
    },
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin USD',
      type: InstrumentType.CRYPTO,
      exchange: 'CRYPTO',
      sector: 'Cryptocurrency',
      industry: 'Digital Currency',
      description: 'Bitcoin is a decentralized digital currency.',
      currency: 'USD',
    },
    {
      symbol: 'ETH-USD',
      name: 'Ethereum USD',
      type: InstrumentType.CRYPTO,
      exchange: 'CRYPTO',
      sector: 'Cryptocurrency',
      industry: 'Digital Currency',
      description: 'Ethereum is a decentralized platform for smart contracts.',
      currency: 'USD',
    },
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      type: InstrumentType.ETF,
      exchange: 'NYSE',
      sector: 'Financial Services',
      industry: 'Exchange Traded Fund',
      description: 'The SPDR S&P 500 ETF Trust seeks to track the S&P 500 Index.',
    },
  ];

  const createdInstruments: FinancialInstrument[] = [];

  for (const instrument of instruments) {
    const created = await prisma.financialInstrument.upsert({
      where: { symbol: instrument.symbol },
      update: {},
      create: instrument,
    });
    createdInstruments.push(created);
  }

  // Create sample market data
  const now = new Date();

  // Only for stocks
  for (const instrument of createdInstruments.slice(0, 5)) {
    // Create daily market data for the last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const basePrice = Math.random() * 200 + 50; // Random price between 50-250
      const volatility = 0.02; // 2% daily volatility

      const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
      const close = open * (1 + (Math.random() - 0.5) * volatility);
      const high = Math.max(open, close) * (1 + (Math.random() * volatility) / 2);
      const low = Math.min(open, close) * (1 - (Math.random() * volatility) / 2);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;

      await prisma.marketData.upsert({
        where: {
          instrumentId_timestamp_interval: {
            instrumentId: instrument.id,
            timestamp: date,
            interval: DataInterval.DAILY,
          },
        },
        update: {},
        create: {
          instrumentId: instrument.id,
          timestamp: date,
          open,
          high,
          low,
          close,
          adjustedClose: close,
          volume,
          interval: DataInterval.DAILY,
          source: 'SEED_DATA',
        },
      });
    }

    // Create real-time quote
    const lastPrice = Math.random() * 200 + 50;

    await prisma.realTimeQuote.upsert({
      where: { instrumentId: instrument.id },
      update: {
        price: lastPrice,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: now,
      },
      create: {
        instrumentId: instrument.id,
        price: lastPrice,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: now,
        source: 'SEED_DATA',
      },
    });
  }

  // Create demo user's portfolio
  const demoPortfolio = await prisma.portfolio.create({
    data: {
      userId: demoUser.id,
      name: 'Demo Portfolio',
      description: 'Sample portfolio for demonstration',
      isDefault: true,
      currency: 'USD',
    },
  });

  // Add some positions to the demo portfolio
  const positions = [
    { symbol: 'AAPL', quantity: 10, price: 150 },
    { symbol: 'GOOGL', quantity: 5, price: 120 },
    { symbol: 'MSFT', quantity: 8, price: 300 },
  ];

  for (const position of positions) {
    const instrument = createdInstruments.find(i => i.symbol === position.symbol);

    if (instrument) {
      await prisma.portfolioItem.create({
        data: {
          portfolioId: demoPortfolio.id,
          instrumentId: instrument.id,
          quantity: position.quantity,
          averagePrice: position.price,
          totalCost: position.quantity * position.price,
        },
      });

      // Create corresponding transactions
      await prisma.transaction.create({
        data: {
          userId: demoUser.id,
          portfolioId: demoPortfolio.id,
          instrumentId: instrument.id,
          type: 'BUY',
          quantity: position.quantity,
          price: position.price,
          totalAmount: position.quantity * position.price,
          executedAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Create demo user's watchlist
  const demoWatchlist = await prisma.watchlist.create({
    data: {
      userId: demoUser.id,
      name: 'Tech Stocks',
      description: 'Technology sector watchlist',
      isDefault: true,
    },
  });

  // Add instruments to watchlist
  for (const instrument of createdInstruments.slice(0, 6)) {
    await prisma.watchlistItem.create({
      data: {
        watchlistId: demoWatchlist.id,
        instrumentId: instrument.id,
        addedPrice: Math.random() * 200 + 50,
      },
    });
  }

  // Sample data sources
  const dataSources = [
    {
      name: 'Alpha Vantage',
      type: 'API',
      url: 'https://www.alphavantage.co/query',
      rateLimitRpm: 5,
      isActive: true,
    },
    {
      name: 'IEX Cloud',
      type: 'API',
      url: 'https://cloud.iexapis.com/stable',
      rateLimitRpm: 100,
      isActive: true,
    },
    {
      name: 'Yahoo Finance',
      type: 'WEBSOCKET',
      url: 'wss://streamer.finance.yahoo.com/',
      isActive: false,
    },
  ];

  for (const source of dataSources) {
    await prisma.dataSource.upsert({
      where: { name: source.name },
      update: {},
      create: source,
    });
  }

  // Sample news
  const sampleNews = [
    {
      instrumentId: createdInstruments.find(i => i.symbol === 'AAPL')!.id,
      title: 'Apple Reports Strong Q4 Earnings',
      summary: 'Apple Inc. reported better than expected quarterly results...',
      source: 'Financial News',
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      sentiment: 0.7,
      relevanceScore: 0.9,
      tags: ['earnings', 'quarterly-results'],
    },
    {
      instrumentId: createdInstruments.find(i => i.symbol === 'TSLA')!.id,
      title: 'Tesla Announces New Model Launch',
      summary: 'Tesla Inc. unveiled its latest electric vehicle model...',
      source: 'Tech Daily',
      publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      sentiment: 0.5,
      relevanceScore: 0.8,
      tags: ['product-launch', 'electric-vehicles'],
    },
  ];

  for (const news of sampleNews) {
    await prisma.news.create({
      data: news,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@financial-pipeline.com / admin123`);
  console.log(`👤 Demo user: demo@financial-pipeline.com / demo123`);
  console.log(`📊 Created ${createdInstruments.length} financial instruments`);
  console.log(`📈 Generated sample market data and portfolio`);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
