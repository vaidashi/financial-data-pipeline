import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL')!,
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    // Log query events in development
    if (this.configService.get('NODE_ENV') === 'development') {
      this.$on('query' as never, (e: any) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('📝 Database disconnected');
  }

  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      throw new Error('Database is unhealthy');
    }
  }

  async getConnectionInfo(): Promise<{
    version: string;
    activeConnections: number;
    databaseSize: string;
  }> {
    try {
      const [versionResult, connectionsResult, sizeResult] = await Promise.all([
        this.$queryRaw`SELECT version()` as Promise<[{ version: string }]>,
        this.$queryRaw`SELECT count(*) as count FROM pg_stat_activity` as Promise<
          [{ count: bigint }]
        >,
        this
          .$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size` as Promise<
          [{ size: string }]
        >,
      ]);

      return {
        version: versionResult[0].version,
        activeConnections: Number(connectionsResult[0].count),
        databaseSize: sizeResult[0].size,
      };
    } catch (error) {
      this.logger.error('Failed to get database info:', error);
      throw error;
    }
  }
}
